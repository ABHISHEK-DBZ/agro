// Secure Local Storage service using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@krishi_auth_token',
  USER_PROFILE: '@krishi_user_profile',
  SETTINGS: '@krishi_settings',
  CACHED_WEATHER: '@krishi_weather_cache',
  CACHED_MARKET: '@krishi_market_cache',
  ONBOARDING_COMPLETED: '@krishi_onboarding_done',
  SELECTED_LANGUAGE: '@krishi_language',
} as const;

class StorageService {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('[Storage] Set error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[Storage] Remove error:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch {
      return [];
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[Storage] Clear error:', error);
    }
  }
}

export const storageService = new StorageService();
export { KEYS };
export default storageService;
