import axios from 'axios';
import { WeatherData } from '../types/weather';

interface Location {
  lat: number;
  lon: number;
  name: string;
  state: string;
  country: string;
}

class WeatherService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private cachedWeatherData: Map<string, { data: WeatherData; timestamp: number }>;
  private readonly cacheExpiry = 600000; // Reduced to 10 minutes for faster updates

  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';
    this.apiUrl = 'https://api.openweathermap.org/data/3.0';
    this.cachedWeatherData = new Map();
  }

  async getLocationByName(cityName: string): Promise<Location | null> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/geo/1.0/direct?q=${cityName},IN&limit=1&appid=${this.apiKey}`
      );

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        return {
          lat: location.lat,
          lon: location.lon,
          name: location.name,
          state: location.state,
          country: location.country
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await axios.get(
              `${this.apiUrl}/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=${this.apiKey}`
            );

            if (response.data && response.data.length > 0) {
              const location = response.data[0];
              resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                name: location.name,
                state: location.state,
                country: location.country
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error getting location name:', error);
            resolve(null);
          }
        },
        () => resolve(null)
      );
    });
  }

  async getWeatherData(location: Location): Promise<WeatherData | null> {
    const cacheKey = `${location.lat},${location.lon}`;
    const cachedData = this.cachedWeatherData.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiry) {
      return cachedData.data;
    }

    try {
    // Fast parallel API calls for better performance
    const [currentWeatherResponse, forecastResponse] = await Promise.all([
        axios.get(
          `${this.apiUrl}/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${this.apiKey}`,
          { timeout: 5000 } // 5 second timeout for faster response
        ),
        axios.get(
          `${this.apiUrl}/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${this.apiKey}`,
          { timeout: 5000 } // 5 second timeout for faster response
        )
      ]);

      // Optimized weather data mapping for faster processing
      const weatherData: WeatherData = {
        name: currentWeatherResponse.data.name,
        main: currentWeatherResponse.data.main,
        weather: currentWeatherResponse.data.weather,
        wind: currentWeatherResponse.data.wind,
        visibility: currentWeatherResponse.data.visibility,
        clouds: currentWeatherResponse.data.clouds,
        sys: currentWeatherResponse.data.sys,
        rain: currentWeatherResponse.data.rain,
        uv_index: currentWeatherResponse.data.uvi || 0,
        air_quality: undefined, // Skip heavy API call for faster loading
      };

      // Cache the data
      this.cachedWeatherData.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  getWeatherAlerts(weatherData: WeatherData): Array<string> {
    const alerts: string[] = [];

    // Temperature alerts
    if (weatherData.main.temp > 35) {
      alerts.push('High temperature alert! Consider providing shade to sensitive crops.');
    } else if (weatherData.main.temp < 5) {
      alerts.push('Low temperature alert! Protect crops from frost damage.');
    }

    // Rainfall alerts
    if ((weatherData.rain?.['1h'] || 0) > 50) {
      alerts.push('Heavy rainfall alert! Ensure proper drainage in fields.');
    }

    // Wind alerts
    if (weatherData.wind.speed > 30) {
      alerts.push('Strong wind alert! Take measures to protect standing crops.');
    }

    // Humidity alerts
    if (weatherData.main.humidity > 85) {
      alerts.push('High humidity alert! Monitor for potential fungal diseases.');
    }

    return alerts;
  }

  getFarmingRecommendations(weatherData: WeatherData): Array<string> {
    const recommendations: string[] = [];
    const currentHour = new Date().getHours();

    // Time-based irrigation recommendation
    if (currentHour >= 6 && currentHour <= 8) {
      recommendations.push('Early morning is ideal for irrigation to minimize water loss.');
    }

    // Weather-based recommendations
    if (weatherData.main.temp > 30 && weatherData.main.humidity < 40) {
      recommendations.push('High evaporation conditions. Consider mulching to retain soil moisture.');
    }

    // Soil moisture based recommendations (not available in shared type, so skip)

    // Pest risk based on conditions
    if (weatherData.main.humidity > 80 && weatherData.main.temp > 25) {
      recommendations.push('Conditions favorable for fungal growth. Monitor crops closely.');
    }

    return recommendations;
  }

  isSuitableForSpraying(weatherData: WeatherData): boolean {
    return (
      weatherData.wind.speed < 10 &&
      !(weatherData.rain?.['1h'] || 0) &&
      weatherData.main.humidity < 85
    );
  }
}

export default new WeatherService();
