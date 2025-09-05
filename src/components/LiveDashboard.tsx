import React, { useState, useEffect, useCallback } from 'react';
// ...existing code...
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Cloud,
  Sun,
  Droplets,
  Wind,
  AlertTriangle,
  RefreshCw,
  Bell,
  MapPin,
  // ...existing code...
  DollarSign,
  BarChart3,
  Thermometer,
  Eye,
  Zap,
  Target,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import liveWeatherService, { LiveWeatherData } from '../services/liveWeatherService';
import liveMarketService, { LiveMarketPrice, MarketAlert } from '../services/liveMarketService';

interface LiveDashboardProps {
  location?: {
    lat: number;
    lon: number;
    name: string;
  };
  commodities?: string[];
}

const LiveDashboard: React.FC<LiveDashboardProps> = ({ 
  location, 
  commodities = ['Rice', 'Wheat', 'Cotton', 'Onion', 'Tomato'] 
}) => {
  // ...existing code...
  
  // State management
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [marketPrices, setMarketPrices] = useState<LiveMarketPrice[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize live data
  const initializeLiveData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current location if not provided
      let currentLocation = location;
      if (!currentLocation) {
        const detectedLocation = await liveWeatherService.getCurrentLocation();
        if (detectedLocation) {
          currentLocation = detectedLocation;
        } else {
          // Fallback to Mumbai
          currentLocation = { lat: 19.0760, lon: 72.8777, name: 'Mumbai' };
        }
      }

      // Fetch weather data
      if (currentLocation) {
  const weather = await liveWeatherService.getWeatherData({ ...currentLocation, country: 'India' }, true);
        if (weather) {
          setWeatherData(weather);
        }
      }

      // Fetch market data
      const prices = await liveMarketService.getLivePrices({ 
        commodities, 
        forceRefresh: true 
      });
      setMarketPrices(prices);

      // Generate market alerts
      const alerts = await liveMarketService.generateMarketAlerts(prices);
      setMarketAlerts(alerts);

      setLastUpdated(new Date());
      setIsConnected(true);
    } catch (err: any) {
      console.error('Error initializing live data:', err);
      setError(err.message || 'Failed to load live data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [location, commodities]);

  // Setup live updates
  useEffect(() => {
    initializeLiveData();

    if (autoRefresh) {
      // Subscribe to live weather updates
      const weatherUnsubscribe = liveWeatherService.subscribe((data) => {
        setWeatherData(data);
        setLastUpdated(new Date());
      });

      // Subscribe to live market updates
      const marketUnsubscribe = liveMarketService.subscribe((data) => {
        setMarketPrices(data);
        setLastUpdated(new Date());
      });

      // Subscribe to market alerts
      const alertUnsubscribe = liveMarketService.subscribeToAlerts((alerts) => {
        setMarketAlerts(alerts);
      });

      // Start live updates
      if (location) {
  liveWeatherService.startLiveUpdates({ ...location, country: 'India' });
      }
      liveMarketService.startLiveUpdates(commodities);

      return () => {
        weatherUnsubscribe();
        marketUnsubscribe();
        alertUnsubscribe();
        liveWeatherService.stopLiveUpdates();
        liveMarketService.stopLiveUpdates();
      };
    }
  }, [initializeLiveData, autoRefresh, location, commodities]);

  // Manual refresh
  const handleRefresh = () => {
    initializeLiveData();
  };

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      initializeLiveData();
    }
  };

  // Get weather icon
  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Clear': <Sun className="text-yellow-500" size={24} />,
      'Clouds': <Cloud className="text-gray-500" size={24} />,
      'Rain': <Droplets className="text-blue-500" size={24} />,
      'Thunderstorm': <Zap className="text-purple-500" size={24} />,
      'Snow': <Cloud className="text-blue-200" size={24} />,
      'Mist': <Eye className="text-gray-400" size={24} />,
      'Fog': <Eye className="text-gray-400" size={24} />
    };
    return iconMap[condition] || <Cloud className="text-gray-500" size={24} />;
  };

  // Get trend icon
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="text-green-500" size={16} />;
      case 'down': return <TrendingDown className="text-red-500" size={16} />;
      default: return <BarChart3 className="text-gray-500" size={16} />;
    }
  };

  // Get alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-500 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-green-600" size={48} />
          <p className="text-gray-600">Loading live data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Live Agricultural Dashboard</h1>
              <p className="text-gray-600">Real-time weather and market data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            {/* Auto Refresh Toggle */}
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                autoRefresh 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Activity size={16} className={autoRefresh ? 'animate-pulse' : ''} />
              <span>{autoRefresh ? 'Live' : 'Manual'}</span>
            </button>
            
            {/* Manual Refresh */}
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Last Updated */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-2" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {marketAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Bell className="text-orange-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Live Alerts</h2>
            <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
              {marketAlerts.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {marketAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 rounded-r-lg p-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{alert.commodity}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <div className="text-xs opacity-75">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather and Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Weather */}
        {weatherData && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MapPin size={20} />
                <h2 className="text-xl font-semibold">{weatherData.location.name}</h2>
              </div>
              {getWeatherIcon(weatherData.current.condition)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-3xl font-bold">{weatherData.current.temp}°C</div>
                <div className="text-blue-100 capitalize">{weatherData.current.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Feels like</div>
                <div className="text-xl font-semibold">{weatherData.current.feelsLike}°C</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Droplets size={16} className="mx-auto mb-1" />
                <div className="font-medium">{weatherData.current.humidity}%</div>
                <div className="text-blue-100">Humidity</div>
              </div>
              <div className="text-center">
                <Wind size={16} className="mx-auto mb-1" />
                <div className="font-medium">{weatherData.current.windSpeed.toFixed(1)} km/h</div>
                <div className="text-blue-100">Wind</div>
              </div>
              <div className="text-center">
                <Eye size={16} className="mx-auto mb-1" />
                <div className="font-medium">{weatherData.current.visibility.toFixed(1)} km</div>
                <div className="text-blue-100">Visibility</div>
              </div>
            </div>
            
            {/* Agricultural Conditions */}
            <div className="mt-4 pt-4 border-t border-blue-400">
              <div className="flex items-center justify-between text-sm">
                <span>Spraying Conditions:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  weatherData.agricultural.sprayingConditions === 'Excellent' ? 'bg-green-500 text-white' :
                  weatherData.agricultural.sprayingConditions === 'Good' ? 'bg-green-400 text-white' :
                  weatherData.agricultural.sprayingConditions === 'Fair' ? 'bg-yellow-400 text-black' :
                  'bg-red-400 text-white'
                }`}>
                  {weatherData.agricultural.sprayingConditions}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Market Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Market Summary</h2>
            <DollarSign className="text-green-500" size={24} />
          </div>
          
          <div className="space-y-4">
            {marketPrices.slice(0, 5).map((price) => (
              <div key={price.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{price.commodity}</div>
                  <div className="text-sm text-gray-600">{price.market}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{price.price.modal.toLocaleString()}</div>
                  <div className="flex items-center text-sm">
                    {getTrendIcon(price.trend.direction)}
                    <span className={`ml-1 ${
                      price.trend.direction === 'up' ? 'text-green-600' :
                      price.trend.direction === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {price.trend.percentage > 0 ? '+' : ''}{price.trend.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Markets Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                marketPrices[0]?.marketStatus === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {marketPrices[0]?.marketStatus || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Weather Forecast */}
      {weatherData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">24-Hour Weather Forecast</h2>
          
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {weatherData.hourly.slice(0, 12).map((hour, index) => (
              <div key={index} className="flex-shrink-0 text-center bg-gray-50 rounded-lg p-3 min-w-[100px]">
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="mb-2">
                  {getWeatherIcon(hour.description)}
                </div>
                <div className="font-bold text-lg">{hour.temp}°C</div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>{hour.humidity}% humidity</div>
                  {hour.rainfall > 0 && (
                    <div className="text-blue-600">{hour.rainfall.toFixed(1)}mm rain</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agricultural Recommendations */}
      {weatherData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Target className="text-green-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Live Agricultural Recommendations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather-based recommendations */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Weather-Based Actions</h3>
              <div className="space-y-2">
                {liveWeatherService.getAgriculturalRecommendations(weatherData).map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Market-based recommendations */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Market-Based Actions</h3>
              <div className="space-y-2">
                {marketPrices.slice(0, 3).map((price, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      {price.trend.direction === 'up' 
                        ? `Consider selling ${price.commodity} - prices rising by ${price.trend.percentage.toFixed(1)}%`
                        : price.trend.direction === 'down'
                        ? `Hold ${price.commodity} stock - prices falling by ${Math.abs(price.trend.percentage).toFixed(1)}%`
                        : `Stable ${price.commodity} prices - good time for planned sales`
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <Thermometer className="text-red-500 mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-800">
            {weatherData?.current.temp || '--'}°C
          </div>
          <div className="text-sm text-gray-600">Temperature</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <Droplets className="text-blue-500 mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-800">
            {weatherData?.current.humidity || '--'}%
          </div>
          <div className="text-sm text-gray-600">Humidity</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <TrendingUp className="text-green-500 mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-800">
            {marketPrices.filter(p => p.trend.direction === 'up').length}
          </div>
          <div className="text-sm text-gray-600">Rising Prices</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <Bell className="text-orange-500 mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-800">
            {marketAlerts.length}
          </div>
          <div className="text-sm text-gray-600">Active Alerts</div>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;