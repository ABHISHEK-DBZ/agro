// Weather API Service
import { WeatherData, HourlyWeather, DailyWeather } from '../types';
import APP_CONFIG from '../config';

class WeatherService {
  /**
   * Get weather data from Open-Meteo API (free, no API key required)
   */
  async getWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: [
          'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
          'precipitation', 'rain', 'weather_code', 'cloud_cover',
          'pressure_msl', 'wind_speed_10m', 'wind_direction_10m',
          'wind_gusts_10m', 'uv_index', 'visibility',
        ].join(','),
        hourly: [
          'temperature_2m', 'relative_humidity_2m', 'precipitation_probability',
          'precipitation', 'weather_code', 'cloud_cover', 'wind_speed_10m',
          'uv_index',
        ].join(','),
        daily: [
          'weather_code', 'temperature_2m_max', 'temperature_2m_min',
          'apparent_temperature_max', 'apparent_temperature_min',
          'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum',
          'precipitation_probability_max', 'wind_speed_10m_max',
        ].join(','),
        timezone: 'Asia/Kolkata',
        forecast_days: '7',
      });

      const response = await fetch(
        `${APP_CONFIG.api.openMeteo}/forecast?${params}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformWeatherData(data, latitude, longitude);
    } catch (error) {
      console.error('[WeatherService] Failed to fetch weather:', error);
      throw error;
    }
  }

  /**
   * Transform Open-Meteo API response to our WeatherData format
   */
  private transformWeatherData(data: any, lat: number, lon: number): WeatherData {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    const getCondition = (code: number) => {
      const map: Record<number, { code: number; description: string; main: string }> = {
        0: { code, description: 'Clear sky', main: 'Clear' },
        1: { code, description: 'Mainly clear', main: 'Clear' },
        2: { code, description: 'Partly cloudy', main: 'Clouds' },
        3: { code, description: 'Overcast', main: 'Clouds' },
        45: { code, description: 'Foggy', main: 'Fog' },
        48: { code, description: 'Depositing rime fog', main: 'Fog' },
        51: { code, description: 'Light drizzle', main: 'Drizzle' },
        53: { code, description: 'Moderate drizzle', main: 'Drizzle' },
        55: { code, description: 'Dense drizzle', main: 'Drizzle' },
        56: { code, description: 'Light freezing drizzle', main: 'Drizzle' },
        57: { code, description: 'Dense freezing drizzle', main: 'Drizzle' },
        61: { code, description: 'Slight rain', main: 'Rain' },
        63: { code, description: 'Moderate rain', main: 'Rain' },
        65: { code, description: 'Heavy rain', main: 'Rain' },
        66: { code, description: 'Light freezing rain', main: 'Rain' },
        67: { code, description: 'Heavy freezing rain', main: 'Rain' },
        71: { code, description: 'Slight snow', main: 'Snow' },
        73: { code, description: 'Moderate snow', main: 'Snow' },
        75: { code, description: 'Heavy snow', main: 'Snow' },
        77: { code, description: 'Snow grains', main: 'Snow' },
        80: { code, description: 'Slight rain showers', main: 'Rain' },
        81: { code, description: 'Moderate rain showers', main: 'Rain' },
        82: { code, description: 'Violent rain showers', main: 'Rain' },
        85: { code, description: 'Slight snow showers', main: 'Snow' },
        86: { code, description: 'Heavy snow showers', main: 'Snow' },
        95: { code, description: 'Thunderstorm', main: 'Thunderstorm' },
        96: { code, description: 'Thunderstorm with slight hail', main: 'Thunderstorm' },
        99: { code, description: 'Thunderstorm with heavy hail', main: 'Thunderstorm' },
      };
      return map[code] || { code, description: 'Unknown', main: 'Clear' };
    };

    const condition = getCondition(current.weather_code);

    return {
      location: {
        name: 'Current Location',
        country: 'IN',
        region: '',
        lat,
        lon,
        timezone: data.timezone || 'Asia/Kolkata',
      },
      current: {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m || 0),
        windDirection: current.wind_direction_10m || 0,
        pressure: current.pressure_msl || 1013,
        visibility: (current.visibility || 10000) / 1000,
        uvIndex: current.uv_index || 0,
        cloudCover: current.cloud_cover || 0,
        condition,
        icon: this.getWeatherIcon(current.weather_code),
        rainfall: current.precipitation || 0,
        heatIndex: current.apparent_temperature || current.temperature_2m,
        dewPoint: this.calculateDewPoint(current.temperature_2m, current.relative_humidity_2m),
      },
      hourly: this.transformHourly(hourly),
      daily: this.transformDaily(daily),
      alerts: [],
      agricultural: {
        soilMoisture: Math.min(1, 0.3 + (current.precipitation || 0) / 20),
        soilTemperature: current.temperature_2m - 2,
        evapotranspiration: Math.max(0, (current.temperature_2m - 10) * 0.1),
        growingDegreeDay: Math.max(0, current.temperature_2m - 10),
        frostRisk: current.temperature_2m < 5,
        heatStress: current.temperature_2m > 35,
        irrigationAdvice: current.temperature_2m > 30 ? 'Irrigation recommended' : 'Normal moisture levels',
        sprayingConditions: current.wind_speed_10m > 20 ? 'not_recommended' : 'good',
      },
    };
  }

  private transformHourly(hourly: any): HourlyWeather[] {
    if (!hourly?.time) return [];
    const hours: HourlyWeather[] = [];
    const maxHours = Math.min(24, hourly.time.length);

    for (let i = 0; i < maxHours; i++) {
      const code = hourly.weather_code?.[i] || 0;
      hours.push({
        time: hourly.time[i],
        temperature: Math.round(hourly.temperature_2m?.[i] || 0),
        humidity: hourly.relative_humidity_2m?.[i] || 0,
        rainfall: hourly.precipitation?.[i] || 0,
        chanceOfRain: hourly.precipitation_probability?.[i] || 0,
        condition: { code, description: '', main: '' },
        icon: this.getWeatherIcon(code),
        windSpeed: Math.round(hourly.wind_speed_10m?.[i] || 0),
      });
    }
    return hours;
  }

  private transformDaily(daily: any): DailyWeather[] {
    if (!daily?.time) return [];
    const days: DailyWeather[] = [];
    const maxDays = Math.min(7, daily.time.length);

    for (let i = 0; i < maxDays; i++) {
      const code = daily.weather_code?.[i] || 0;
      days.push({
        date: daily.time[i],
        tempMax: Math.round(daily.temperature_2m_max?.[i] || 0),
        tempMin: Math.round(daily.temperature_2m_min?.[i] || 0),
        humidity: 60, // approximate
        rainfall: daily.precipitation_sum?.[i] || 0,
        chanceOfRain: daily.precipitation_probability_max?.[i] || 0,
        condition: { code, description: '', main: '' },
        icon: this.getWeatherIcon(code),
        sunrise: daily.sunrise?.[i]?.split('T')[1]?.substring(0, 5) || '06:00',
        sunset: daily.sunset?.[i]?.split('T')[1]?.substring(0, 5) || '18:00',
      });
    }
    return days;
  }

  private calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
    return Math.round((b * alpha) / (a - alpha));
  }

  private getWeatherIcon(code: number): string {
    if (code === 0 || code === 1) return 'sunny';
    if (code === 2) return 'partly-cloudy';
    if (code === 3) return 'cloudy';
    if (code >= 45 && code <= 48) return 'foggy';
    if (code >= 51 && code <= 57) return 'drizzle';
    if (code >= 61 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 77) return 'snowy';
    if (code >= 80 && code <= 82) return 'rainy';
    if (code >= 85 && code <= 86) return 'snowy';
    if (code >= 95) return 'thunderstorm';
    return 'sunny';
  }

  /**
   * Get location from city name using Open-Meteo Geocoding API
   */
  async getLocationByCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const data = await response.json();
      if (data.results?.[0]) {
        return {
          lat: data.results[0].latitude,
          lon: data.results[0].longitude,
          name: data.results[0].name,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const weatherService = new WeatherService();
export default weatherService;
