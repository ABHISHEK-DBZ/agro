import axios from 'axios';

export interface LiveWeatherData {
  location: {
    name: string;
    country: string;
    region: string;
    lat: number;
    lon: number;
    timezone: string;
    localtime: string;
  };
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    windDegree: number;
    description: string;
    condition: string;
    icon: string;
    rainfall: number;
    feelsLike: number;
    visibility: number;
    uv: number;
    pressure: number;
    cloudCover: number;
    dewPoint: number;
    heatIndex: number;
    windChill: number;
    gustSpeed: number;
  };
  hourly: Array<{
    time: string;
    temp: number;
    humidity: number;
    rainfall: number;
    description: string;
    icon: string;
    windSpeed: number;
    pressure: number;
    cloudCover: number;
    chanceOfRain: number;
  }>;
  daily: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    humidity: number;
    rainfall: number;
    description: string;
    icon: string;
    windSpeed: number;
    sunrise: string;
    sunset: string;
    moonPhase: string;
    chanceOfRain: number;
  }>;
  alerts: Array<{
    event: string;
    description: string;
    start: number;
    end: number;
    severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
    urgency: 'Immediate' | 'Expected' | 'Future';
    certainty: 'Observed' | 'Likely' | 'Possible';
  }>;
  agricultural: {
    soilMoisture: number;
    soilTemperature: number;
    evapotranspiration: number;
    growingDegreeDay: number;
    frostRisk: boolean;
    heatStress: boolean;
    irrigationAdvice: string;
    sprayingConditions: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Not Recommended';
  };
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    so2: number;
    o3: number;
    quality: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  };
}

interface Location {
  lat: number;
  lon: number;
  name: string;
  state?: string;
  country: string;
}

