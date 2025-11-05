import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun, CloudRain, Cloud, Calendar, TrendingUp, TrendingDown, AlertTriangle, Sunrise, Sunset, Compass, Zap, Snowflake, CloudDrizzle, Navigation, Activity, BarChart3, Clock, Leaf, Sprout, Search, X, Star, History, Globe } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  pressure: number;
  uvIndex: number;
  feelsLike: number;
  dewPoint: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  moonPhase: string;
  airQuality: {
    index: number;
    level: string;
    pm25: number;
    pm10: number;
  };
  forecast: {
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    rainProbability: number;
  }[];
  hourlyForecast: {
    time: string;
    temp: number;
    condition: string;
    icon: string;
    rainChance: number;
    windSpeed: number;
  }[];
  alerts: {
    type: string;
    severity: string;
    message: string;
    validUntil: string;
  }[];
  historical: {
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
    rainfall: number;
  };
}

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('Delhi, India');
  const [selectedView, setSelectedView] = useState<'current' | 'forecast' | 'hourly' | 'historical'>('current');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(['Delhi, India', 'Mumbai, Maharashtra', 'Bangalore, Karnataka']);
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>(['Delhi, India', 'Punjab, India']);

  // Popular Indian cities for weather search
  const popularCities = [
    'Delhi, India', 'Mumbai, Maharashtra', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu',
    'Kolkata, West Bengal', 'Hyderabad, Telangana', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Chandigarh, Punjab', 'Bhopal, Madhya Pradesh',
    'Patna, Bihar', 'Thiruvananthapuram, Kerala', 'Guwahati, Assam', 'Ranchi, Jharkhand',
    'Raipur, Chhattisgarh', 'Gandhinagar, Gujarat', 'Shimla, Himachal Pradesh', 'Srinagar, Kashmir'
  ];

  const mockWeatherData: WeatherData = {
    location: 'Delhi, India',
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NW',
    visibility: 10,
    pressure: 1013,
    uvIndex: 6,
    feelsLike: 32,
    dewPoint: 19,
    cloudCover: 40,
    sunrise: '06:45 AM',
    sunset: '05:30 PM',
    moonPhase: 'Waxing Crescent',
    airQuality: {
      index: 85,
      level: 'Moderate',
      pm25: 45,
      pm10: 62
    },
    forecast: [
      { day: 'Today', date: '5 Nov', high: 28, low: 18, condition: 'Partly Cloudy', icon: '⛅', humidity: 65, windSpeed: 12, precipitation: 0, rainProbability: 10 },
      { day: 'Tomorrow', date: '6 Nov', high: 30, low: 20, condition: 'Sunny', icon: '☀️', humidity: 58, windSpeed: 8, precipitation: 0, rainProbability: 5 },
      { day: 'Thu', date: '7 Nov', high: 26, low: 16, condition: 'Rainy', icon: '🌧️', humidity: 85, windSpeed: 15, precipitation: 12, rainProbability: 80 },
      { day: 'Fri', date: '8 Nov', high: 24, low: 15, condition: 'Cloudy', icon: '☁️', humidity: 70, windSpeed: 10, precipitation: 2, rainProbability: 30 },
      { day: 'Sat', date: '9 Nov', high: 27, low: 17, condition: 'Sunny', icon: '☀️', humidity: 55, windSpeed: 6, precipitation: 0, rainProbability: 0 },
      { day: 'Sun', date: '10 Nov', high: 29, low: 19, condition: 'Partly Cloudy', icon: '⛅', humidity: 62, windSpeed: 9, precipitation: 0, rainProbability: 15 },
      { day: 'Mon', date: '11 Nov', high: 25, low: 16, condition: 'Thunderstorm', icon: '⛈️', humidity: 88, windSpeed: 20, precipitation: 25, rainProbability: 90 },
    ],
    hourlyForecast: [
      { time: '12 PM', temp: 28, condition: 'Partly Cloudy', icon: '⛅', rainChance: 10, windSpeed: 12 },
      { time: '1 PM', temp: 29, condition: 'Partly Cloudy', icon: '⛅', rainChance: 15, windSpeed: 14 },
      { time: '2 PM', temp: 30, condition: 'Sunny', icon: '☀️', rainChance: 5, windSpeed: 10 },
      { time: '3 PM', temp: 31, condition: 'Sunny', icon: '☀️', rainChance: 0, windSpeed: 8 },
      { time: '4 PM', temp: 30, condition: 'Partly Cloudy', icon: '⛅', rainChance: 10, windSpeed: 12 },
      { time: '5 PM', temp: 28, condition: 'Cloudy', icon: '☁️', rainChance: 20, windSpeed: 15 },
      { time: '6 PM', temp: 26, condition: 'Cloudy', icon: '☁️', rainChance: 25, windSpeed: 18 },
      { time: '7 PM', temp: 24, condition: 'Rainy', icon: '🌧️', rainChance: 60, windSpeed: 20 },
    ],
    alerts: [
      {
        type: 'Heat Warning',
        severity: 'Medium',
        message: 'High temperatures expected. Stay hydrated and avoid prolonged sun exposure.',
        validUntil: '6 PM Today'
      },
      {
        type: 'Air Quality Alert',
        severity: 'Low',
        message: 'Moderate air quality. Sensitive individuals should limit outdoor activities.',
        validUntil: '11 PM Today'
      }
    ],
    historical: {
      avgTemp: 26,
      maxTemp: 35,
      minTemp: 12,
      rainfall: 145
    }
  };

  useEffect(() => {
    loadWeather();
    if (autoRefresh) {
      const interval = setInterval(loadWeather, 300000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [location, autoRefresh]);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setWeatherData(mockWeatherData);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Weather data unavailable');
    } finally {
      setLoading(false);
    }
  };

  const refreshWeather = () => {
    loadWeather();
  };

  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="text-yellow-500" size={24} />;
      case 'rainy': return <CloudRain className="text-blue-500" size={24} />;
      case 'cloudy': return <Cloud className="text-gray-500" size={24} />;
      case 'partly cloudy': return <Cloud className="text-gray-400" size={24} />;
      case 'thunderstorm': return <Zap className="text-purple-500" size={24} />;
      case 'drizzle': return <CloudDrizzle className="text-blue-400" size={24} />;
      case 'snow': return <Snowflake className="text-blue-200" size={24} />;
      default: return <Sun className="text-yellow-500" size={24} />;
    }
  };

  const getAirQualityColor = (index: number) => {
    if (index <= 50) return 'text-green-600 bg-green-100';
    if (index <= 100) return 'text-yellow-600 bg-yellow-100';
    if (index <= 150) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getUVIndexColor = (index: number) => {
    if (index <= 2) return 'text-green-600 bg-green-100';
    if (index <= 5) return 'text-yellow-600 bg-yellow-100';
    if (index <= 7) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const handleSearch = (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = popularCities.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const selectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setSearchQuery('');
    setShowSearchResults(false);
    
    // Add to search history
    const newHistory = [selectedLocation, ...searchHistory.filter(item => item !== selectedLocation)].slice(0, 5);
    setSearchHistory(newHistory);
    
    // Reload weather for new location
    loadWeather();
  };

  const toggleFavorite = (locationName: string) => {
    if (favoriteLocations.includes(locationName)) {
      setFavoriteLocations(favoriteLocations.filter(fav => fav !== locationName));
    } else {
      setFavoriteLocations([...favoriteLocations, locationName]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          const mockLocation = `Current Location (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})`;
          setLocation(mockLocation);
          loadWeather();
        },
        (error) => {
          setError('Unable to get current location');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center p-4">
        <RefreshCw className="animate-spin text-green-600" size={48} />
        <span className="ml-2 text-lg mt-4 text-gray-600">Loading Advanced Weather Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center p-4">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button 
          onClick={refreshWeather}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                <CloudRain size={32} />
              </div>
              Advanced Weather Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Professional weather insights for smart farming</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-green-600"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
            
            <button 
              onClick={refreshWeather}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for cities, states, or districts..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto z-50">
                    {searchResults.map((city, index) => (
                      <button
                        key={index}
                        onClick={() => selectLocation(city)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="text-gray-400 group-hover:text-blue-500" size={16} />
                          <span className="text-gray-700 group-hover:text-gray-900">{city}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(city);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star 
                            className={`${favoriteLocations.includes(city) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} 
                            size={16} 
                          />
                        </button>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={getCurrentLocation}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-xl hover:bg-blue-200 transition-colors font-medium"
              >
                <Navigation size={18} />
                Current Location
              </button>
              
              <button
                onClick={() => setShowSearchResults(!showSearchResults)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                <Globe size={18} />
                Browse
              </button>
            </div>
          </div>

          {/* Favorites and Recent Searches */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorite Locations */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="text-yellow-500" size={16} />
                Favorite Locations
              </h3>
              <div className="flex flex-wrap gap-2">
                {favoriteLocations.map((fav, index) => (
                  <button
                    key={index}
                    onClick={() => selectLocation(fav)}
                    className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                  >
                    <Star className="text-yellow-500 fill-current" size={14} />
                    {fav.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <History className="text-gray-500" size={16} />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => selectLocation(recent)}
                    className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    <History className="text-gray-400" size={14} />
                    {recent.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Cities Quick Access */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Globe className="text-blue-500" size={16} />
              Popular Indian Cities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {popularCities.slice(0, 12).map((city, index) => (
                <button
                  key={index}
                  onClick={() => selectLocation(city)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === city 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {city.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-xl border-l-4 ${
                alert.severity === 'High' ? 'bg-red-50 border-red-500' :
                alert.severity === 'Medium' ? 'bg-orange-50 border-orange-500' :
                'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`${
                    alert.severity === 'High' ? 'text-red-500' :
                    alert.severity === 'Medium' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`} size={20} />
                  <span className="font-semibold text-gray-800">{alert.type}</span>
                  <span className="text-xs text-gray-500">Valid until {alert.validUntil}</span>
                </div>
                <p className="text-gray-700">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* View Selection Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-lg">
            {[
              { key: 'current', label: 'Current Weather', icon: Thermometer },
              { key: 'forecast', label: '7-Day Forecast', icon: Calendar },
              { key: 'hourly', label: 'Hourly Forecast', icon: Clock },
              { key: 'historical', label: 'Historical Data', icon: BarChart3 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedView === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Weather View */}
        {selectedView === 'current' && (
          <div className="space-y-6">
            {/* Main Weather Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-600" size={24} />
                  <div>
                    <span className="text-2xl font-bold text-gray-800">{weatherData?.location}</span>
                    <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Air Quality</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAirQualityColor(weatherData?.airQuality.index || 0)}`}>
                    {weatherData?.airQuality.level} ({weatherData?.airQuality.index})
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Temperature Display */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    {getConditionIcon(weatherData?.condition || '')}
                    <div className="text-6xl font-bold text-gray-800 mt-2">{weatherData?.temperature}°</div>
                    <div className="text-xl text-gray-600">{weatherData?.condition}</div>
                    <div className="text-sm text-gray-500 mt-1">Feels like {weatherData?.feelsLike}°C</div>
                  </div>
                </div>

                {/* Detailed Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="text-blue-500" size={20} />
                      <span className="text-sm font-medium text-gray-700">Humidity</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData?.humidity}%</div>
                    <div className="text-xs text-gray-500">Dew Point: {weatherData?.dewPoint}°C</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="text-green-500" size={20} />
                      <span className="text-sm font-medium text-gray-700">Wind</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData?.windSpeed} km/h</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Compass size={12} />
                      {weatherData?.windDirection}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="text-purple-500" size={20} />
                      <span className="text-sm font-medium text-gray-700">Visibility</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData?.visibility} km</div>
                    <div className="text-xs text-gray-500">Cloud Cover: {weatherData?.cloudCover}%</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="text-orange-500" size={20} />
                      <span className="text-sm font-medium text-gray-700">Pressure</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData?.pressure} mb</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getUVIndexColor(weatherData?.uvIndex || 0)}`}>
                      UV Index: {weatherData?.uvIndex}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sun & Moon Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Sunrise className="text-yellow-500" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Sunrise</div>
                      <div className="font-semibold text-gray-800">{weatherData?.sunrise}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sunset className="text-orange-500" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Sunset</div>
                      <div className="font-semibold text-gray-800">{weatherData?.sunset}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-purple-500 text-xl">🌙</div>
                    <div>
                      <div className="text-sm text-gray-500">Moon Phase</div>
                      <div className="font-semibold text-gray-800">{weatherData?.moonPhase}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Air Quality Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-green-600" />
                Air Quality Index
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl ${getAirQualityColor(weatherData?.airQuality.index || 0)}`}>
                  <div className="text-sm font-medium">Overall AQI</div>
                  <div className="text-3xl font-bold">{weatherData?.airQuality.index}</div>
                  <div className="text-sm">{weatherData?.airQuality.level}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-gray-600">PM2.5</div>
                  <div className="text-2xl font-bold text-gray-800">{weatherData?.airQuality.pm25} μg/m³</div>
                  <div className="text-xs text-gray-500">Fine particles</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-gray-600">PM10</div>
                  <div className="text-2xl font-bold text-gray-800">{weatherData?.airQuality.pm10} μg/m³</div>
                  <div className="text-xs text-gray-500">Coarse particles</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Forecast View */}
        {selectedView === 'forecast' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="text-green-600" />
              7-Day Weather Forecast
            </h2>
            <div className="space-y-4">
              {weatherData?.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[80px]">
                      <div className="font-semibold text-gray-800">{day.day}</div>
                      <div className="text-sm text-gray-500">{day.date}</div>
                    </div>
                    <div className="text-3xl">{day.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{day.condition}</div>
                      <div className="text-sm text-gray-600">Rain: {day.rainProbability}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500">Humidity</div>
                      <div className="font-semibold">{day.humidity}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Wind</div>
                      <div className="font-semibold">{day.windSpeed} km/h</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Precipitation</div>
                      <div className="font-semibold">{day.precipitation} mm</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <span className="text-2xl font-bold text-gray-800">{day.high}°</span>
                    <span className="text-lg text-gray-500">{day.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hourly Forecast View */}
        {selectedView === 'hourly' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="text-blue-600" />
              24-Hour Forecast
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {weatherData?.hourlyForecast.map((hour, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-lg transition-all">
                  <div className="text-sm font-medium text-gray-600 mb-2">{hour.time}</div>
                  <div className="text-2xl mb-2">{hour.icon}</div>
                  <div className="text-xl font-bold text-gray-800 mb-1">{hour.temp}°</div>
                  <div className="text-xs text-gray-500 mb-1">{hour.condition}</div>
                  <div className="text-xs text-blue-600">{hour.rainChance}% rain</div>
                  <div className="text-xs text-gray-500">{hour.windSpeed} km/h</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Data View */}
        {selectedView === 'historical' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="text-purple-600" />
              Historical Weather Data (This Month)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-blue-600">{weatherData?.historical.avgTemp}°C</div>
                <div className="text-sm text-gray-600">Average Temperature</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <div className="text-3xl mb-2">🌡️</div>
                <div className="text-2xl font-bold text-red-600">{weatherData?.historical.maxTemp}°C</div>
                <div className="text-sm text-gray-600">Highest Temperature</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
                <div className="text-3xl mb-2">❄️</div>
                <div className="text-2xl font-bold text-cyan-600">{weatherData?.historical.minTemp}°C</div>
                <div className="text-sm text-gray-600">Lowest Temperature</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="text-3xl mb-2">🌧️</div>
                <div className="text-2xl font-bold text-green-600">{weatherData?.historical.rainfall} mm</div>
                <div className="text-sm text-gray-600">Total Rainfall</div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Farming Advisory */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mt-6 shadow-lg">
          <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <Sprout className="text-green-600" />
            Advanced Farming Advisory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <Leaf size={16} />
                Current Conditions Analysis
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <p>• <strong>Temperature:</strong> {weatherData?.temperature}°C is optimal for most crops</p>
                <p>• <strong>Humidity:</strong> {weatherData?.humidity}% humidity supports healthy plant growth</p>
                <p>• <strong>Wind:</strong> {weatherData?.windSpeed} km/h wind helps with pollination</p>
                <p>• <strong>UV Index:</strong> {weatherData?.uvIndex} UV level requires moderate sun protection for workers</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <TrendingUp size={16} />
                Smart Recommendations
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <p>• <strong>Irrigation:</strong> Moderate watering recommended based on humidity levels</p>
                <p>• <strong>Field Work:</strong> Excellent conditions for outdoor farming activities</p>
                <p>• <strong>Spraying:</strong> Wind speed suitable for pesticide/fertilizer application</p>
                <p>• <strong>Harvesting:</strong> Weather conditions favorable for harvest operations</p>
              </div>
            </div>
          </div>
          
          {weatherData?.forecast[1] && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">Tomorrow's Planning:</h4>
              <p className="text-sm text-green-700">
                Expected {weatherData.forecast[1].condition.toLowerCase()} conditions with {weatherData.forecast[1].high}°C high. 
                {weatherData.forecast[1].rainProbability > 50 
                  ? ' Plan indoor activities due to high rain probability.' 
                  : ' Good day for outdoor farming operations.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;
