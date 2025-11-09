// API Service for Real-time Data
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smart-krishi-backend.azurewebsites.net';

// Weather API (Open-Meteo - Free, No API Key Required)
export const weatherAPI = {
  async getCurrentWeather(lat: number, lon: number) {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata`
      );
      
      return {
        current: {
          temperature: response.data.current.temperature_2m,
          humidity: response.data.current.relative_humidity_2m,
          feelsLike: response.data.current.apparent_temperature,
          windSpeed: response.data.current.wind_speed_10m,
          windDirection: response.data.current.wind_direction_10m,
          precipitation: response.data.current.precipitation,
          weatherCode: response.data.current.weather_code,
        },
        hourly: response.data.hourly,
        daily: response.data.daily,
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  },

  async getWeatherByCity(city: string) {
    // First get coordinates for the city
    const geocodingResponse = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    
    if (geocodingResponse.data.results && geocodingResponse.data.results.length > 0) {
      const { latitude, longitude } = geocodingResponse.data.results[0];
      return this.getCurrentWeather(latitude, longitude);
    }
    
    throw new Error('City not found');
  }
};

// Government Market Prices API (data.gov.in)
export const marketPricesAPI = {
  async getPrices(commodity?: string, state?: string, district?: string) {
    try {
      // Using Government of India's Market Prices API
      const response = await axios.get(
        'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
        {
          params: {
            'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
            format: 'json',
            limit: 100,
            ...(commodity && { filters: { commodity } }),
            ...(state && { filters: { state } }),
          }
        }
      );
      
      return response.data.records || [];
    } catch (error) {
      console.error('Market Prices API Error:', error);
      // Fallback to local data if API fails
      throw error;
    }
  },

  async getLatestPrices() {
    try {
      const response = await axios.get(
        'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
        {
          params: {
            'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
            format: 'json',
            limit: 50,
            'sort[arrival_date]': 'desc'
          }
        }
      );
      
      return response.data.records || [];
    } catch (error) {
      console.error('Latest Prices API Error:', error);
      throw error;
    }
  }
};

// Crop Information
export const cropAPI = {
  async getCropInfo(cropName: string) {
    try {
      // This would typically call your backend or external API
      // For now, using a placeholder that can be replaced
      const response = await axios.get(`${API_BASE_URL}/api/crops/${cropName}`);
      return response.data;
    } catch (error) {
      console.error('Crop API Error:', error);
      throw error;
    }
  },

  async getAllCrops() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/crops`);
      return response.data;
    } catch (error) {
      console.error('Crops List API Error:', error);
      throw error;
    }
  }
};

// Government Schemes API
export const schemesAPI = {
  async getSchemes() {
    try {
      // Government schemes can be fetched from data.gov.in or your backend
      const response = await axios.get(
        'https://api.data.gov.in/resource/d9975283-94c0-4c26-933b-ba92d6956a5d',
        {
          params: {
            'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
            format: 'json',
            limit: 50
          }
        }
      );
      
      return response.data.records || [];
    } catch (error) {
      console.error('Schemes API Error:', error);
      throw error;
    }
  }
};

// Helper function to handle API errors
export const handleAPIError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return {
        message: error.response.data.message || 'Server error occurred',
        status: error.response.status
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your internet connection.',
        status: 0
      };
    }
  }
  return {
    message: error.message || 'An unexpected error occurred',
    status: -1
  };
};

// Weather code to description mapping
export const getWeatherDescription = (code: number): string => {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
};

// Hindi translations for weather
export const getWeatherDescriptionHindi = (code: number): string => {
  const weatherCodesHindi: { [key: number]: string } = {
    0: 'साफ आसमान',
    1: 'मुख्यतः साफ',
    2: 'आंशिक बादल',
    3: 'बादलों से ढका',
    45: 'कोहरा',
    48: 'कोहरा जमा',
    51: 'हल्की बूंदाबांदी',
    53: 'मध्यम बूंदाबांदी',
    55: 'घनी बूंदाबांदी',
    61: 'हल्की बारिश',
    63: 'मध्यम बारिश',
    65: 'भारी बारिश',
    71: 'हल्की बर्फबारी',
    73: 'मध्यम बर्फबारी',
    75: 'भारी बर्फबारी',
    77: 'बर्फ के दाने',
    80: 'हल्की बारिश की बौछारें',
    81: 'मध्यम बारिश की बौछारें',
    82: 'तेज़ बारिश की बौछारें',
    85: 'हल्की बर्फबारी की बौछारें',
    86: 'भारी बर्फबारी की बौछारें',
    95: 'आंधी-तूफान',
    96: 'हल्के ओलों के साथ आंधी',
    99: 'भारी ओलों के साथ आंधी'
  };
  
  return weatherCodesHindi[code] || 'अज्ञात';
};

export default {
  weatherAPI,
  marketPricesAPI,
  cropAPI,
  schemesAPI,
  handleAPIError,
  getWeatherDescription,
  getWeatherDescriptionHindi
};
