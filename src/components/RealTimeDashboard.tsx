import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, Cloud, Newspaper, 
  AlertCircle, CheckCircle, RefreshCw, Eye, BarChart3,
  MapPin, Calendar, Clock, Zap, Signal, Wifi, Database
} from 'lucide-react';
import realTimeDataService from '../services/realTimeDataService';
import type { RealTimeMarketData, WeatherData, AgriNewsData } from '../services/realTimeDataService';

interface LiveFeed {
  type: 'market' | 'weather' | 'news' | 'alert';
  data: any;
  timestamp: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
}

const RealTimeDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<RealTimeMarketData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [newsData, setNewsData] = useState<AgriNewsData[]>([]);
  const [liveFeed, setLiveFeed] = useState<LiveFeed[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedDataType, setSelectedDataType] = useState<'market' | 'weather' | 'news' | 'all'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Real-time subscription management
  useEffect(() => {
    const subscriptions: Array<() => void> = [];
    
    if (autoRefresh) {
      // Subscribe to market data
      const unsubscribeMarket = realTimeDataService.subscribe('market_prices', (data: RealTimeMarketData[]) => {
        setMarketData(data);
        addToLiveFeed('market', data, 'Market Data Service');
        setLastUpdate(new Date().toISOString());
      });
      
      // Subscribe to weather data
      const unsubscribeWeather = realTimeDataService.subscribe('weather', (data: WeatherData[]) => {
        setWeatherData(data);
        addToLiveFeed('weather', data, 'Weather Service');
        setLastUpdate(new Date().toISOString());
      });
      
      // Subscribe to news data
      const unsubscribeNews = realTimeDataService.subscribe('news', (data: AgriNewsData[]) => {
        setNewsData(data);
        addToLiveFeed('news', data, 'News Service');
        setLastUpdate(new Date().toISOString());
      });
      
      subscriptions.push(unsubscribeMarket, unsubscribeWeather, unsubscribeNews);
      
      // Start real-time updates
      realTimeDataService.startRealTimeUpdates(['market_prices', 'weather', 'news'], refreshInterval);
      setIsConnected(true);
    }
    
    return () => {
      subscriptions.forEach(unsub => unsub());
      realTimeDataService.stopRealTimeUpdates();
      setIsConnected(false);
    };
  }, [autoRefresh, refreshInterval]);

  const addToLiveFeed = useCallback((type: LiveFeed['type'], data: any, source: string) => {
    const newFeedItem: LiveFeed = {
      type,
      data,
      timestamp: new Date().toISOString(),
      source,
      priority: determinePriority(type, data)
    };
    
    setLiveFeed(prev => [newFeedItem, ...prev.slice(0, 49)]); // Keep last 50 items
  }, []);

  const determinePriority = (type: string, data: any): 'high' | 'medium' | 'low' => {
    if (type === 'market') {
      const avgChange = Array.isArray(data) ? 
        data.reduce((sum: number, item: any) => sum + Math.abs(item.price?.changePercent || 0), 0) / data.length : 
        Math.abs(data.price?.changePercent || 0);
      
      if (avgChange > 5) return 'high';
      if (avgChange > 2) return 'medium';
      return 'low';
    }
    
    if (type === 'weather') {
      const hasExtreme = Array.isArray(data) ? 
        data.some((item: any) => item.temperature > 40 || item.temperature < 5 || item.rainfall > 50) :
        data.temperature > 40 || data.temperature < 5 || data.rainfall > 50;
      
      return hasExtreme ? 'high' : 'medium';
    }
    
    if (type === 'news') {
      return Array.isArray(data) ? 
        data.some((item: any) => item.impact === 'high') ? 'high' : 'medium' :
        data.impact === 'high' ? 'high' : 'medium';
    }
    
    return 'medium';
  };

  const refreshData = async () => {
    try {
      setIsConnected(false);
      
      const [market, weather, news] = await Promise.all([
        realTimeDataService.fetchData('market_prices', true),
        realTimeDataService.fetchData('weather', true),
        realTimeDataService.fetchData('news', true)
      ]);
      
      setMarketData(market);
      setWeatherData(weather);
      setNewsData(news);
      setLastUpdate(new Date().toISOString());
      setIsConnected(true);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsConnected(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredFeed = selectedDataType === 'all' ? 
    liveFeed : 
    liveFeed.filter(item => item.type === selectedDataType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Real-Time Dashboard</h1>
                <p className="text-gray-600 mt-1">Live agricultural data feeds and monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isConnected ? <Wifi className="w-4 h-4" /> : <Signal className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  autoRefresh
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Auto-refresh</span>
              </button>
              
              {/* Manual Refresh */}
              <button
                onClick={refreshData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Last Update */}
          {lastUpdate && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last updated: {formatTime(lastUpdate)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Data Summary Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Prices Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
                  Live Market Prices
                </h2>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {marketData.length} commodities
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketData.slice(0, 4).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{item.commodity}</h3>
                      <span className="text-xs text-gray-500">{item.source}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-800">
                          {formatPrice(item.price.current)}
                        </div>
                        <div className="text-sm text-gray-600">{item.market}</div>
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${
                        item.price.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.price.changePercent > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.abs(item.price.changePercent).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Cloud className="w-6 h-6 mr-2 text-blue-500" />
                  Weather Conditions
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {weatherData.length} locations
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weatherData.slice(0, 4).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </h3>
                      <span className="text-xs text-gray-500">{item.source}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Temperature:</span>
                        <div className="font-semibold">{item.temperature.toFixed(1)}°C</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Humidity:</span>
                        <div className="font-semibold">{item.humidity}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Rainfall:</span>
                        <div className="font-semibold">{item.rainfall.toFixed(1)}mm</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Wind:</span>
                        <div className="font-semibold">{item.windSpeed.toFixed(1)} km/h</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600 capitalize">
                      {item.conditions}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* News Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Newspaper className="w-6 h-6 mr-2 text-purple-500" />
                  Latest Agricultural News
                </h2>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {newsData.length} articles
                </span>
              </div>
              
              <div className="space-y-3">
                {newsData.slice(0, 3).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.impact === 'high' ? 'bg-red-100 text-red-700' :
                        item.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.impact.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.summary}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Database className="w-6 h-6 mr-2 text-orange-500" />
                Live Data Feed
              </h2>
              
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Data</option>
                <option value="market">Market Only</option>
                <option value="weather">Weather Only</option>
                <option value="news">News Only</option>
              </select>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredFeed.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${getPriorityColor(item.priority)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {item.type}
                    </span>
                    <span className="text-xs">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    {item.type === 'market' && Array.isArray(item.data) && (
                      <span>
                        Updated {item.data.length} market prices
                      </span>
                    )}
                    
                    {item.type === 'weather' && Array.isArray(item.data) && (
                      <span>
                        Weather updated for {item.data.length} locations
                      </span>
                    )}
                    
                    {item.type === 'news' && Array.isArray(item.data) && (
                      <span>
                        {item.data.length} new articles received
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    Source: {item.source}
                  </div>
                </div>
              ))}
              
              {filteredFeed.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No live feed data available</p>
                  <p className="text-sm">Data will appear here when received</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;