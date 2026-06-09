import axios from 'axios';

/**
 * Real-Time Agricultural Data Service
 * Integrates multiple data sources for live market prices, weather, and news.
 *
 * NOTE: As of the mock-data cleanup, this service no longer fabricates
 * fallback numbers. When a real source fails (or is not configured) it
 * returns an empty array so consumer pages can render an honest empty
 * state via the UI library.
 */

export interface DataSourceConfig {
  name: string;
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
  priority: number; // 1 = highest priority
  enabled: boolean;
}

export interface RealTimeMarketData {
  source: string;
  timestamp: string;
  commodity: string;
  market: string;
  state: string;
  price: {
    current: number;
    min: number;
    max: number;
    change: number;
    changePercent: number;
  };
  volume: number;
  quality: string;
  lastUpdated: string;
}

export interface WeatherData {
  source: string;
  location: string;
  latitude?: number;
  longitude?: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  conditions: string;
  soilMoisture?: number;
  soilTemperature?: number;
  sunrise?: string;
  sunset?: string;
  forecast: Array<{
    date: string;
    temperature: { min: number; max: number };
    conditions: string;
    rainfall: number;
    sunrise?: string;
    sunset?: string;
  }>;
}

export interface AgriNewsData {
  source: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  category: 'market' | 'weather' | 'policy' | 'technology' | 'general';
  impact: 'high' | 'medium' | 'low';
}

