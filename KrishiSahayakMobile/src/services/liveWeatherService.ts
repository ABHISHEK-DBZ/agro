// Live Weather Service — Auto-refreshing weather with alerts & recommendations
import { WeatherData, HourlyWeather, DailyWeather, WeatherAlert } from '../types';
import APP_CONFIG from '../config';

export interface LiveWeatherAlert {
  id: string;
  type: 'heat' | 'frost' | 'heavy_rain' | 'strong_wind' | 'thunderstorm' | 'fog';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  message: string;
  recommendation: string;
  startTime: number;
  endTime: number;
}

export interface AirQualityData {
  aqi: number;
  level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
}

export interface AgriculturalRecommendation {
  category: 'irrigation' | 'spraying' | 'harvesting' | 'planting' | 'fertilizer' | 'pest_control' | 'general';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  icon: string;
}

class LiveWeatherService {
  private refreshIntervalId: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<(data: { weather: WeatherData; alerts: LiveWeatherAlert[]; recommendations: AgriculturalRecommendation[] }) => void>> = new Map();
  private currentLocation: { lat: number; lon: number; name: string } | null = null;
  private lastData: { weather: WeatherData; alerts: LiveWeatherAlert[]; recommendations: AgriculturalRecommendation[] } | null = null;

  /**
   * Subscribe to live weather updates
   */
  subscribe(
    id: string,
    callback: (data: { weather: WeatherData; alerts: LiveWeatherAlert[]; recommendations: AgriculturalRecommendation[] }) => void
  ): () => void {
    if (!this.subscribers.has(id)) {
      this.subscribers.set(id, new Set());
    }
    this.subscribers.get(id)!.add(callback);

    // Immediately deliver cached data if available
    if (this.lastData) {
      callback(this.lastData);
    }

    return () => {
      this.subscribers.get(id)?.delete(callback);
      if (this.subscribers.get(id)?.size === 0) {
        this.subscribers.delete(id);
      }
    };
  }

  /**
   * Start live updates with auto-refresh
   */
  startLiveUpdates(lat: number, lon: number, name: string, intervalMs: number = 300000): void {
    this.currentLocation = { lat, lon, name };
    this.stopLiveUpdates();

    // Fetch immediately
    this.fetchAndNotify();

    // Then poll at interval
    this.refreshIntervalId = setInterval(() => {
      this.fetchAndNotify();
    }, intervalMs);
  }

  /**
   * Stop live updates
   */
  stopLiveUpdates(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  /**
   * Manually refresh
   */
  async refresh(): Promise<void> {
    await this.fetchAndNotify();
  }

  /**
   * Get cached data
   */
  getCachedData() {
    return this.lastData;
  }

  /**
   * Change location and restart updates
   */
  updateLocation(lat: number, lon: number, name: string): void {
    this.currentLocation = { lat, lon, name };
    if (this.refreshIntervalId) {
      this.startLiveUpdates(lat, lon, name);
    }
  }

  private async fetchAndNotify(): Promise<void> {
    if (!this.currentLocation) return;

    try {
      const { lat, lon, name } = this.currentLocation;
      const rawWeather: WeatherData = await this.fetchWeatherData(lat, lon);

      // Set location name
      rawWeather.location.name = name;

      // Generate alerts from weather data
      const alerts = this.generateAlerts(rawWeather);

      // Generate agricultural recommendations
      const recommendations = this.generateRecommendations(rawWeather);

      const result = { weather: rawWeather, alerts, recommendations };
      this.lastData = result;

      // Notify all subscribers
      this.subscribers.forEach(callbacks => {
        callbacks.forEach(cb => cb(result));
      });
    } catch (error) {
      console.error('[LiveWeatherService] Fetch error:', error);
    }
  }

  private async fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    // Import dynamically to avoid circular deps
    const { weatherService } = require('./weather');
    return await weatherService.getWeather(lat, lon);
  }

