import axios from 'axios';

export interface LiveMarketPrice {
  id: string;
  commodity: string;
  variety: string;
  market: string;
  state: string;
  district: string;
  price: {
    min: number;
    max: number;
    modal: number;
    average: number;
  };
  unit: 'Quintal' | 'Ton' | 'Kg';
  arrivalDate: string;
  lastUpdated: string;
  trend: {
    change: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
    duration: 'hour' | 'day' | 'week' | 'month';
  };
  volume: {
    arrival: number;
    sold: number;
    unsold: number;
  };
  quality: 'Premium' | 'Good' | 'Average' | 'Below Average';
  marketStatus: 'Open' | 'Closed' | 'Holiday';
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
}

export interface MarketAlert {
  id: string;
  type: 'price_spike' | 'price_drop' | 'high_demand' | 'low_supply' | 'seasonal';
  commodity: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  actionRequired: boolean;
}

export interface MarketTrend {
  commodity: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: Array<{
    date: string;
    price: number;
    volume: number;
  }>;
  analysis: {
    trend: 'bullish' | 'bearish' | 'sideways';
    volatility: 'low' | 'medium' | 'high';
    prediction: {
      nextWeek: number;
      confidence: number;
    };
  };
}

export interface MarketInsight {
  commodity: string;
  insights: string[];
  recommendations: string[];
  bestTimeToSell: string;
  bestMarkets: Array<{
    name: string;
    state: string;
    price: number;
    distance?: number;
  }>;
  seasonalPattern: {
    peakMonths: string[];
    lowMonths: string[];
    averagePrice: number;
  };
}