class RealTimeDataService {
  private dataSources: Map<string, DataSourceConfig> = new Map();
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.initializeDataSources();
  }

  private initializeDataSources() {
    // Government of India Data Portal - Market Prices (Alternative endpoint)
    const dataGovKey = import.meta.env.VITE_DATA_GOV_API_KEY as string | undefined;
    this.dataSources.set('gov_market', {
      name: 'Government of India - Daily Market Prices',
      url: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
      apiKey: dataGovKey || '',
      priority: 1,
      enabled: Boolean(dataGovKey),
    });

    // AGMARKNET - Agricultural Marketing Division
    this.dataSources.set('agmarknet', {
      name: 'AGMARKNET',
      url: 'https://agmarknet.gov.in/SearchCmmMkt.aspx',
      priority: 2,
      enabled: true
    });

    // National Sample Survey Office (NSSO)
    this.dataSources.set('nsso', {
      name: 'NSSO Agricultural Statistics',
      url: 'http://mospi.nic.in/sites/default/files/publication_reports',
      priority: 3,
      enabled: false // Requires custom parsing
    });

    // Weather API Sources
    this.dataSources.set('openmeteo', {
      name: 'Open-Meteo',
      url: 'https://api.open-meteo.com/v1/forecast',
      priority: 1,
      enabled: true
    });

    this.dataSources.set('openweather', {
      name: 'OpenWeatherMap',
      url: 'https://api.openweathermap.org/data/2.5',
      apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
      priority: 2,
      enabled: true
    });

    this.dataSources.set('imd', {
      name: 'India Meteorological Department',
      url: 'https://mausam.imd.gov.in/imd_latest',
      priority: 3,
      enabled: true
    });

    // News Sources
    this.dataSources.set('news_api', {
      name: 'NewsAPI - Agriculture',
      url: 'https://newsapi.org/v2/everything',
      apiKey: import.meta.env.VITE_NEWS_API_KEY,
      priority: 1,
      enabled: true
    });

    // Commodity Exchange APIs
    this.dataSources.set('mcx', {
      name: 'Multi Commodity Exchange',
      url: 'https://www.mcxindia.com/docs/default-source/market-data',
      priority: 2,
      enabled: false // Requires web scraping
    });

    this.dataSources.set('ncdex', {
      name: 'National Commodity Exchange',
      url: 'https://www.ncdex.com/MarketData',
      priority: 2,
      enabled: false // Requires web scraping
    });

    // Agricultural Universities & Research Institutes
    this.dataSources.set('icar', {
      name: 'ICAR Data Repository',
      url: 'https://www.icar.org.in',
      priority: 3,
      enabled: false
    });

    // State Agricultural Marketing Boards
    this.dataSources.set('maharashtra_apmc', {
      name: 'Maharashtra APMC',
      url: 'https://www.mahaagri.gov.in',
      priority: 2,
      enabled: false
    });

    // Real-time price aggregators
    this.dataSources.set('commodity_basis', {
      name: 'CommodityBasis API',
      url: 'https://api.commoditybasis.com',
      apiKey: import.meta.env.VITE_COMMODITY_BASIS_API_KEY,
      priority: 3,
      enabled: false
    });
  }

  // Subscribe to real-time updates
  subscribe(dataType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    this.subscribers.get(dataType)!.push(callback);

    return () => {
      const callbacks = this.subscribers.get(dataType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Start real-time data streaming
  startRealTimeUpdates(dataTypes: string[], intervalMs: number = 300000) { // 5 minutes default
    dataTypes.forEach(dataType => {
      if (!this.intervalIds.has(dataType)) {
        const intervalId = setInterval(async () => {
          try {
            const data = await this.fetchData(dataType);
            this.notifySubscribers(dataType, data);
          } catch (error) {
            console.error(`Error fetching ${dataType}:`, error);
          }
        }, intervalMs);

        this.intervalIds.set(dataType, intervalId);
      }
    });
  }

  // Get weather data for all cities directly
  async getAllCitiesWeatherData(): Promise<WeatherData[]> {
    try {
      console.log('🌍 Fetching weather data for all Indian cities...');
      const weatherData = await this.fetchWeatherData();
      console.log(`✅ Successfully fetched weather data for ${weatherData.length} cities`);
      return weatherData;
    } catch (error) {
      console.error('❌ Error fetching multi-city weather data:', error);
      throw error;
    }
  }

  // Stop real-time updates
  stopRealTimeUpdates(dataTypes?: string[]) {
    const typesToStop = dataTypes || Array.from(this.intervalIds.keys());

    typesToStop.forEach(dataType => {
      const intervalId = this.intervalIds.get(dataType);
      if (intervalId) {
        clearInterval(intervalId);
        this.intervalIds.delete(dataType);
      }
    });
  }

  private notifySubscribers(dataType: string, data: any) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Main data fetching method
  async fetchData(dataType: string, forceRefresh: boolean = false): Promise<any> {
    const cacheKey = dataType;
    const cachedData = this.cache.get(cacheKey);

    if (!forceRefresh && cachedData && Date.now() - cachedData.timestamp < cachedData.ttl) {
      return cachedData.data;
    }

    try {
      let data;

      switch (dataType) {
        case 'market_prices':
          data = await this.fetchMarketPrices();
          break;
        case 'weather':
          data = await this.fetchWeatherData();
          break;
        case 'news':
          data = await this.fetchAgriNews();
          break;
        case 'commodity_futures':
          data = await this.fetchCommodityFutures();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.getTTLForDataType(dataType)
      });

      return data;
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);

      // Return cached data if available
      if (cachedData) {
        return cachedData.data;
      }

      throw error;
    }
  }

  private getTTLForDataType(dataType: string): number {
    const ttlMap: { [key: string]: number } = {
      'market_prices': 300000, // 5 minutes
      'weather': 600000,       // 10 minutes
      'news': 1800000,         // 30 minutes
      'commodity_futures': 60000 // 1 minute
    };
    return ttlMap[dataType] || 300000;
  }

  // Fetch live market prices from multiple sources.
  // Mock-data fallback has been removed: when all real sources fail we
  // simply return [] so the consumer page can render an empty state.
  private async fetchMarketPrices(): Promise<RealTimeMarketData[]> {
    const results: RealTimeMarketData[] = [];

    // Try Government API first (data.gov.in)
    try {
      console.log('🏛️ Attempting to fetch from Government API...');
      const govData = await this.fetchFromGovernmentAPI();
      if (govData && govData.length > 0) {
        results.push(...govData);
        console.log(`✅ Government API: Successfully fetched ${govData.length} market records`);
      }
    } catch (error) {
      console.error('❌ Government API failed:', error);
    }

    // Try AGMARKNET as backup only if Government API fails
    if (results.length === 0) {
      try {
        console.log('🔄 Falling back to AGMARKNET...');
        const agmarknetData = await this.fetchFromAGMARKNET();
        results.push(...agmarknetData);
      } catch (error) {
        console.error('❌ AGMARKNET API failed:', error);
      }
    }

    return results;
  }

  private async fetchFromGovernmentAPI(): Promise<RealTimeMarketData[]> {
    const config = this.dataSources.get('gov_market')!;

    if (!config.enabled || !config.apiKey) {
      throw new Error('Government API not configured');
    }

    console.log('🏛️ Fetching live market prices from Government API...');

    const response = await axios.get(config.url, {
      params: {
        'api-key': config.apiKey,
        format: 'json',
        limit: 200,
        offset: 0
      },
      timeout: 15000
    });

    console.log(`✅ Government API: Received ${response.data.records?.length || 0} market records`);

    return this.transformGovernmentData(response.data.records || []);
  }

  private transformGovernmentData(records: any[]): RealTimeMarketData[] {
    console.log('🔄 Transforming Government market data...');

    return records.map((record: any) => {
      const commodity = record.commodity || 'Unknown';
      const market = record.market || 'Unknown Market';
      const state = record.state || 'Unknown State';
      const district = record.district || '';
      const variety = record.variety || '';
      const grade = record.grade || '';

      const modalPrice = parseFloat(record.modal_price || 0);
      const minPrice = parseFloat(record.min_price || 0);
      const maxPrice = parseFloat(record.max_price || 0);

      // The original implementation used Math.random() here to fabricate a
      // price change. We now set it to 0; consumers can compute change from
      // a historical snapshot if/when that data becomes available.
      const priceChange = 0;
      const changePercent = modalPrice > 0 ? 0 : 0;

      return {
        source: 'Government of India (data.gov.in)',
        timestamp: new Date().toISOString(),
        commodity: commodity,
        market: `${market}, ${district}`,
        state: state,
        variety: variety,
        grade: grade,
        price: {
          current: modalPrice,
          min: minPrice,
          max: maxPrice,
          change: priceChange,
          changePercent: changePercent
        },
        volume: 0, // volume not available from the API
        quality: this.determineQuality(modalPrice),
        lastUpdated: record.arrival_date || new Date().toISOString().split('T')[0]
      };
    }).filter(item => item.price.current > 0);
  }

  private async fetchFromAGMARKNET(): Promise<RealTimeMarketData[]> {
    // AGMARKNET requires web scraping or specific API calls that we don't
    // currently implement. Returning an empty array lets the consumer show
    // an honest empty state until a real source is wired in.
    console.warn('AGMARKNET source not implemented; returning []');
    return [];
  }

  // Fetch weather data.
  // Mock-data fallback has been removed: when all real sources fail we
  // simply return [] so the consumer page can render an empty state.
  private async fetchWeatherData(): Promise<WeatherData[]> {
    const results: WeatherData[] = [];

    // Try Open-Meteo first (priority 1)
    try {
      console.log('🌤️ Fetching weather data from Open-Meteo API...');
      const openMeteoData = await this.fetchFromOpenMeteo();
      results.push(...openMeteoData);
      console.log(`✅ Open-Meteo: Fetched data for ${openMeteoData.length} cities`);
    } catch (error) {
      console.error('❌ Open-Meteo API failed:', error);
    }

    // Try OpenWeather as backup (priority 2) only if Open-Meteo fails
    if (results.length === 0) {
      try {
        const openWeatherData = await this.fetchFromOpenWeather();
        results.push(...openWeatherData);
      } catch (error) {
        console.error('OpenWeather API failed:', error);
      }
    }

    return results;
  }

  // Fetch weather data from Open-Meteo API
  private async fetchFromOpenMeteo(): Promise<WeatherData[]> {
    const config = this.dataSources.get('openmeteo')!;

    if (!config.enabled) {
      throw new Error('Open-Meteo API not enabled');
    }

    // Indian cities with coordinates
    const cities = [
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
      { name: 'Pune', lat: 18.5204, lon: 73.8567 },
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 }
    ];

    const results: WeatherData[] = [];

    for (const city of cities) {
      try {
        const response = await axios.get(config.url, {
          params: {
            latitude: city.lat,
            longitude: city.lon,
            current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
            hourly: 'temperature_2m,wind_speed_10m,precipitation,soil_moisture_27_to_81cm,soil_temperature_54cm',
            daily: 'sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_sum',
            models: 'best_match',
            timezone: 'auto',
            forecast_days: 7
          },
          timeout: 10000
        });

        const data = response.data;
        results.push(this.transformOpenMeteoData(city, data));
      } catch (error) {
        console.error(`Error fetching Open-Meteo data for ${city.name}:`, error);
      }
    }

    return results;
  }

  private transformOpenMeteoData(city: any, data: any): WeatherData {
    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    // Get current conditions based on precipitation and temperature
    const getConditions = (temp: number, precipitation: number): string => {
      if (precipitation > 0.5) return 'Rainy';
      if (temp > 35) return 'Hot';
      if (temp < 15) return 'Cool';
      if (temp > 25) return 'Clear';
      return 'Partly Cloudy';
    };

    return {
      source: 'Open-Meteo',
      location: city.name,
      latitude: city.lat,
      longitude: city.lon,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      rainfall: current.precipitation || 0,
      windSpeed: current.wind_speed_10m,
      conditions: getConditions(current.temperature_2m, current.precipitation || 0),
      soilMoisture: hourly.soil_moisture_27_to_81cm?.[0], // Current hour soil moisture
      soilTemperature: hourly.soil_temperature_54cm?.[0], // Current hour soil temperature
      sunrise: daily.sunrise?.[0],
      sunset: daily.sunset?.[0],
      forecast: daily.time.slice(0, 7).map((date: string, index: number) => ({
        date: date,
        temperature: {
          min: daily.temperature_2m_min[index],
          max: daily.temperature_2m_max[index]
        },
        conditions: getConditions(daily.temperature_2m_max[index], daily.precipitation_sum[index]),
        rainfall: daily.precipitation_sum[index],
        sunrise: daily.sunrise?.[index],
        sunset: daily.sunset?.[index]
      }))
    };
  }

  private async fetchFromOpenWeather(): Promise<WeatherData[]> {
    const config = this.dataSources.get('openweather')!;

    if (!config.enabled || !config.apiKey) {
      throw new Error('OpenWeather API not configured');
    }

    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];
    const results: WeatherData[] = [];

    for (const city of cities) {
      try {
        const currentResponse = await axios.get(`${config.url}/weather`, {
          params: {
            q: `${city},IN`,
            appid: config.apiKey,
            units: 'metric'
          },
          timeout: 5000
        });

        const forecastResponse = await axios.get(`${config.url}/forecast`, {
          params: {
            q: `${city},IN`,
            appid: config.apiKey,
            units: 'metric'
          },
          timeout: 5000
        });

        results.push(this.transformWeatherData(currentResponse.data, forecastResponse.data));
      } catch (error) {
        console.error(`Error fetching weather for ${city}:`, error);
      }
    }

    return results;
  }

  private transformWeatherData(current: any, forecast: any): WeatherData {
    return {
      source: 'OpenWeatherMap',
      location: current.name,
      temperature: current.main.temp,
      humidity: current.main.humidity,
      rainfall: current.rain?.['1h'] || 0,
      windSpeed: current.wind.speed,
      conditions: current.weather[0].description,
      forecast: forecast.list.slice(0, 5).map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString().split('T')[0],
        temperature: {
          min: item.main.temp_min,
          max: item.main.temp_max
        },
        conditions: item.weather[0].description,
        rainfall: item.rain?.['3h'] || 0
      }))
    };
  }

  // Fetch agricultural news. The previous implementation fell back to a
  // hardcoded `generateMockNews` list on failure; that has been removed
  // so we now return [] when the News API is unavailable.
  private async fetchAgriNews(): Promise<AgriNewsData[]> {
    const results: AgriNewsData[] = [];

    try {
      const newsApiData = await this.fetchFromNewsAPI();
      results.push(...newsApiData);
    } catch (error) {
      console.error('News API failed:', error);
    }

    return results;
  }

  private async fetchFromNewsAPI(): Promise<AgriNewsData[]> {
    const config = this.dataSources.get('news_api')!;

    if (!config.enabled || !config.apiKey) {
      throw new Error('News API not configured');
    }

    const response = await axios.get(config.url, {
      params: {
        q: 'agriculture farming crops market prices india',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: config.apiKey
      },
      timeout: 10000
    });

    return response.data.articles.map((article: any) => ({
      source: article.source.name,
      title: article.title,
      summary: article.description || '',
      url: article.url,
      publishedAt: article.publishedAt,
      category: this.categorizeNews(article.title + ' ' + article.description),
      impact: this.assessNewsImpact(article.title + ' ' + article.description)
    }));
  }

  private categorizeNews(content: string): AgriNewsData['category'] {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('market') || lowerContent.includes('price') || lowerContent.includes('trading')) {
      return 'market';
    }
    if (lowerContent.includes('weather') || lowerContent.includes('rain') || lowerContent.includes('climate')) {
      return 'weather';
    }
    if (lowerContent.includes('policy') || lowerContent.includes('government') || lowerContent.includes('regulation')) {
      return 'policy';
    }
    if (lowerContent.includes('technology') || lowerContent.includes('ai') || lowerContent.includes('digital')) {
      return 'technology';
    }

    return 'general';
  }

  private assessNewsImpact(content: string): AgriNewsData['impact'] {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('crisis') || lowerContent.includes('shortage') || lowerContent.includes('ban')) {
      return 'high';
    }
    if (lowerContent.includes('change') || lowerContent.includes('new') || lowerContent.includes('increase')) {
      return 'medium';
    }

    return 'low';
  }

  // Fetch commodity futures data.
  // The original implementation returned fabricated numbers from
  // `generateMockFuturesData`; that has been removed. We return [] until
  // a real MCX / NCDEX feed is wired in.
  private async fetchCommodityFutures(): Promise<any[]> {
    return [];
  }

  private determineQuality(price: number): string {
    if (price > 5000) return 'Premium';
    if (price > 3000) return 'Good';
    if (price > 1500) return 'Average';
    return 'Below Average';
  }

  // Get health status of all data sources
  async getDataSourcesHealth(): Promise<Map<string, { status: 'online' | 'offline' | 'degraded'; lastCheck: string; responseTime?: number }>> {
    const health = new Map();

    for (const [key, config] of this.dataSources) {
      if (!config.enabled) {
        health.set(key, { status: 'offline', lastCheck: new Date().toISOString() });
        continue;
      }

      try {
        const startTime = Date.now();

        // Simple health check - try to reach the endpoint
        const response = await axios.get(config.url, {
          timeout: 5000,
          headers: config.headers || {}
        });

        const responseTime = Date.now() - startTime;
        const status = response.status === 200 ? 'online' : 'degraded';

        health.set(key, {
          status,
          lastCheck: new Date().toISOString(),
          responseTime
        });
      } catch (error) {
        health.set(key, {
          status: 'offline',
          lastCheck: new Date().toISOString()
        });
      }
    }

    return health;
  }

  // Configure data source
  configureDataSource(key: string, config: Partial<DataSourceConfig>) {
    const existingConfig = this.dataSources.get(key);
    if (existingConfig) {
      this.dataSources.set(key, { ...existingConfig, ...config });
    }
  }

  // Get available data sources
  getDataSources(): Map<string, DataSourceConfig> {
    return new Map(this.dataSources);
  }

  // Clear cache
  clearCache(dataType?: string) {
    if (dataType) {
      this.cache.delete(dataType);
    } else {
      this.cache.clear();
    }
  }

  // Get cache statistics
  getCacheStats(): { total: number; size: number; oldest: string | null; newest: string | null } {
    const entries = Array.from(this.cache.values());

    return {
      total: entries.length,
      size: JSON.stringify(entries).length,
      oldest: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.timestamp))).toISOString() : null,
      newest: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.timestamp))).toISOString() : null
    };
  }

  isWebSocketConnected(): boolean {
    return navigator.onLine;
  }

  disableWebSocket(): void {
    console.log('WebSocket connection disabled (using HTTP Polling fallback)');
  }
}

export default new RealTimeDataService();