  /**
   * Generate weather alerts based on current conditions
   */
  private generateAlerts(weather: WeatherData): LiveWeatherAlert[] {
    const alerts: LiveWeatherAlert[] = [];
    const now = Date.now();
    const { current, daily } = weather;

    // Heat stress alert
    if (current.temperature > 40) {
      alerts.push({
        id: `heat_${now}`,
        type: 'heat',
        severity: 'extreme',
        title: '🔥 Extreme Heat Warning',
        message: `Temperature at ${current.temperature}°C — dangerously high for crops and livestock.`,
        recommendation: 'Provide shade to sensitive crops. Increase irrigation frequency. Avoid working in fields during peak heat (11AM-4PM). Ensure livestock has adequate water and shade.',
        startTime: now,
        endTime: now + 86400000,
      });
    } else if (current.temperature > 35) {
      alerts.push({
        id: `heat_${now}`,
        type: 'heat',
        severity: 'high',
        title: '🌡️ Heat Advisory',
        message: `Temperature at ${current.temperature}°C — monitor for heat stress in crops.`,
        recommendation: 'Irrigate during early morning or evening. Apply mulch to retain soil moisture. Monitor for signs of wilting.',
        startTime: now,
        endTime: now + 86400000,
      });
    }

    // Frost alert
    if (current.temperature < 5) {
      alerts.push({
        id: `frost_${now}`,
        type: 'frost',
        severity: 'high',
        title: '❄️ Frost Warning',
        message: `Temperature dropped to ${current.temperature}°C — frost risk is high.`,
        recommendation: 'Cover sensitive crops with frost cloth or plastic. Irrigate before dawn to protect through heat release. Harvest susceptible produce immediately.',
        startTime: now,
        endTime: now + 43200000,
      });
    }

    // Heavy rain alert
    if (current.rainfall > 20) {
      alerts.push({
        id: `rain_${now}`,
        type: 'heavy_rain',
        severity: 'high',
        title: '🌧️ Heavy Rainfall Alert',
        message: `${current.rainfall.toFixed(1)}mm rainfall detected — risk of waterlogging.`,
        recommendation: 'Ensure drainage channels are clear. Delay planting if soil is saturated. Monitor for fungal diseases in standing water areas.',
        startTime: now,
        endTime: now + 43200000,
      });
    } else if (current.rainfall > 10) {
      alerts.push({
        id: `rain_${now}`,
        type: 'heavy_rain',
        severity: 'moderate',
        title: '🌦️ Moderate Rainfall',
        message: `${current.rainfall.toFixed(1)}mm rainfall — monitor field conditions.`,
        recommendation: 'Good time for soil moisture buildup. Avoid fertilizer application during heavy showers.',
        startTime: now,
        endTime: now + 21600000,
      });
    }

    // Strong wind alert
    if (current.windSpeed > 40) {
      alerts.push({
        id: `wind_${now}`,
        type: 'strong_wind',
        severity: 'high',
        title: '💨 Strong Wind Warning',
        message: `Wind speed ${current.windSpeed} km/h — can damage crops and delay spraying.`,
        recommendation: 'Secure tall crops with stakes. Delay spraying operations. Check for wind damage to structures and trellises.',
        startTime: now,
        endTime: now + 21600000,
      });
    } else if (current.windSpeed > 25) {
      alerts.push({
        id: `wind_${now}`,
        type: 'strong_wind',
        severity: 'moderate',
        title: '💨 Wind Advisory',
        message: `Wind speed ${current.windSpeed} km/h — spraying not recommended.`,
        recommendation: 'Postpone pesticide/herbicide spraying. Ideal for wind-dispersed seed planting if applicable.',
        startTime: now,
        endTime: now + 21600000,
      });
    }

    // Thunderstorm risk (from daily forecast)
    const todayHigh = daily[0]?.tempMax || current.temperature;
    const humidity = current.humidity;
    if (todayHigh > 30 && humidity > 70 && current.cloudCover > 60) {
      alerts.push({
        id: `storm_${now}`,
        type: 'thunderstorm',
        severity: 'moderate',
        title: '⛈️ Thunderstorm Possible',
        message: 'Warm, humid conditions with cloud buildup — thunderstorms possible.',
        recommendation: 'Stay alert for lightning. Unplug irrigation controllers. Move livestock to shelter if storm approaches.',
        startTime: now,
        endTime: now + 43200000,
      });
    }

    // Fog alert
    if (current.visibility < 2) {
      alerts.push({
        id: `fog_${now}`,
        type: 'fog',
        severity: 'low',
        title: '🌫️ Foggy Conditions',
        message: `Visibility reduced to ${current.visibility.toFixed(1)} km — delay morning field operations.`,
        recommendation: 'Delay spraying and harvesting until fog lifts. Drive slowly on farm roads.',
        startTime: now,
        endTime: now + 14400000,
      });
    }

    return alerts;
  }

