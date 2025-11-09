import express from 'express';
import axios from 'axios';

const router = express.Router();

// Weather cache to reduce API calls
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/weather/current
 * Get current weather for a location
 */
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const cacheKey = `current_${lat}_${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Serving weather from cache');
      return res.json(cached.data);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Weather service not configured' });
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric'
      }
    });

    const weatherData = response.data;
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

    console.log('🌤️ Fetched fresh weather data');
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
});

/**
 * GET /api/weather/forecast
 * Get 5-day weather forecast
 */
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const cacheKey = `forecast_${lat}_${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Serving forecast from cache');
      return res.json(cached.data);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Weather service not configured' });
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric',
        cnt: 40 // 5 days * 8 (3-hour intervals)
      }
    });

    const forecastData = response.data;
    weatherCache.set(cacheKey, { data: forecastData, timestamp: Date.now() });

    console.log('🌦️ Fetched fresh forecast data');
    res.json(forecastData);
  } catch (error) {
    console.error('Forecast API error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch forecast data',
      message: error.message 
    });
  }
});

/**
 * GET /api/weather/air-quality
 * Get air quality data
 */
router.get('/air-quality', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const cacheKey = `air_${lat}_${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Serving air quality from cache');
      return res.json(cached.data);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Weather service not configured' });
    }

    const response = await axios.get('http://api.openweathermap.org/data/2.5/air_pollution', {
      params: {
        lat,
        lon,
        appid: apiKey
      }
    });

    const airData = response.data;
    weatherCache.set(cacheKey, { data: airData, timestamp: Date.now() });

    console.log('💨 Fetched air quality data');
    res.json(airData);
  } catch (error) {
    console.error('Air quality API error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch air quality data',
      message: error.message 
    });
  }
});

/**
 * POST /api/weather/alert
 * Subscribe to weather alerts for a location
 */
router.post('/alert', async (req, res) => {
  try {
    const { lat, lon, userId, alertTypes } = req.body;

    if (!lat || !lon || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production, save this to database and setup actual alerts
    res.json({ 
      message: 'Weather alert subscription created',
      subscription: {
        userId,
        location: { lat, lon },
        alertTypes: alertTypes || ['rain', 'storm', 'frost'],
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Alert subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to create alert subscription',
      message: error.message 
    });
  }
});

export default router;
