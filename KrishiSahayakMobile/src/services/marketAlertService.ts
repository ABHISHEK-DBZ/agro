// Market Price Alert Service — Threshold monitoring & alerts
import { MarketPrice } from '../types';
import storageService, { KEYS } from './storage';
import marketService from './market';
import notificationService from './notificationService';

export interface PriceAlertThreshold {
  id: string;
  commodity: string;
  type: 'above' | 'below';
  price: number;
  enabled: boolean;
}

export interface PriceAlertEvent {
  id: string;
  thresholdId: string;
  commodity: string;
  type: 'above' | 'below';
  thresholdPrice: number;
  currentPrice: number;
  market: string;
  timestamp: string;
  acknowledged: boolean;
}

const ALERTS_KEY = '@krishi_price_alerts';
const THRESHOLDS_KEY = '@krishi_price_thresholds';

class MarketAlertService {
  private thresholds: PriceAlertThreshold[] = [];
  private alertHistory: PriceAlertEvent[] = [];
  private checkIntervalId: NodeJS.Timeout | null = null;
  private subscribers: Set<(events: PriceAlertEvent[]) => void> = new Set();

  /**
   * Initialize — load saved thresholds
   */
  async initialize(): Promise<void> {
    try {
      const saved = await storageService.getItem<PriceAlertThreshold[]>(THRESHOLDS_KEY);
      if (saved) this.thresholds = saved;

      const history = await storageService.getItem<PriceAlertEvent[]>(ALERTS_KEY);
      if (history) this.alertHistory = history;
    } catch (error) {
      console.error('[MarketAlertService] Init error:', error);
    }
  }

  /**
   * Subscribe to new alert events
   */
  subscribe(callback: (events: PriceAlertEvent[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Get all configured thresholds
   */
  getThresholds(): PriceAlertThreshold[] {
    return [...this.thresholds];
  }

  /**
   * Add a new price alert threshold
   */
  async addThreshold(commodity: string, type: 'above' | 'below', price: number): Promise<PriceAlertThreshold> {
    const threshold: PriceAlertThreshold = {
      id: `threshold_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      commodity,
      type,
      price,
      enabled: true,
    };

    this.thresholds.push(threshold);
    await this.saveThresholds();
    return threshold;
  }

  /**
   * Remove a threshold
   */
  async removeThreshold(id: string): Promise<void> {
    this.thresholds = this.thresholds.filter(t => t.id !== id);
    await this.saveThresholds();
  }

  /**
   * Toggle threshold enabled state
   */
  async toggleThreshold(id: string): Promise<void> {
    const threshold = this.thresholds.find(t => t.id === id);
    if (threshold) {
      threshold.enabled = !threshold.enabled;
      await this.saveThresholds();
    }
  }

  /**
   * Update threshold price
   */
  async updateThresholdPrice(id: string, newPrice: number): Promise<void> {
    const threshold = this.thresholds.find(t => t.id === id);
    if (threshold) {
      threshold.price = newPrice;
      await this.saveThresholds();
    }
  }

  /**
   * Start monitoring prices against thresholds
   */
  startMonitoring(intervalMs: number = 600000): void {
    if (this.checkIntervalId) return;

    // Check immediately
    this.checkPrices();

    // Poll at interval
    this.checkIntervalId = setInterval(() => {
      this.checkPrices();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  /**
   * Check current prices against all thresholds
   */
  private async checkPrices(): Promise<void> {
    if (this.thresholds.length === 0) return;

    const enabledThresholds = this.thresholds.filter(t => t.enabled);
    if (enabledThresholds.length === 0) return;

    try {
      // Fetch current prices
      const prices = await marketService.getPrices({ limit: 50 });
      const newAlerts: PriceAlertEvent[] = [];

      for (const threshold of enabledThresholds) {
        const matchingPrice = prices.find(
          p => p.commodity.toLowerCase() === threshold.commodity.toLowerCase()
        );

        if (!matchingPrice) continue;

        const currentPrice = matchingPrice.price.modal;
        let triggered = false;

        if (threshold.type === 'above' && currentPrice >= threshold.price) {
          triggered = true;
        } else if (threshold.type === 'below' && currentPrice <= threshold.price) {
          triggered = true;
        }

        if (triggered) {
          const alert: PriceAlertEvent = {
            id: `alert_${Date.now()}_${threshold.id}`,
            thresholdId: threshold.id,
            commodity: threshold.commodity,
            type: threshold.type,
            thresholdPrice: threshold.price,
            currentPrice,
            market: matchingPrice.market,
            timestamp: new Date().toISOString(),
            acknowledged: false,
          };

          newAlerts.push(alert);

          // Send push notification
          const direction = threshold.type === 'above' ? 'increased to' : 'dropped to';
          const emoji = threshold.type === 'above' ? '📈' : '📉';
          await notificationService.sendPriceAlert(
            `${emoji} ${threshold.commodity} Price Alert!`,
            `${threshold.commodity} ${direction} ₹${currentPrice}/quintal in ${matchingPrice.market} (threshold: ₹${threshold.price})`
          );
        }
      }

      if (newAlerts.length > 0) {
        this.alertHistory = [...newAlerts, ...this.alertHistory].slice(0, 100); // Keep last 100
        await this.saveAlertHistory();
        this.notifySubscribers(newAlerts);
      }
    } catch (error) {
      console.error('[MarketAlertService] Check error:', error);
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(): PriceAlertEvent[] {
    return [...this.alertHistory];
  }

  /**
   * Clear alert history
   */
  async clearAlertHistory(): Promise<void> {
    this.alertHistory = [];
    await this.saveAlertHistory();
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(id: string): Promise<void> {
    const alert = this.alertHistory.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      await this.saveAlertHistory();
    }
  }

  /**
   * Get recommended threshold prices based on recent data
   */
  getRecommendedThresholds(): { commodity: string; currentPrice: number; highThreshold: number; lowThreshold: number }[] {
    return [
      { commodity: 'Wheat', currentPrice: 2500, highThreshold: 3000, lowThreshold: 2000 },
      { commodity: 'Rice', currentPrice: 3200, highThreshold: 3800, lowThreshold: 2600 },
      { commodity: 'Cotton', currentPrice: 8500, highThreshold: 9500, lowThreshold: 7500 },
      { commodity: 'Onion', currentPrice: 1800, highThreshold: 2500, lowThreshold: 1200 },
      { commodity: 'Tomato', currentPrice: 2200, highThreshold: 3000, lowThreshold: 1500 },
      { commodity: 'Potato', currentPrice: 1500, highThreshold: 2000, lowThreshold: 1000 },
      { commodity: 'Soybean', currentPrice: 4800, highThreshold: 5500, lowThreshold: 4000 },
      { commodity: 'Mustard', currentPrice: 5200, highThreshold: 6000, lowThreshold: 4500 },
    ];
  }

  private async saveThresholds(): Promise<void> {
    await storageService.setItem(THRESHOLDS_KEY, this.thresholds);
  }

  private async saveAlertHistory(): Promise<void> {
    await storageService.setItem(ALERTS_KEY, this.alertHistory);
  }

  private notifySubscribers(alerts: PriceAlertEvent[]): void {
    this.subscribers.forEach(cb => {
      try { cb(alerts); } catch (e) {
        console.error('[MarketAlertService] Subscriber error:', e);
      }
    });
  }
}

export const marketAlertService = new MarketAlertService();
export default marketAlertService;