  /**
   * Generate agricultural recommendations based on weather
   */
  private generateRecommendations(weather: WeatherData): AgriculturalRecommendation[] {
    const recs: AgriculturalRecommendation[] = [];
    const { current, agricultural } = weather;

    // Irrigation recommendation
    if (agricultural.soilMoisture < 0.3) {
      recs.push({
        category: 'irrigation',
        priority: 'high',
        title: '💧 Irrigation Needed',
        description: `Soil moisture is low (${(agricultural.soilMoisture * 100).toFixed(0)}%). Schedule irrigation soon, preferably in early morning or evening.`,
        icon: '💧',
      });
    } else if (agricultural.soilMoisture > 0.7) {
      recs.push({
        category: 'irrigation',
        priority: 'medium',
        title: '🌊 Adequate Moisture',
        description: `Soil moisture is adequate (${(agricultural.soilMoisture * 100).toFixed(0)}%). Hold off on irrigation to prevent waterlogging.`,
        icon: '🌊',
      });
    } else {
      recs.push({
        category: 'irrigation',
        priority: 'low',
        title: '✅ Moisture Normal',
        description: 'Soil moisture at optimal levels. Maintain current irrigation schedule.',
        icon: '✅',
      });
    }

    // Spraying conditions
    const sprayMap: Record<string, { priority: 'high' | 'medium' | 'low'; title: string; description: string; icon: string }> = {
      'excellent': {
        priority: 'low',
        title: '✅ Ideal for Spraying',
        description: 'Perfect spraying conditions. Proceed with scheduled pesticide or fertilizer application.',
        icon: '✅',
      },
      'good': {
        priority: 'low',
        title: '👍 Good for Spraying',
        description: 'Favorable conditions for spraying. Apply as needed.',
        icon: '👍',
      },
      'fair': {
        priority: 'medium',
        title: '⚠️ Caution for Spraying',
        description: 'Marginal conditions. Consider delaying if possible.',
        icon: '⚠️',
      },
      'poor': {
        priority: 'high',
        title: '❌ Not Ideal for Spraying',
        description: 'Poor conditions for spraying — risk of drift and poor coverage.',
        icon: '❌',
      },
      'not_recommended': {
        priority: 'high',
        title: '🚫 Do Not Spray',
        description: 'Spraying strongly not recommended due to high wind or rain risk.',
        icon: '🚫',
      },
    };

    const sprayRec = sprayMap[agricultural.sprayingConditions] || sprayMap.fair;
    recs.push({
      category: 'spraying',
      ...sprayRec,
    });

    // Frost risk
    if (agricultural.frostRisk) {
      recs.push({
        category: 'general',
        priority: 'high',
        title: '🧊 Frost Protection Needed',
        description: 'Frost risk detected! Cover sensitive plants and use protective measures tonight.',
        icon: '🧊',
      });
    }

    // Heat stress
    if (agricultural.heatStress) {
      recs.push({
        category: 'general',
        priority: 'high',
        title: '🔥 Heat Stress Management',
        description: 'Heat stress conditions. Increase water supply and provide shade to vulnerable crops.',
        icon: '🔥',
      });
    }

    // General tips from temperature
    if (current.temperature >= 20 && current.temperature <= 30 && current.humidity >= 50 && current.humidity <= 70) {
      recs.push({
        category: 'planting',
        priority: 'medium',
        title: '🌱 Favorable for Planting',
        description: 'Current conditions are excellent for transplanting seedlings and sowing seeds.',
        icon: '🌱',
      });
    }

    // Harvesting advice
    if (current.temperature >= 25 && current.temperature <= 35 && current.rainfall < 1 && current.humidity < 60) {
      recs.push({
        category: 'harvesting',
        priority: 'medium',
        title: '🌾 Good for Harvesting',
        description: 'Dry weather ideal for harvesting. Harvested grains will dry well in these conditions.',
        icon: '🌾',
      });
    }

    // Pest/disease risk
    if (current.humidity > 80 && current.temperature > 25) {
      recs.push({
        category: 'pest_control',
        priority: 'high',
        title: '🐛 High Pest & Disease Risk',
        description: 'Warm, humid conditions favor fungal diseases and pest outbreaks. Monitor crops closely.',
        icon: '🐛',
      });
    }

    // Fertilizer
    if (current.rainfall < 2 && current.humidity >= 40 && current.temperature >= 15 && current.temperature <= 30) {
      recs.push({
        category: 'fertilizer',
        priority: 'medium',
        title: '🧪 Good for Fertilizer Application',
        description: 'Favorable conditions for fertilizer application. Apply and lightly irrigate for best results.',
        icon: '🧪',
      });
    }

    return recs.slice(0, 5); // Max 5 recommendations
  }

  /**
   * Determine if any active alerts exist
   */
  hasActiveAlerts(): boolean {
    if (!this.lastData) return false;
    return this.lastData.alerts.some(a => a.severity === 'high' || a.severity === 'extreme');
  }
}

export const liveWeatherService = new LiveWeatherService();
export default liveWeatherService;
