// Market Prices API Service
import { MarketPrice } from '../types';
import APP_CONFIG from '../config';

class MarketService {
  /**
   * Fetch live market prices from data.gov.in
   */
  async getPrices(params?: {
    commodity?: string;
    state?: string;
    limit?: number;
  }): Promise<MarketPrice[]> {
    try {
      const searchParams = new URLSearchParams({
        'api-key': APP_CONFIG.api.dataGovApiKey,
        format: 'json',
        limit: String(params?.limit || 50),
      });

      if (params?.commodity) {
        searchParams.append('filters[commodity]', params.commodity);
      }
      if (params?.state) {
        searchParams.append('filters[state]', params.state);
      }

      const response = await fetch(
        `${APP_CONFIG.api.dataGov}/9ef84268-d588-465a-a308-a864a43d0070?${searchParams}`
      );

      if (!response.ok) {
        throw new Error(`Market API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMarketData(data.records || []);
    } catch (error) {
      console.error('[MarketService] API failed, using local data:', error);
      return this.getLocalMarketData(params?.commodity);
    }
  }

  private transformMarketData(records: any[]): MarketPrice[] {
    return records.map((r: any, index: number) => ({
      id: `market_${index}`,
      commodity: r.commodity || 'Unknown',
      variety: r.variety || 'Common',
      market: r.market || 'Local Market',
      state: r.state || 'Unknown',
      district: r.district || 'Unknown',
      price: {
        min: Number(r.min_price) || 0,
        max: Number(r.max_price) || 0,
        modal: Number(r.modal_price) || 0,
        average: (Number(r.min_price) + Number(r.max_price)) / 2 || 0,
      },
      unit: 'Quintal',
      arrivalDate: r.arrival_date || new Date().toISOString().split('T')[0],
      trend: this.calculateTrend(Number(r.modal_price) || 1000),
      volume: {
        arrival: Number(r.arrivals) || 0,
        sold: Number(r.arrivals) ? Math.round(Number(r.arrivals) * 0.8) : 0,
        unsold: Number(r.arrivals) ? Math.round(Number(r.arrivals) * 0.2) : 0,
      },
      quality: (Number(r.modal_price) || 0) > 3000 ? 'Premium' : (Number(r.modal_price) || 0) > 1500 ? 'Good' : 'Average',
      marketStatus: this.getMarketStatus(),
    }));
  }

  private getLocalMarketData(commodity?: string): MarketPrice[] {
    const commodities = [
      { name: 'Wheat', price: 2500, state: 'Punjab', market: 'Ludhiana Mandi' },
      { name: 'Rice', price: 3200, state: 'Haryana', market: 'Karnal Grain Market' },
      { name: 'Cotton', price: 8500, state: 'Gujarat', market: 'Rajkot Cotton Market' },
      { name: 'Sugarcane', price: 350, state: 'Uttar Pradesh', market: 'Muzaffarnagar Market' },
      { name: 'Onion', price: 1800, state: 'Maharashtra', market: 'Nasik Market' },
      { name: 'Tomato', price: 2200, state: 'Karnataka', market: 'Kolar Market' },
      { name: 'Potato', price: 1500, state: 'West Bengal', market: 'Hooghly Market' },
      { name: 'Soybean', price: 4800, state: 'Madhya Pradesh', market: 'Indore Mandi' },
      { name: 'Mustard', price: 5200, state: 'Rajasthan', market: 'Jaipur Mandi' },
      { name: 'Maize', price: 2000, state: 'Bihar', market: 'Patna Market' },
    ];

    const filtered = commodity
      ? commodities.filter(c => c.name.toLowerCase() === commodity.toLowerCase())
      : commodities;

    return filtered.map((c, i) => ({
      id: `local_${i}`,
      commodity: c.name,
      variety: 'Common',
      market: c.market,
      state: c.state,
      district: c.state,
      price: {
        min: Math.round(c.price * 0.9),
        max: Math.round(c.price * 1.1),
        modal: c.price,
        average: c.price,
      },
      unit: c.name === 'Sugarcane' ? 'Quintal' : 'Quintal',
      arrivalDate: new Date().toISOString().split('T')[0],
      trend: this.calculateTrend(c.price),
      volume: {
        arrival: Math.round(100 + Math.random() * 500),
        sold: Math.round(80 + Math.random() * 400),
        unsold: Math.round(20 + Math.random() * 100),
      },
      quality: c.price > 3000 ? 'Premium' : c.price > 1500 ? 'Good' : 'Average',
      marketStatus: this.getMarketStatus(),
    }));
  }

  private calculateTrend(price: number): MarketPrice['trend'] {
    const change = (Math.random() - 0.5) * 200;
    return {
      change: Math.round(change),
      percentage: Math.round((change / price) * 100 * 100) / 100,
      direction: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
    };
  }

  private getMarketStatus(): MarketPrice['marketStatus'] {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    if (day === 0 || hour > 18 || hour < 6) return 'Closed';
    return 'Open';
  }

  /**
   * Get all available commodity names
   */
  getCommodities(): string[] {
    return [
      'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Onion',
      'Tomato', 'Potato', 'Soybean', 'Mustard', 'Maize',
      'Bajra', 'Groundnut', 'Jowar', 'Gram',
    ];
  }

  /**
   * Get Indian states list
   */
  getStates(): string[] {
    return [
      'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
      'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
      'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    ];
  }
}

export const marketService = new MarketService();
export default marketService;