class LiveWeatherService {
  private readonly weatherApiUrl: string;
  private cachedWeatherData: Map<string, { data: LiveWeatherData; timestamp: number }>;
  private readonly cacheExpiry: number;
  private refreshInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: LiveWeatherData) => void> = [];

  constructor() {
    // Using Open-Meteo API - Free and reliable weather API
    this.weatherApiUrl = 'https://api.open-meteo.com/v1';
    this.cachedWeatherData = new Map();
    this.cacheExpiry = parseInt(import.meta.env.VITE_WEATHER_REFRESH_INTERVAL) || 300000; // 5 minutes default
  }

  // Subscribe to live weather updates
  subscribe(callback: (data: LiveWeatherData) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers of weather updates
  private notifySubscribers(data: LiveWeatherData) {
    this.subscribers.forEach(callback => callback(data));
  }

  // Start live weather updates for a location
  startLiveUpdates(location: Location) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      try {
        const weatherData = await this.getWeatherData(location, true);
        if (weatherData) {
          this.notifySubscribers(weatherData);
        }
      } catch (error) {
        console.error('Error in live weather update:', error);
      }
    }, this.cacheExpiry);
  }

  // Stop live weather updates
  stopLiveUpdates() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async getLocationByName(cityName: string): Promise<Location | null> {
    try {
      // Use Open-Meteo Geocoding API (free)
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      if (response.data && response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0];
        return {
          lat: location.latitude,
          lon: location.longitude,
          name: location.name,
          state: location.admin1 || '',
          country: location.country || 'IN'
        };
      }

      // Fallback to mock data for demo
      const mockLocations: { [key: string]: Location } = {
        'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai', state: 'Maharashtra', country: 'IN' },
        'delhi': { lat: 28.7041, lon: 77.1025, name: 'Delhi', country: 'IN' },
        'bangalore': { lat: 12.9716, lon: 77.5946, name: 'Bangalore', state: 'Karnataka', country: 'IN' },
        'chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai', state: 'Tamil Nadu', country: 'IN' },
        'kolkata': { lat: 22.5726, lon: 88.3639, name: 'Kolkata', state: 'West Bengal', country: 'IN' },
        'hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad', state: 'Telangana', country: 'IN' },
        'pune': { lat: 18.5204, lon: 73.8567, name: 'Pune', state: 'Maharashtra', country: 'IN' },
        'ahmedabad': { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad', state: 'Gujarat', country: 'IN' },
        'jaipur': { lat: 26.9124, lon: 75.7873, name: 'Jaipur', state: 'Rajasthan', country: 'IN' },
        'lucknow': { lat: 26.8467, lon: 80.9462, name: 'Lucknow', state: 'Uttar Pradesh', country: 'IN' }
      };

      const searchKey = cityName.toLowerCase().trim();
      return mockLocations[searchKey] || null;
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
            // Use Open-Meteo reverse geocoding
            const response = await axios.get(
              `https://geocoding-api.open-meteo.com/v1/search?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&count=1&language=en&format=json`
            );

            if (response.data && response.data.results && response.data.results.length > 0) {
              const location = response.data.results[0];
              resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                name: location.name,
                state: location.admin1,
                country: location.country || 'IN'
              });
              return;
            }

            // Fallback to coordinates only
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              name: 'Your Location',
              country: 'IN'
            });
          } catch (error) {
            console.error('Error getting location name:', error);
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              name: 'Your Location',
              country: 'IN'
            });
          }
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  async getWeatherData(location: Location, forceRefresh: boolean = false): Promise<LiveWeatherData | null> {
    const cacheKey = `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
    const cachedData = this.cachedWeatherData.get(cacheKey);

    if (!forceRefresh && cachedData && Date.now() - cachedData.timestamp < this.cacheExpiry) {
      return cachedData.data;
    }

    try {
      // Use Open-Meteo API - comprehensive and free weather API
      const weatherParams = new URLSearchParams({
        latitude: location.lat.toString(),
        longitude: location.lon.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m', 
          'apparent_temperature',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m',
          'uv_index',
          'visibility'
        ].join(','),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'precipitation_probability',
          'precipitation',
          'rain',
          'weather_code',
          'pressure_msl',
          'cloud_cover',
          'wind_speed_10m',
          'wind_direction_10m',
          'uv_index'
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'apparent_temperature_min',
          'sunrise',
          'sunset',
          'uv_index_max',
          'precipitation_sum',
          'rain_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'wind_gusts_10m_max',
          'wind_direction_10m_dominant'
        ].join(','),
        timezone: 'Asia/Kolkata',
        forecast_days: '7'
      });

      const weatherResponse = await axios.get(`${this.weatherApiUrl}/forecast?${weatherParams}`);
      
      if (weatherResponse.data) {
        const weatherData = this.transformOpenMeteoData(weatherResponse.data, location);
        
        // Cache the data
        this.cachedWeatherData.set(cacheKey, {
          data: weatherData,
          timestamp: Date.now()
        });

        return weatherData;
      } else {
        throw new Error('No weather data received');
      }
    } catch (error) {
      console.error('Error fetching weather data from Open-Meteo:', error);
      
      // Return cached data if available, otherwise generate mock data
      if (cachedData) {
        return cachedData.data;
      }
      
      return this.generateMockWeatherData(location);
    }
  }

  private transformOpenMeteoData(data: any, location: Location): LiveWeatherData {
    const now = new Date();
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;
    
    // Weather code to description mapping for Open-Meteo
    const getWeatherDescription = (code: number): { description: string; condition: string; icon: string } => {
      const weatherCodes: { [key: number]: { description: string; condition: string; icon: string } } = {
        0: { description: 'Clear sky', condition: 'Clear', icon: '01d' },
        1: { description: 'Mainly clear', condition: 'Clear', icon: '01d' },
        2: { description: 'Partly cloudy', condition: 'Clouds', icon: '02d' },
        3: { description: 'Overcast', condition: 'Clouds', icon: '03d' },
        45: { description: 'Fog', condition: 'Fog', icon: '50d' },
        48: { description: 'Depositing rime fog', condition: 'Fog', icon: '50d' },
        51: { description: 'Light drizzle', condition: 'Drizzle', icon: '09d' },
        53: { description: 'Moderate drizzle', condition: 'Drizzle', icon: '09d' },
        55: { description: 'Dense drizzle', condition: 'Drizzle', icon: '09d' },
        61: { description: 'Slight rain', condition: 'Rain', icon: '10d' },
        63: { description: 'Moderate rain', condition: 'Rain', icon: '10d' },
        65: { description: 'Heavy rain', condition: 'Rain', icon: '10d' },
        71: { description: 'Slight snow', condition: 'Snow', icon: '13d' },
        73: { description: 'Moderate snow', condition: 'Snow', icon: '13d' },
        75: { description: 'Heavy snow', condition: 'Snow', icon: '13d' },
        95: { description: 'Thunderstorm', condition: 'Thunderstorm', icon: '11d' },
        96: { description: 'Thunderstorm with hail', condition: 'Thunderstorm', icon: '11d' },
        99: { description: 'Thunderstorm with heavy hail', condition: 'Thunderstorm', icon: '11d' }
      };
      
      return weatherCodes[code] || { description: 'Unknown', condition: 'Clear', icon: '01d' };
    };

    const currentWeather = getWeatherDescription(current.weather_code);
    const windSpeed = current.wind_speed_10m || 0;
    const temperature = current.temperature_2m || 20;
    const humidity = current.relative_humidity_2m || 60;

    return {
      location: {
        name: location.name,
        country: location.country,
        region: location.state || '',
        lat: location.lat,
        lon: location.lon,
        timezone: data.timezone || 'Asia/Kolkata',
        localtime: now.toISOString()
      },
      current: {
        temp: Math.round(temperature),
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed),
        windDirection: current.wind_direction_10m || 0,
        windDegree: current.wind_direction_10m || 0,
        description: currentWeather.description,
        condition: currentWeather.condition,
        icon: currentWeather.icon,
        rainfall: current.precipitation || 0,
        feelsLike: Math.round(current.apparent_temperature || temperature),
        visibility: (current.visibility || 10000) / 1000, // Convert to km
        uv: current.uv_index || 0,
        pressure: current.pressure_msl || current.surface_pressure || 1013,
        cloudCover: current.cloud_cover || 0,
        dewPoint: this.calculateDewPoint(temperature, humidity),
        heatIndex: this.calculateHeatIndex(temperature, humidity),
        windChill: this.calculateWindChill(temperature, windSpeed),
        gustSpeed: current.wind_gusts_10m || windSpeed
      },
      hourly: this.transformOpenMeteoHourlyData(hourly),
      daily: this.transformOpenMeteoDailyData(daily),
      alerts: this.generateOpenMeteoAlerts(current),
      agricultural: this.generateAgriculturalDataFromOpenMeteo(current),
      airQuality: this.generateMockAirQuality() // Open-Meteo doesn't provide air quality in free tier
    };
  }

  private transformOpenMeteoHourlyData(hourly: any): LiveWeatherData['hourly'] {
    const hours = [];
    const maxHours = Math.min(24, hourly.time?.length || 0);
    
    for (let i = 0; i < maxHours; i++) {
      const weatherCode = hourly.weather_code?.[i] || 0;
      const weatherInfo = this.getOpenMeteoWeatherInfo(weatherCode);
      
      hours.push({
        time: hourly.time[i],
        temp: Math.round(hourly.temperature_2m?.[i] || 20),
        humidity: Math.round(hourly.relative_humidity_2m?.[i] || 60),
        rainfall: hourly.precipitation?.[i] || 0,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        windSpeed: Math.round(hourly.wind_speed_10m?.[i] || 0),
        pressure: Math.round(hourly.pressure_msl?.[i] || 1013),
        cloudCover: Math.round(hourly.cloud_cover?.[i] || 0),
        chanceOfRain: Math.round(hourly.precipitation_probability?.[i] || 0)
      });
    }
    
    return hours;
  }

  private transformOpenMeteoDailyData(daily: any): LiveWeatherData['daily'] {
    const days = [];
    const maxDays = Math.min(7, daily.time?.length || 0);
    
    for (let i = 0; i < maxDays; i++) {
      const weatherCode = daily.weather_code?.[i] || 0;
      const weatherInfo = this.getOpenMeteoWeatherInfo(weatherCode);
      
      days.push({
        date: daily.time[i],
        tempMax: Math.round(daily.temperature_2m_max?.[i] || 25),
        tempMin: Math.round(daily.temperature_2m_min?.[i] || 15),
        humidity: 60, // Not available in daily data
        rainfall: daily.precipitation_sum?.[i] || 0,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        windSpeed: Math.round(daily.wind_speed_10m_max?.[i] || 0),
        sunrise: daily.sunrise?.[i] || '06:30',
        sunset: daily.sunset?.[i] || '18:30',
        moonPhase: this.getMoonPhase(new Date(daily.time[i])),
        chanceOfRain: Math.round(daily.precipitation_probability_max?.[i] || 0)
      });
    }
    
    return days;
  }

  private getOpenMeteoWeatherInfo(code: number): { description: string; condition: string; icon: string } {
    const weatherCodes: { [key: number]: { description: string; condition: string; icon: string } } = {
      0: { description: 'Clear sky', condition: 'Clear', icon: '01d' },
      1: { description: 'Mainly clear', condition: 'Clear', icon: '01d' },
      2: { description: 'Partly cloudy', condition: 'Clouds', icon: '02d' },
      3: { description: 'Overcast', condition: 'Clouds', icon: '03d' },
      45: { description: 'Fog', condition: 'Fog', icon: '50d' },
      48: { description: 'Depositing rime fog', condition: 'Fog', icon: '50d' },
      51: { description: 'Light drizzle', condition: 'Drizzle', icon: '09d' },
      53: { description: 'Moderate drizzle', condition: 'Drizzle', icon: '09d' },
      55: { description: 'Dense drizzle', condition: 'Drizzle', icon: '09d' },
      61: { description: 'Slight rain', condition: 'Rain', icon: '10d' },
      63: { description: 'Moderate rain', condition: 'Rain', icon: '10d' },
      65: { description: 'Heavy rain', condition: 'Rain', icon: '10d' },
      71: { description: 'Slight snow', condition: 'Snow', icon: '13d' },
      73: { description: 'Moderate snow', condition: 'Snow', icon: '13d' },
      75: { description: 'Heavy snow', condition: 'Snow', icon: '13d' },
      95: { description: 'Thunderstorm', condition: 'Thunderstorm', icon: '11d' },
      96: { description: 'Thunderstorm with hail', condition: 'Thunderstorm', icon: '11d' },
      99: { description: 'Thunderstorm with heavy hail', condition: 'Thunderstorm', icon: '11d' }
    };
    
    return weatherCodes[code] || { description: 'Unknown', condition: 'Clear', icon: '01d' };
  }

  private generateAgriculturalDataFromOpenMeteo(current: any): LiveWeatherData['agricultural'] {
    const temp = current.temperature_2m || 20;
    const humidity = current.relative_humidity_2m || 60;
    const windSpeed = current.wind_speed_10m || 0;
    const precipitation = current.precipitation || 0;
    
    // Estimate soil parameters based on weather
    const soilMoisture = Math.min(1, 0.3 + (precipitation / 10) + (humidity / 200));
    const soilTemp = temp - 2 + Math.random() * 2;
    
    return {
      soilMoisture: soilMoisture,
      soilTemperature: soilTemp,
      evapotranspiration: Math.max(0, (temp - 10) * 0.1 + (windSpeed * 0.05)),
      growingDegreeDay: Math.max(0, temp - 10),
      frostRisk: temp < 5,
      heatStress: temp > 35,
      irrigationAdvice: soilMoisture < 0.3 ? 'Irrigation needed' : soilMoisture > 0.7 ? 'Adequate moisture' : 'Monitor soil moisture',
      sprayingConditions: this.calculateSprayingConditions(temp, humidity, windSpeed)
    };
  }

  private generateOpenMeteoAlerts(current: any): LiveWeatherData['alerts'] {
    const alerts = [];
    const now = Date.now() / 1000;
    const temp = current.temperature_2m || 20;
    const windSpeed = current.wind_speed_10m || 0;
    const precipitation = current.precipitation || 0;
    
    // Temperature alerts
    if (temp > 35) {
      alerts.push({
        event: 'High Temperature Alert',
        description: `Temperature ${temp.toFixed(1)}°C exceeds 35°C. Provide shade to sensitive crops and increase irrigation.`,
        start: now,
        end: now + 86400,
        severity: 'Moderate' as const,
        urgency: 'Expected' as const,
        certainty: 'Observed' as const
      });
    }
    
    if (temp < 5) {
      alerts.push({
        event: 'Frost Warning',
        description: `Temperature ${temp.toFixed(1)}°C below 5°C. Protect crops from frost damage.`,
        start: now,
        end: now + 43200,
        severity: 'Severe' as const,
        urgency: 'Immediate' as const,
        certainty: 'Likely' as const
      });
    }
    
    // Wind alerts
    if (windSpeed > 30) {
      alerts.push({
        event: 'Strong Wind Warning',
        description: `Wind speed ${windSpeed.toFixed(1)} km/h exceeds 30 km/h. Secure crops and delay spraying operations.`,
        start: now,
        end: now + 21600,
        severity: 'Moderate' as const,
        urgency: 'Expected' as const,
        certainty: 'Observed' as const
      });
    }
    
    // Rainfall alerts
    if (precipitation > 10) {
      alerts.push({
        event: 'Heavy Rain Alert',
        description: `Heavy rainfall ${precipitation.toFixed(1)}mm detected. Ensure proper field drainage.`,
        start: now,
        end: now + 10800,
        severity: 'Moderate' as const,
        urgency: 'Immediate' as const,
        certainty: 'Observed' as const
      });
    }
    
    return alerts;
  }

  private getMoonPhase(date: Date): string {
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const dayOfMonth = date.getDate();
    const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
    return phases[phaseIndex];
  }

  private generateMockWeatherData(location: Location): LiveWeatherData {
    const now = new Date();
    const baseTemp = 25 + Math.sin(Date.now() / 86400000) * 10; // Simulate daily temperature variation
    const humidity = 60 + Math.random() * 30;
    const windSpeed = 5 + Math.random() * 15;
    
    return {
      location: {
        name: location.name,
        country: location.country,
        region: location.state || '',
        lat: location.lat,
        lon: location.lon,
        timezone: 'Asia/Kolkata',
        localtime: now.toISOString()
      },
      current: {
        temp: Math.round(baseTemp),
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed),
        windDirection: Math.round(Math.random() * 360),
        windDegree: Math.round(Math.random() * 360),
        description: this.getRandomWeatherDescription(),
        condition: 'Clear',
        icon: '01d',
        rainfall: Math.random() > 0.7 ? Math.random() * 5 : 0,
        feelsLike: Math.round(baseTemp + Math.random() * 4 - 2),
        visibility: 8 + Math.random() * 7,
        uv: Math.round(Math.random() * 11),
        pressure: 1010 + Math.random() * 20,
        cloudCover: Math.round(Math.random() * 100),
        dewPoint: this.calculateDewPoint(baseTemp, humidity),
        heatIndex: this.calculateHeatIndex(baseTemp, humidity),
        windChill: this.calculateWindChill(baseTemp, windSpeed),
        gustSpeed: windSpeed + Math.random() * 10
      },
      hourly: this.generateMockHourlyData(24),
      daily: this.generateMockDailyData(7),
      alerts: this.generateMockAlerts(),
      agricultural: this.generateMockAgriculturalData(baseTemp, humidity),
      airQuality: this.generateMockAirQuality()
    };
  }

  private generateMockHourlyData(hours: number): LiveWeatherData['hourly'] {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < hours; i++) {
      const time = new Date(now.getTime() + i * 3600000);
      const temp = 20 + Math.sin((i + now.getHours()) / 24 * 2 * Math.PI) * 8 + Math.random() * 4;
      
      data.push({
        time: time.toISOString(),
        temp: Math.round(temp),
        humidity: Math.round(50 + Math.random() * 40),
        rainfall: Math.random() > 0.8 ? Math.random() * 3 : 0,
        description: this.getRandomWeatherDescription(),
        icon: '01d',
        windSpeed: Math.round(5 + Math.random() * 10),
        pressure: Math.round(1010 + Math.random() * 20),
        cloudCover: Math.round(Math.random() * 100),
        chanceOfRain: Math.round(Math.random() * 100)
      });
    }
    
    return data;
  }

  private generateMockDailyData(days: number): LiveWeatherData['daily'] {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() + i * 86400000);
      const baseTemp = 25 + Math.sin(i / 7 * 2 * Math.PI) * 5;
      
      data.push({
        date: date.toISOString().split('T')[0],
        tempMax: Math.round(baseTemp + 5 + Math.random() * 5),
        tempMin: Math.round(baseTemp - 5 - Math.random() * 5),
        humidity: Math.round(60 + Math.random() * 30),
        rainfall: Math.random() > 0.6 ? Math.random() * 10 : 0,
        description: this.getRandomWeatherDescription(),
        icon: '01d',
        windSpeed: Math.round(5 + Math.random() * 15),
        sunrise: '06:30',
        sunset: '18:30',
        moonPhase: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'][i % 8],
        chanceOfRain: Math.round(Math.random() * 100)
      });
    }
    
    return data;
  }

  private generateMockAlerts(): LiveWeatherData['alerts'] {
    const alerts = [];
    const now = Date.now() / 1000;
    
    if (Math.random() > 0.7) {
      alerts.push({
        event: 'High Temperature Warning',
        description: 'Temperature may exceed 40°C. Take precautions for heat-sensitive crops.',
        start: now,
        end: now + 86400,
        severity: 'Moderate' as const,
        urgency: 'Expected' as const,
        certainty: 'Likely' as const
      });
    }
    
    if (Math.random() > 0.8) {
      alerts.push({
        event: 'Heavy Rain Alert',
        description: 'Heavy rainfall expected. Ensure proper drainage in fields.',
        start: now + 3600,
        end: now + 21600,
        severity: 'Severe' as const,
        urgency: 'Immediate' as const,
        certainty: 'Observed' as const
      });
    }
    
    return alerts;
  }

  private generateMockAgriculturalData(temp: number, humidity: number): LiveWeatherData['agricultural'] {
    const soilMoisture = 0.3 + Math.random() * 0.4;
    const soilTemp = temp - 2 + Math.random() * 4;
    
    return {
      soilMoisture: soilMoisture,
      soilTemperature: soilTemp,
      evapotranspiration: Math.max(0, (temp - 10) * 0.1 + Math.random() * 2),
      growingDegreeDay: Math.max(0, temp - 10),
      frostRisk: temp < 5,
      heatStress: temp > 35,
      irrigationAdvice: soilMoisture < 0.3 ? 'Irrigation needed' : soilMoisture > 0.7 ? 'Adequate moisture' : 'Monitor soil moisture',
      sprayingConditions: this.calculateSprayingConditions(temp, humidity, 10) // Assuming 10 km/h wind
    };
  }

  private generateMockAirQuality(): LiveWeatherData['airQuality'] {
    const aqi = Math.round(1 + Math.random() * 5);
    const qualityLevels = ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    
    return {
      aqi: aqi,
      pm25: Math.round(Math.random() * 100),
      pm10: Math.round(Math.random() * 150),
      co: Math.round(Math.random() * 1000),
      no2: Math.round(Math.random() * 100),
      so2: Math.round(Math.random() * 50),
      o3: Math.round(Math.random() * 200),
      quality: qualityLevels[aqi - 1] as any
    };
  }

  private getRandomWeatherDescription(): string {
    const descriptions = [
      'clear sky', 'few clouds', 'scattered clouds', 'broken clouds',
      'light rain', 'moderate rain', 'heavy rain', 'thunderstorm',
      'mist', 'fog', 'overcast clouds'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return Math.round((b * alpha) / (a - alpha));
  }

  private calculateHeatIndex(temp: number, humidity: number): number {
    if (temp < 27) return temp;
    
    const T = temp;
    const RH = humidity;
    
    const HI = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH
      - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH
      + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    
    return Math.round(HI);
  }

  private calculateWindChill(temp: number, windSpeed: number): number {
    if (temp > 10 || windSpeed < 4.8) return temp;
    
    const WC = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
    return Math.round(WC);
  }

  private calculateSprayingConditions(temp: number, humidity: number, windSpeed: number): LiveWeatherData['agricultural']['sprayingConditions'] {
    let score = 0;
    
    // Temperature check (ideal: 15-25°C)
    if (temp >= 15 && temp <= 25) score += 2;
    else if (temp >= 10 && temp <= 30) score += 1;
    
    // Humidity check (ideal: 50-80%)
    if (humidity >= 50 && humidity <= 80) score += 2;
    else if (humidity >= 40 && humidity <= 90) score += 1;
    
    // Wind speed check (ideal: < 10 km/h)
    if (windSpeed < 10) score += 2;
    else if (windSpeed < 15) score += 1;
    
    if (score >= 5) return 'Excellent';
    if (score >= 4) return 'Good';
    if (score >= 2) return 'Fair';
    if (score >= 1) return 'Poor';
    return 'Not Recommended';
  }

  // Agricultural recommendations based on weather
  getAgriculturalRecommendations(weatherData: LiveWeatherData): string[] {
    const recommendations: string[] = [];
    const { current, agricultural } = weatherData;
    
    // Temperature-based recommendations
    if (current.temp > 35) {
      recommendations.push('🌡️ High temperature: Increase irrigation frequency and provide shade to sensitive crops');
    } else if (current.temp < 10) {
      recommendations.push('❄️ Low temperature: Protect crops from cold damage and consider frost protection measures');
    }
    
    // Humidity-based recommendations
    if (current.humidity > 85) {
      recommendations.push('💧 High humidity: Monitor for fungal diseases and ensure good air circulation');
    } else if (current.humidity < 40) {
      recommendations.push('🏜️ Low humidity: Increase irrigation and consider mulching to retain soil moisture');
    }
    
    // Wind-based recommendations
    if (current.windSpeed > 25) {
      recommendations.push('💨 Strong winds: Provide support to tall crops and avoid spraying operations');
    }
    
    // Soil moisture recommendations
    if (agricultural.soilMoisture < 0.3) {
      recommendations.push('🌱 Low soil moisture: Schedule irrigation soon');
    } else if (agricultural.soilMoisture > 0.8) {
      recommendations.push('🌊 High soil moisture: Ensure proper drainage to prevent waterlogging');
    }
    
    // Spraying recommendations
    recommendations.push(`🚿 Spraying conditions: ${agricultural.sprayingConditions.toLowerCase()}`);
    
    // Heat stress warning
    if (agricultural.heatStress) {
      recommendations.push('🔥 Heat stress risk: Provide shade and increase water supply');
    }
    
    // Frost risk warning
    if (agricultural.frostRisk) {
      recommendations.push('🧊 Frost risk: Cover sensitive plants and use frost protection methods');
    }
    
    return recommendations;
  }

  // Get weather-based crop suitability
  getCropSuitability(weatherData: LiveWeatherData, cropType: string): {
    suitable: boolean;
    score: number;
    recommendations: string[];
  } {
    const { current, agricultural } = weatherData;
    let score = 0;
    const recommendations: string[] = [];
    
    // Define crop requirements (simplified)
    const cropRequirements: { [key: string]: any } = {
      rice: { tempMin: 20, tempMax: 35, humidityMin: 70, soilMoistureMin: 0.6 },
      wheat: { tempMin: 15, tempMax: 25, humidityMin: 50, soilMoistureMin: 0.4 },
      cotton: { tempMin: 25, tempMax: 35, humidityMin: 60, soilMoistureMin: 0.5 },
      sugarcane: { tempMin: 20, tempMax: 30, humidityMin: 75, soilMoistureMin: 0.7 },
      tomato: { tempMin: 18, tempMax: 28, humidityMin: 60, soilMoistureMin: 0.5 },
      onion: { tempMin: 15, tempMax: 25, humidityMin: 50, soilMoistureMin: 0.4 }
    };
    
    const requirements = cropRequirements[cropType.toLowerCase()] || cropRequirements.wheat;
    
    // Temperature suitability
    if (current.temp >= requirements.tempMin && current.temp <= requirements.tempMax) {
      score += 25;
    } else {
      recommendations.push(`Temperature (${current.temp}°C) is outside optimal range (${requirements.tempMin}-${requirements.tempMax}°C)`);
    }
    
    // Humidity suitability
    if (current.humidity >= requirements.humidityMin) {
      score += 25;
    } else {
      recommendations.push(`Humidity (${current.humidity}%) is below optimal level (${requirements.humidityMin}%+)`);
    }
    
    // Soil moisture suitability
    if (agricultural.soilMoisture >= requirements.soilMoistureMin) {
      score += 25;
    } else {
      recommendations.push(`Soil moisture (${(agricultural.soilMoisture * 100).toFixed(1)}%) is below optimal level (${(requirements.soilMoistureMin * 100)}%+)`);
    }
    
    // General conditions
    if (!agricultural.frostRisk && !agricultural.heatStress) {
      score += 25;
    } else {
      if (agricultural.frostRisk) recommendations.push('Frost risk detected');
      if (agricultural.heatStress) recommendations.push('Heat stress conditions');
    }
    
    return {
      suitable: score >= 75,
      score,
      recommendations
    };
  }
}

export default new LiveWeatherService();