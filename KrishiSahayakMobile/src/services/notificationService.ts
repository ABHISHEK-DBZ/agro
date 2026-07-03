// Notification Service — Push notifications & local alerts via expo-notifications
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import storageService, { KEYS } from './storage';

// Configure notification handler — show alerts even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  triggerAt: Date;
}

class NotificationService {
  private initialized = false;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create notification channels (Android)
      if (Platform.OS === 'android') {
        await this.createChannels();
      }

      // Request permissions
      const granted = await this.requestPermissions();
      if (!granted) {
        console.warn('[NotificationService] Permission denied');
      }

      this.initialized = true;
      console.log('[NotificationService] Initialized successfully');
    } catch (error) {
      console.error('[NotificationService] Init error:', error);
    }
  }

  /**
   * Create notification channels for different alert types
   */
  private async createChannels(): Promise<void> {
    const channels = [
      {
        id: 'weather_alerts',
        name: 'Weather Alerts',
        description: 'Severe weather warnings and advisories',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF8F00',
      },
      {
        id: 'price_alerts',
        name: 'Market Price Alerts',
        description: 'Price changes and market notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B7A3D',
      },
      {
        id: 'recommendations',
        name: 'Farming Recommendations',
        description: 'Daily tips and agricultural advice',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 100, 100, 100],
        lightColor: '#0284C7',
      },
      {
        id: 'general',
        name: 'General Notifications',
        description: 'App updates and general information',
        importance: Notifications.AndroidImportance.DEFAULT,
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, channel);
      console.log(`[NotificationService] Channel created: ${channel.id}`);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await Notifications.getPermissionsAsync();
      const perm = permission as any;
      const granted = perm.granted || perm.status === 'granted';

      if (!granted) {
        const requested = await Notifications.requestPermissionsAsync() as any;
        return requested.granted || requested.status === 'granted';
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Permission request error:', error);
      return false;
    }
  }

  /**
   * Get Expo push token
   */
  async getPushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('[NotificationService] Get push token error:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput,
    channelId: string = 'general'
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        } as any,
        trigger: trigger || null,
      });
      return id;
    } catch (error) {
      console.error('[NotificationService] Schedule error:', error);
      return null;
    }
  }

  /**
   * Schedule a weather alert notification immediately
   */
  async sendWeatherAlert(title: string, body: string): Promise<string | null> {
    return this.scheduleNotification(
      title,
      body,
      { type: 'weather_alert' },
      null,
      'weather_alerts'
    );
  }

  /**
   * Schedule a market price alert immediately
   */
  async sendPriceAlert(title: string, body: string): Promise<string | null> {
    return this.scheduleNotification(
      title,
      body,
      { type: 'price_alert' },
      null,
      'price_alerts'
    );
  }

  /**
   * Schedule a daily weather briefing
   */
  async scheduleDailyBriefing(hour: number = 6, minute: number = 0): Promise<string | null> {
    return this.scheduleNotification(
      '🌤️ Your Daily Weather Briefing',
      'Tap to see today\'s weather forecast and farming recommendations.',
      { type: 'daily_briefing' },
      {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        repeats: true,
        seconds: 86400, // Repeat daily
      },
      'recommendations'
    );
  }

  /**
   * Send a notification for active weather alerts
   */
  async alertForSevereWeather(alertType: string, message: string): Promise<void> {
    const titles: Record<string, string> = {
      heat: '🔥 Extreme Heat Warning',
      frost: '❄️ Frost Warning',
      heavy_rain: '🌧️ Heavy Rain Alert',
      strong_wind: '💨 Strong Wind Warning',
      thunderstorm: '⛈️ Thunderstorm Alert',
    };

    const title = titles[alertType] || '⚠️ Weather Alert';
    await this.sendWeatherAlert(title, message);
  }

  /**
   * Send a price drop/spike notification
   */
  async alertForPriceChange(commodity: string, price: number, direction: 'up' | 'down', percentage: number): Promise<void> {
    const emoji = direction === 'up' ? '📈' : '📉';
    const changeText = direction === 'up' ? 'increased' : 'dropped';

    await this.sendPriceAlert(
      `${emoji} ${commodity} Price ${direction === 'up' ? 'Up' : 'Down'}!`,
      `Price ${changeText} by ${Math.abs(percentage).toFixed(1)}% — now ₹${price}/quintal`
    );
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.map(n => ({
        id: n.identifier,
        title: n.content.title || '',
        body: n.content.body || '',
        data: n.content.data as Record<string, unknown> | undefined,
        triggerAt: new Date(),
      }));
    } catch (error) {
      console.error('[NotificationService] Get scheduled error:', error);
      return [];
    }
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.error('[NotificationService] Cancel error:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[NotificationService] Cancel all error:', error);
    }
  }

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return () => subscription.remove();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