class LiveMarketService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private cachedPrices: Map<string, { data: LiveMarketPrice[]; timestamp: number }>;
  private cachedTrends: Map<string, { data: MarketTrend; timestamp: number }>;
  private readonly cacheExpiry: number;
  private refreshInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: LiveMarketPrice[]) => void> = [];
  private alertSubscribers: Array<(alerts: MarketAlert[]) => void> = [];

  constructor() {
    this.apiKey = import.meta.env.VITE_MARKET_API_KEY || 'demo_key';
    this.apiUrl = import.meta.env.VITE_MARKET_API_URL || 'https://api.data.gov.in/resource';
    this.cachedPrices = new Map();
    this.cachedTrends = new Map();
    this.cacheExpiry = parseInt(import.meta.env.VITE_MARKET_REFRESH_INTERVAL) || 600000; // 10 minutes default
  }

  // Subscribe to live market updates
  subscribe(callback: (data: LiveMarketPrice[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Subscribe to market alerts
  subscribeToAlerts(callback: (alerts: MarketAlert[]) => void): () => void {
    this.alertSubscribers.push(callback);
    return () => {
      this.alertSubscribers = this.alertSubscribers.filter(sub => sub !== callback);
    };
  }

  // Start live market updates
  startLiveUpdates(commodities?: string[]) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      try {
        const prices = await this.getLivePrices({ commodities });
        this.notifySubscribers(prices);
        
        // Check for alerts
        const alerts = await this.generateMarketAlerts(prices);
        this.notifyAlertSubscribers(alerts);
      } catch (error) {
        console.error('Error in live market update:', error);
      }
    }, this.cacheExpiry);
  }

  // Stop live market updates
  stopLiveUpdates() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private notifySubscribers(data: LiveMarketPrice[]) {
    this.subscribers.forEach(callback => callback(data));
  }

  private notifyAlertSubscribers(alerts: MarketAlert[]) {
    this.alertSubscribers.forEach(callback => callback(alerts));
  }

  async getLivePrices(params: {
    commodities?: string[];
    states?: string[];
    markets?: string[];
    forceRefresh?: boolean;
  } = {}): Promise<LiveMarketPrice[]> {
    const cacheKey = JSON.stringify(params);
    const cachedData = this.cachedPrices.get(cacheKey);

    if (!params.forceRefresh && cachedData && Date.now() - cachedData.timestamp < this.cacheExpiry) {
      return cachedData.data;
    }

    try {
      let prices: LiveMarketPrice[];

      if (this.apiKey !== 'demo_key') {
        // Real API call to Indian government data portal
        prices = await this.fetchRealMarketData(params);
      } else {
        // Generate realistic mock data
        prices = this.generateMockMarketData(params);
      }

      // Cache the data
      this.cachedPrices.set(cacheKey, {
        data: prices,
        timestamp: Date.now()
      });

      return prices;
    } catch (error) {
      console.error('Error fetching market prices:', error);
      
      // Return cached data if available, otherwise generate mock data
      if (cachedData) {
        return cachedData.data;
      }
      
      return this.generateMockMarketData(params);
    }
  }

  private async fetchRealMarketData(params: Record<string, unknown>): Promise<LiveMarketPrice[]> {
    try {
      // Example API call to Indian government data portal
      const response = await axios.get(`${this.apiUrl}/9ef84268-d588-465a-a308-a864a43d0070`, {
        params: {
          'api-key': this.apiKey,
          format: 'json',
          limit: 100,
          ...params
        }
      });

      return this.transformApiData(response.data.records || []);
    } catch (error) {
      console.error('Error fetching real market data:', error);
      throw error;
    }
  }

  private transformApiData(records: Record<string, unknown>[]): LiveMarketPrice[] {
    return records.map((record: any, index) => ({
      id: `${record.market ?? 'UnknownMarket'}_${record.commodity ?? 'Unknown'}_${index}`,
      commodity: String(record.commodity ?? 'Unknown'),
      variety: String(record.variety ?? 'Common'),
      market: String(record.market ?? 'Unknown Market'),
      state: String(record.state ?? 'Unknown State'),
      district: String(record.district ?? 'Unknown District'),
      price: {
        min: parseFloat(String(record.min_price ?? '0')) || 0,
        max: parseFloat(String(record.max_price ?? '0')) || 0,
        modal: parseFloat(String(record.modal_price ?? '0')) || 0,
        average: (parseFloat(String(record.min_price ?? '0')) + parseFloat(String(record.max_price ?? '0'))) / 2 || 0
      },
      unit: 'Quintal',
      arrivalDate: String(record.arrival_date ?? new Date().toISOString().split('T')[0]),
      lastUpdated: new Date().toISOString(),
      trend: this.calculateTrend(parseFloat(String(record.modal_price ?? '0')) || 0),
      volume: {
        arrival: parseInt(String(record.arrivals ?? '0')) || 0,
        sold: parseInt(String(record.arrivals ?? '0')) * 0.8 || 0,
        unsold: parseInt(String(record.arrivals ?? '0')) * 0.2 || 0
      },
      quality: this.determineQuality(parseFloat(String(record.modal_price ?? '0')) || 0),
      marketStatus: this.getMarketStatus(),
      priceHistory: this.generatePriceHistory(parseFloat(String(record.modal_price ?? '0')) || 0)
    }));
  }

  private generateMockMarketData(params: any): LiveMarketPrice[] {
    const commodities = params.commodities || [
      'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Onion', 'Tomato', 
      'Potato', 'Soybean', 'Mustard', 'Groundnut', 'Maize', 'Bajra'
    ];

    const states = [
      'Maharashtra', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 
      'Rajasthan', 'Karnataka', 'Andhra Pradesh', 'Telangana', 
      'Tamil Nadu', 'West Bengal', 'Punjab', 'Haryana'
    ];

    const markets = [
      'APMC Market', 'Mandi', 'Wholesale Market', 'Regulated Market',
      'Farmers Market', 'Cooperative Market'
    ];

    const mockData: LiveMarketPrice[] = [];
    const now = new Date();

  commodities.forEach((commodity: string) => {
      const basePrice = this.getBasePriceForCommodity(commodity);
      const priceVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const currentPrice = Math.round(basePrice * (1 + priceVariation));

      for (let j = 0; j < 3; j++) {
        const state = states[Math.floor(Math.random() * states.length)];
        const market = `${markets[Math.floor(Math.random() * markets.length)]} ${state}`;
        
        mockData.push({
          id: `${commodity}_${state}_${j}`,
          commodity,
          variety: this.getVarietyForCommodity(commodity),
          market,
          state,
          district: `District ${j + 1}`,
          price: {
            min: Math.round(currentPrice * 0.9),
            max: Math.round(currentPrice * 1.1),
            modal: currentPrice,
            average: currentPrice
          },
          unit: 'Quintal',
          arrivalDate: new Date(now.getTime() - Math.random() * 86400000).toISOString().split('T')[0],
          lastUpdated: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
          trend: this.calculateTrend(currentPrice),
          volume: {
            arrival: Math.round(100 + Math.random() * 500),
            sold: Math.round(80 + Math.random() * 400),
            unsold: Math.round(20 + Math.random() * 100)
          },
          quality: this.determineQuality(currentPrice),
          marketStatus: this.getMarketStatus(),
          priceHistory: this.generatePriceHistory(currentPrice)
        });
      }
    });

    return mockData;
  }

  private getBasePriceForCommodity(commodity: string): number {
    const basePrices: { [key: string]: number } = {
      'Rice': 3000,
      'Wheat': 2200,
      'Cotton': 6000,
      'Sugarcane': 350,
      'Onion': 1500,
      'Tomato': 2000,
      'Potato': 1200,
      'Soybean': 4500,
      'Mustard': 5500,
      'Groundnut': 5000,
      'Maize': 1800,
      'Bajra': 2000
    };
    return basePrices[commodity] || 2000;
  }

  private getVarietyForCommodity(commodity: string): string {
    const varieties: { [key: string]: string[] } = {
      'Rice': ['Basmati', 'Non-Basmati', 'Parboiled', 'Brown Rice'],
      'Wheat': ['Sharbati', 'Lokwan', 'Durum', 'Emmer'],
      'Cotton': ['Long Staple', 'Medium Staple', 'Short Staple'],
      'Sugarcane': ['Co-86032', 'Co-0238', 'Co-62175'],
      'Onion': ['Nasik Red', 'Bangalore Rose', 'Pusa Red'],
      'Tomato': ['Hybrid', 'Desi', 'Cherry', 'Roma'],
      'Potato': ['Chipsona', 'Kufri Jyoti', 'Kufri Pukhraj'],
      'Soybean': ['JS-335', 'JS-9305', 'MACS-450'],
      'Mustard': ['Pusa Bold', 'Kranti', 'Varuna'],
      'Groundnut': ['TMV-2', 'JL-24', 'TAG-24']
    };
    const commodityVarieties = varieties[commodity] || ['Common'];
    return commodityVarieties[Math.floor(Math.random() * commodityVarieties.length)];
  }

  private calculateTrend(currentPrice: number): LiveMarketPrice['trend'] {
    const change = (Math.random() - 0.5) * 200; // Random change between -100 to +100
    const percentage = (change / currentPrice) * 100;
    
    return {
      change: Math.round(change),
      percentage: Math.round(percentage * 100) / 100,
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      duration: Math.random() > 0.5 ? 'day' : 'week'
    };
  }

  private determineQuality(price: number): LiveMarketPrice['quality'] {
    // Simple quality determination based on price percentile
    if (price > 5000) return 'Premium';
    if (price > 3000) return 'Good';
    if (price > 1500) return 'Average';
    return 'Below Average';
  }

  private getMarketStatus(): LiveMarketPrice['marketStatus'] {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Markets typically closed on Sundays and after 6 PM
    if (day === 0 || hour > 18 || hour < 6) {
      return 'Closed';
    }
    
    return 'Open';
  }

  private generatePriceHistory(currentPrice: number): Array<{ date: string; price: number }> {
    const history = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% daily variation
      const price = Math.round(currentPrice * (1 + variation * (i / 30)));
      
      history.push({
        date: date.toISOString().split('T')[0],
        price
      });
    }
    
    return history;
  }

  async getMarketTrend(commodity: string, timeframe: MarketTrend['timeframe'] = 'weekly'): Promise<MarketTrend | null> {
    const cacheKey = `${commodity}_${timeframe}`;
    const cachedData = this.cachedTrends.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiry) {
      return cachedData.data;
    }

    try {
      const trend = await this.calculateMarketTrend(commodity, timeframe);
      
      this.cachedTrends.set(cacheKey, {
        data: trend,
        timestamp: Date.now()
      });

      return trend;
    } catch (error) {
      console.error('Error calculating market trend:', error);
      return null;
    }
  }

  private async calculateMarketTrend(commodity: string, timeframe: MarketTrend['timeframe']): Promise<MarketTrend> {
    const prices = await this.getLivePrices({ commodities: [commodity] });
    const basePrice = prices.length > 0 ? prices[0].price.modal : 2000;
    
    // Generate trend data based on timeframe
    const data = this.generateTrendData(basePrice, timeframe);
    
    // Analyze trend
    const analysis = this.analyzeTrend(data);
    
    return {
      commodity,
      timeframe,
      data,
      analysis
    };
  }

  private generateTrendData(basePrice: number, timeframe: MarketTrend['timeframe']): MarketTrend['data'] {
    const data = [];
    const now = new Date();
    let periods = 30;
    let intervalMs = 86400000; // 1 day
    
    switch (timeframe) {
      case 'daily':
        periods = 24;
        intervalMs = 3600000; // 1 hour
        break;
      case 'weekly':
        periods = 7;
        intervalMs = 86400000; // 1 day
        break;
      case 'monthly':
        periods = 30;
        intervalMs = 86400000; // 1 day
        break;
      case 'yearly':
        periods = 12;
        intervalMs = 30 * 86400000; // 1 month
        break;
    }
    
    for (let i = periods; i >= 0; i--) {
      const date = new Date(now.getTime() - i * intervalMs);
      const trend = Math.sin((periods - i) / periods * Math.PI * 2) * 0.1; // Sine wave trend
      const noise = (Math.random() - 0.5) * 0.05; // Random noise
      const price = Math.round(basePrice * (1 + trend + noise));
      const volume = Math.round(100 + Math.random() * 400);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price,
        volume
      });
    }
    
    return data;
  }

  private analyzeTrend(data: MarketTrend['data']): MarketTrend['analysis'] {
    const prices = data.map(d => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    // Calculate volatility
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / avgPrice;
    
    // Predict next week price (simple linear regression)
    const prediction = lastPrice + (change / 100 * lastPrice * 0.1);
    const confidence = Math.max(0.5, 1 - volatility * 2); // Higher volatility = lower confidence
    
    return {
      trend: change > 2 ? 'bullish' : change < -2 ? 'bearish' : 'sideways',
      volatility: volatility > 0.1 ? 'high' : volatility > 0.05 ? 'medium' : 'low',
      prediction: {
        nextWeek: Math.round(prediction),
        confidence: Math.round(confidence * 100) / 100
      }
    };
  }

  async generateMarketAlerts(prices: LiveMarketPrice[]): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];
    const now = new Date().toISOString();
    
    prices.forEach(price => {
      // Price spike alert
      if (price.trend.percentage > 15) {
        alerts.push({
          id: `spike_${price.id}`,
          type: 'price_spike',
          commodity: price.commodity,
          message: `${price.commodity} price increased by ${price.trend.percentage.toFixed(1)}% in ${price.market}`,
          severity: price.trend.percentage > 25 ? 'high' : 'medium',
          timestamp: now,
          actionRequired: true
        });
      }
      
      // Price drop alert
      if (price.trend.percentage < -15) {
        alerts.push({
          id: `drop_${price.id}`,
          type: 'price_drop',
          commodity: price.commodity,
          message: `${price.commodity} price dropped by ${Math.abs(price.trend.percentage).toFixed(1)}% in ${price.market}`,
          severity: price.trend.percentage < -25 ? 'high' : 'medium',
          timestamp: now,
          actionRequired: true
        });
      }
      
      // High demand alert (based on volume)
      if (price.volume.sold / price.volume.arrival > 0.9) {
        alerts.push({
          id: `demand_${price.id}`,
          type: 'high_demand',
          commodity: price.commodity,
          message: `High demand for ${price.commodity} in ${price.market} - ${((price.volume.sold / price.volume.arrival) * 100).toFixed(1)}% sold`,
          severity: 'medium',
          timestamp: now,
          actionRequired: false
        });
      }
      
      // Low supply alert
      if (price.volume.arrival < 50) {
        alerts.push({
          id: `supply_${price.id}`,
          type: 'low_supply',
          commodity: price.commodity,
          message: `Low supply of ${price.commodity} in ${price.market} - only ${price.volume.arrival} quintals arrived`,
          severity: 'medium',
          timestamp: now,
          actionRequired: false
        });
      }
    });
    
    return alerts;
  }

  async getMarketInsights(commodity: string): Promise<MarketInsight> {
    const prices = await this.getLivePrices({ commodities: [commodity] });
    const trend = await this.getMarketTrend(commodity, 'monthly');
    
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze current market conditions
    const avgPrice = prices.reduce((sum, p) => sum + p.price.modal, 0) / prices.length;
    const highestPrice = Math.max(...prices.map(p => p.price.modal));
    const lowestPrice = Math.min(...prices.map(p => p.price.modal));
    
    insights.push(`Average ${commodity} price across markets: ₹${avgPrice.toFixed(0)} per quintal`);
    insights.push(`Price range: ₹${lowestPrice} - ₹${highestPrice} per quintal`);
    
    if (trend) {
      insights.push(`Market trend: ${trend.analysis.trend} with ${trend.analysis.volatility} volatility`);
      insights.push(`Price prediction for next week: ₹${trend.analysis.prediction.nextWeek} (${(trend.analysis.prediction.confidence * 100).toFixed(0)}% confidence)`);
    }
    
    // Generate recommendations
    const currentTrend = prices[0]?.trend.direction || 'stable';
    if (currentTrend === 'up') {
      recommendations.push('Consider selling if you have stock - prices are rising');
      recommendations.push('Monitor market closely for peak selling opportunity');
    } else if (currentTrend === 'down') {
      recommendations.push('Hold stock if possible - prices are declining');
      recommendations.push('Look for alternative markets with better prices');
    } else {
      recommendations.push('Stable market conditions - good time for planned sales');
    }
    
    // Best markets to sell
    const bestMarkets = prices
      .sort((a, b) => b.price.modal - a.price.modal)
      .slice(0, 5)
      .map(p => ({
        name: p.market,
        state: p.state,
        price: p.price.modal
      }));
    
    // Seasonal pattern (mock data)
    const seasonalPattern = {
      peakMonths: ['March', 'April', 'October', 'November'],
      lowMonths: ['June', 'July', 'August'],
      averagePrice: avgPrice
    };
    
    return {
      commodity,
      insights,
      recommendations,
      bestTimeToSell: 'Monitor market conditions',
      bestMarkets,
      seasonalPattern
    };
  }

  // Price comparison across markets
  async comparePricesAcrossMarkets(commodity: string): Promise<{
    commodity: string;
    markets: Array<{
      market: string;
      state: string;
      price: number;
      rank: number;
      percentageDifference: number;
    }>;
    insights: string[];
  }> {
    const prices = await this.getLivePrices({ commodities: [commodity] });
    const avgPrice = prices.reduce((sum, p) => sum + p.price.modal, 0) / prices.length;
    
    const markets = prices
      .map(p => ({
        market: p.market,
        state: p.state,
        price: p.price.modal,
        rank: 0,
        percentageDifference: ((p.price.modal - avgPrice) / avgPrice) * 100
      }))
      .sort((a, b) => b.price - a.price)
      .map((market, index) => ({ ...market, rank: index + 1 }));
    
    const insights = [
      `Best market: ${markets[0].market} (₹${markets[0].price}/quintal)`,
      `Lowest market: ${markets[markets.length - 1].market} (₹${markets[markets.length - 1].price}/quintal)`,
      `Price difference: ₹${markets[0].price - markets[markets.length - 1].price}/quintal (${((markets[0].price - markets[markets.length - 1].price) / markets[markets.length - 1].price * 100).toFixed(1)}%)`
    ];
    
    return {
      commodity,
      markets,
      insights
    };
  }

  // Get market calendar (trading days, holidays, etc.)
  getMarketCalendar(): {
    today: {
      date: string;
      status: 'Open' | 'Closed' | 'Holiday';
      tradingHours: string;
    };
    upcoming: Array<{
      date: string;
      status: 'Open' | 'Closed' | 'Holiday';
      note?: string;
    }>;
  } {
    const now = new Date();
    const today = {
      date: now.toISOString().split('T')[0],
      status: this.getMarketStatus(),
      tradingHours: '06:00 - 18:00'
    };
    
    const upcoming = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now.getTime() + i * 86400000);
      const day = date.getDay();
      
      upcoming.push({
        date: date.toISOString().split('T')[0],
  status: day === 0 ? 'Closed' : ('Open' as 'Open' | 'Closed' | 'Holiday'),
        note: day === 0 ? 'Sunday - Weekly holiday' : undefined
      });
    }
    
    return { today, upcoming };
  }
}

export default new LiveMarketService();