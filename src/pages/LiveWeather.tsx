import React, { useState, useEffect, useCallback } from 'react';
// ...existing code...
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind,
  Eye,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Search,
  Navigation,
  Star,
  CheckCircle,
  Activity,
  Target,
  Wifi,
  Signal,
  Database,
  Zap
} from 'lucide-react';
import liveWeatherService, { LiveWeatherData } from '../services/liveWeatherService';
import realTimeDataService from '../services/realTimeDataService';
import type { WeatherData } from '../services/realTimeDataService';

interface CityData {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

const LiveWeather: React.FC = () => {
  // ...existing code...
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [favoriteLocations, setFavoriteLocations] = useState<CityData[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'hourly' | 'daily' | 'alerts' | 'agricultural' | 'air'>('current');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const [realTimeWeatherData, setRealTimeWeatherData] = useState<WeatherData[]>([]);
  const [dataSource, setDataSource] = useState<'live' | 'api' | 'mock'>('api');

  // Popular Indian cities for quick access
  const popularCities: CityData[] = [
    { name: "Mumbai", country: "IN", lat: 19.0760, lon: 72.8777 },
    { name: "Delhi", country: "IN", lat: 28.7041, lon: 77.1025 },
    { name: "Bangalore", country: "IN", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", country: "IN", lat: 13.0827, lon: 80.2707 },
    { name: "Kolkata", country: "IN", lat: 22.5726, lon: 88.3639 },
    { name: "Hyderabad", country: "IN", lat: 17.3850, lon: 78.4867 },
    { name: "Pune", country: "IN", lat: 18.5204, lon: 73.8567 },
    { name: "Ahmedabad", country: "IN", lat: 23.0225, lon: 72.5714 },
    { name: "Jaipur", country: "IN", lat: 26.9124, lon: 75.7873 },
    { name: "Lucknow", country: "IN", lat: 26.8467, lon: 80.9462 }
  ];

  // Enhanced real-time multi-city weather fetching
  const fetchMultiCityRealTimeWeather = async () => {
    try {
      console.log('🌦️ Starting real-time multi-city weather fetch...');
      const allCitiesWeather = await realTimeDataService.getAllCitiesWeatherData();
      
      if (allCitiesWeather && allCitiesWeather.length > 0) {
        console.log(`✅ Received weather for ${allCitiesWeather.length} cities`);
        setRealTimeWeatherData(allCitiesWeather);
        setRealTimeConnected(true);
        setDataSource('live');
        setLastUpdated(new Date());
        
        // Update current location weather if it matches any of the fetched data
        if (coords) {
          const currentLocationWeather = allCitiesWeather.find(cityWeather => {
            const cityLat = parseFloat(cityWeather.location.split(',')[0] || '0');
            const cityLon = parseFloat(cityWeather.location.split(',')[1] || '0');
            return Math.abs(cityLat - coords.lat) < 0.5 && Math.abs(cityLon - coords.lon) < 0.5;
          });
          
          if (currentLocationWeather && weatherData) {
            updateWeatherFromRealTime(currentLocationWeather);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching multi-city real-time weather:', error);
      setRealTimeConnected(false);
      setDataSource('api');
    }
  };

  // Load favorite locations from localStorage
  const loadFavoriteLocations = () => {
    try {
      const saved = localStorage.getItem('favoriteLocations');
      if (saved) {
        setFavoriteLocations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorite locations:', error);
    }
  };

  // Save favorite locations to localStorage
  const saveFavoriteLocations = (locations: CityData[]) => {
    try {
      localStorage.setItem('favoriteLocations', JSON.stringify(locations));
      setFavoriteLocations(locations);
    } catch (error) {
      console.error('Error saving favorite locations:', error);
    }
  };

  // Add location to favorites
  const addToFavorites = (location: CityData) => {
    const isAlreadyFavorite = favoriteLocations.some(
      fav => fav.lat === location.lat && fav.lon === location.lon
    );
    if (!isAlreadyFavorite) {
      const newFavorites = [...favoriteLocations, location];
      saveFavoriteLocations(newFavorites);
    }
  };

  // Remove location from favorites
  const removeFromFavorites = (location: CityData) => {
    const newFavorites = favoriteLocations.filter(
      fav => !(fav.lat === location.lat && fav.lon === location.lon)
    );
    saveFavoriteLocations(newFavorites);
  };

  // Check if location is in favorites
  const isFavorite = (location: CityData) => {
    return favoriteLocations.some(
      fav => fav.lat === location.lat && fav.lon === location.lon
    );
  };

  // Search for cities
  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      // First try API search
      const location = await liveWeatherService.getLocationByName(query);
      if (location) {
        const cities = [{
          name: location.name,
          state: location.state,
          country: location.country,
          lat: location.lat,
          lon: location.lon
        }];
        
        setSearchResults(cities);
        setShowSearchResults(true);
      } else {
        // Fallback: filter popular cities if API fails
        const filteredCities = popularCities.filter(city =>
          city.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredCities);
        setShowSearchResults(filteredCities.length > 0);
        
        // If no popular cities match, show message
        if (filteredCities.length === 0) {
          console.log('No cities found for:', query);
        }
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      // Fallback: filter popular cities
      const filteredCities = popularCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredCities);
      setShowSearchResults(filteredCities.length > 0);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search - fix the timing issue
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        searchCities(query);
      }, 500);
      
      // Clear previous timeout
      if ((window as any).searchTimeout) {
        clearTimeout((window as any).searchTimeout);
      }
      (window as any).searchTimeout = timeoutId;
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Select location
  const selectLocation = (location: CityData) => {
    setCoords({ lat: location.lat, lon: location.lon });
    setSearchQuery('');
    setShowSearchResults(false);
    fetchWeatherData(location, true);
  };

  // Get current user location
  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const location = await liveWeatherService.getCurrentLocation();
      if (location) {
        setCoords({ lat: location.lat, lon: location.lon });
        fetchWeatherData(location, true);
      } else {
        // Use Mumbai coordinates as fallback
        const fallbackLocation = { lat: 19.0760, lon: 72.8777, name: 'Mumbai', country: 'IN' };
        setCoords({ lat: fallbackLocation.lat, lon: fallbackLocation.lon });
        fetchWeatherData(fallbackLocation, true);
        setError('Could not get your current location. Showing default location.');
      }
    } catch (err) {
      console.warn("Location error:", err);
      // Use Mumbai coordinates as fallback
      const fallbackLocation = { lat: 19.0760, lon: 72.8777, name: 'Mumbai', country: 'IN' };
      setCoords({ lat: fallbackLocation.lat, lon: fallbackLocation.lon });
      fetchWeatherData(fallbackLocation, true);
      setError('Could not get your current location. Showing default location.');
    }
  };

  const fetchWeatherData = async (location: CityData, forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching weather data for:', location); // Debug log
      const weatherData = await liveWeatherService.getWeatherData(location, forceRefresh);
      
      if (weatherData) {
        console.log('Weather data received:', weatherData); // Debug log
        setWeatherData(weatherData);
        setLastUpdated(new Date());
      } else {
        throw new Error('Could not fetch weather data');
      }
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      setError(err.message || 'Could not fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Toggle live mode with real-time data service integration
  const toggleLiveMode = async () => {
    console.log('Toggling live mode, current state:', isLiveMode);
    
    if (!isLiveMode) {
      try {
        console.log('Starting live mode with multi-city weather...');
        
        // Start enhanced multi-city real-time updates
        await fetchMultiCityRealTimeWeather();
        
        // Start real-time weather updates using Open-Meteo API
        const unsubscribe = realTimeDataService.subscribe('weather', (data: WeatherData[]) => {
          console.log('Received real-time weather data for cities:', data.length);
          setRealTimeWeatherData(data);
          setRealTimeConnected(true);
          setDataSource('live');
          setLastUpdated(new Date());
          
          // Update local weather data if current location matches
          if (coords && data.length > 0) {
            const currentLocationData = data.find(d => {
              const cityLat = parseFloat(d.location.split(',')[0] || '0');
              const cityLon = parseFloat(d.location.split(',')[1] || '0');
              return Math.abs(cityLat - coords.lat) < 0.5 && Math.abs(cityLon - coords.lon) < 0.5;
            }) || data[0]; // Fallback to first available data
            
            if (currentLocationData) {
              updateWeatherFromRealTime(currentLocationData);
            }
          }
        });
        
        // Start live updates for weather data with shorter interval for real-time feel
        realTimeDataService.startRealTimeUpdates(['weather'], 60000); // 1 minute updates
        
        // Set up periodic multi-city weather fetch
        const multiCityInterval = setInterval(fetchMultiCityRealTimeWeather, 120000); // 2 minutes
        (window as any).multiCityWeatherInterval = multiCityInterval;
        
        // Also start legacy live weather service for enhanced data
        if (coords) {
          const location = { 
            lat: coords.lat, 
            lon: coords.lon, 
            name: weatherData?.location.name || 'Current Location', 
            country: weatherData?.location.country || 'IN' 
          };
          liveWeatherService.startLiveUpdates(location);
          
          // Subscribe to legacy service for enhanced agricultural data
          const legacyUnsubscribe = liveWeatherService.subscribe((data) => {
            console.log('Received enhanced weather data:', data);
            setWeatherData(data);
            setLastUpdated(new Date());
          });
          
          // Store both unsubscribe functions
          (window as any).weatherUnsubscribe = legacyUnsubscribe;
        }
        
        setIsLiveMode(true);
        console.log('Live mode with multi-city updates started successfully');
        
        // Store real-time unsubscribe function
        (window as any).realTimeWeatherUnsubscribe = unsubscribe;
        
      } catch (error) {
        console.error('Error starting live mode:', error);
        setRealTimeConnected(false);
        setDataSource('api');
      }
    } else {
      console.log('Stopping live mode...');
      
      // Stop live updates
      realTimeDataService.stopRealTimeUpdates(['weather']);
      liveWeatherService.stopLiveUpdates();
      
      // Clear multi-city interval
      if ((window as any).multiCityWeatherInterval) {
        clearInterval((window as any).multiCityWeatherInterval);
        delete (window as any).multiCityWeatherInterval;
      }
      
      // Cleanup subscriptions
      if ((window as any).realTimeWeatherUnsubscribe) {
        (window as any).realTimeWeatherUnsubscribe();
        delete (window as any).realTimeWeatherUnsubscribe;
      }
      if ((window as any).weatherUnsubscribe) {
        (window as any).weatherUnsubscribe();
        delete (window as any).weatherUnsubscribe;
      }
      
      setIsLiveMode(false);
      setRealTimeConnected(false);
      setDataSource('api');
      console.log('Live mode stopped');
    }
  };

  // Update weather data from real-time service
  const updateWeatherFromRealTime = useCallback((realTimeData: WeatherData) => {
    if (!weatherData) return;
    
    // Merge real-time data with existing weather data structure
    const updatedWeatherData: LiveWeatherData = {
      ...weatherData,
      current: {
        ...weatherData.current,
        temp: realTimeData.temperature,
        humidity: realTimeData.humidity,
        windSpeed: realTimeData.windSpeed,
        description: realTimeData.conditions,
        condition: realTimeData.conditions.toLowerCase()
      },
      location: {
        ...weatherData.location,
        name: realTimeData.location
      }
    };
    
    setWeatherData(updatedWeatherData);
  }, [weatherData]);

  // Initial load with real-time data service integration
  useEffect(() => {
    getCurrentLocation();
    loadFavoriteLocations();
    
    // Check if real-time weather data is available with delay to ensure service is ready
    const timer = setTimeout(() => {
      checkRealTimeDataAvailability();
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      liveWeatherService.stopLiveUpdates();
      realTimeDataService.stopRealTimeUpdates(['weather']);
      
      if ((window as any).weatherUnsubscribe) {
        (window as any).weatherUnsubscribe();
      }
      if ((window as any).realTimeWeatherUnsubscribe) {
        (window as any).realTimeWeatherUnsubscribe();
      }
    };
  }, []);

  // Check real-time data availability
  const checkRealTimeDataAvailability = async () => {
    try {
      console.log('Checking real-time multi-city weather data availability...');
      
      // Try to fetch multi-city weather data first
      await fetchMultiCityRealTimeWeather();
      
      // Also check general weather data
      const weatherData = await realTimeDataService.fetchData('weather');
      console.log('Real-time weather data received:', weatherData);
      
      if (weatherData && weatherData.length > 0) {
        setRealTimeWeatherData(weatherData);
        setRealTimeConnected(true);
        setDataSource('live');
        console.log('Real-time data available, switching to live mode');
      } else {
        setDataSource('api');
        console.log('No real-time data available, using API fallback');
      }
    } catch (error) {
      console.log('Real-time weather data not available, using API fallback:', error);
      setDataSource('api');
      setRealTimeConnected(false);
    }
  };

  // Get weather icon
  const getWeatherIcon = (condition: string, size: number = 64) => {
    const commonClasses = "transition-all duration-300 ease-in-out hover:scale-110";

    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className={`text-yellow-400 ${commonClasses}`} size={size} />;
      case 'clouds':
        return <Cloud className={`text-gray-400 ${commonClasses}`} size={size} />;
      case 'rain':
        return <CloudRain className={`text-blue-500 ${commonClasses}`} size={size} />;
      case 'thunderstorm':
  return <CloudRain className={`text-indigo-600 ${commonClasses}`} size={size} />;
      case 'snow':
  return <Cloud className={`text-blue-200 ${commonClasses}`} size={size} />;
      case 'mist':
      case 'fog':
  return <Cloud className={`text-gray-400 opacity-70 ${commonClasses}`} size={size} />;
      default:
        return <Cloud className={`text-gray-500 ${commonClasses}`} size={size} />;
    }
  };

  const handleRefresh = () => {
    if (coords && weatherData) {
      const location = { 
        lat: coords.lat, 
        lon: coords.lon, 
        name: weatherData.location.name,
        country: weatherData.location.country 
      };
      fetchWeatherData(location, true);
    } else {
      getCurrentLocation();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center p-4">
        <RefreshCw className="animate-spin text-green-600" size={48} />
        <span className="ml-2 text-lg mt-4">Fetching live weather data...</span>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg shadow-md">
        <AlertTriangle className="mx-auto text-red-500" size={48} />
        <p className="text-red-600 mt-4 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
        >
          <RefreshCw size={18} className="mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Live Weather Dashboard</h1>
          <div className="flex items-center space-x-2">
            {/* Data Source Indicator */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
              dataSource === 'live' ? 'bg-green-100 text-green-700' :
              dataSource === 'api' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {dataSource === 'live' ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Live Data</span>
                  {realTimeConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></div>}
                </>
              ) : dataSource === 'api' ? (
                <>
                  <Database className="w-4 h-4" />
                  <span>API Data</span>
                </>
              ) : (
                <>
                  <Signal className="w-4 h-4" />
                  <span>Mock Data</span>
                </>
              )}
            </div>
            
            {/* Real-time Connection Status */}
            {realTimeConnected && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700">Connected</span>
              </div>
            )}
            
            {/* Live Mode Toggle */}
            <button
              onClick={toggleLiveMode}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isLiveMode 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={isLiveMode ? 'Click to stop live updates' : 'Click to start live updates'}
            >
              <Activity size={16} className={isLiveMode ? 'animate-pulse' : ''} />
              <span>{isLiveMode ? 'Live' : 'Manual'}</span>
            </button>
            
            {/* Test Real-time Data Button */}
            <button
              onClick={async () => {
                console.log('Testing real-time data...');
                try {
                  const testData = await realTimeDataService.fetchData('weather', true);
                  console.log('Test data result:', testData);
                  if (testData && testData.length > 0) {
                    setRealTimeWeatherData(testData);
                    setRealTimeConnected(true);
                    setDataSource('live');
                    alert(`Real-time data available! Found ${testData.length} weather locations.`);
                  } else {
                    alert('No real-time data available. Using mock data.');
                  }
                } catch (error) {
                  console.error('Test failed:', error);
                  alert('Real-time data test failed. Check console for details.');
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              title="Test real-time data connection"
            >
              <Target size={16} />
              <span className="hidden sm:inline">Test</span>
            </button>
            
            {/* Data Sources Button */}
            <button
              onClick={() => window.open('/data-sources', '_blank')}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              title="Manage Data Sources"
            >
              <Database size={16} />
              <span className="hidden sm:inline">Sources</span>
            </button>
            
            <button 
              onClick={handleRefresh} 
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <div className="flex items-center space-x-4">
            {isLiveMode && <span className="text-green-600">(Live updates active)</span>}
            {realTimeWeatherData.length > 0 && (
              <span className="text-blue-600">
                {realTimeWeatherData.length} locations available
              </span>
            )}
          </div>
        </div>

        {/* Real-time Weather Data Overview */}
        {isLiveMode && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Zap className="mr-2 text-blue-500" size={20} />
              Live Weather Network
              {realTimeConnected && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  Connected
                </span>
              )}
            </h3>
            
            {realTimeWeatherData.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    🌍 भारत के प्रमुख शहरों का मौसम • Live Updates via Open-Meteo API
                  </span>
                  <button
                    onClick={fetchMultiCityRealTimeWeather}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    🔄 Refresh All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {realTimeWeatherData.map((location, index) => {
                    // Extract city name from location string
                    const cityName = location.location.includes(',') 
                      ? location.location.split(',')[0].trim() 
                      : location.location;
                    
                    // Get temperature color
                    const getTempColor = (temp: number) => {
                      if (temp >= 35) return 'text-red-600';
                      if (temp >= 25) return 'text-orange-500';
                      if (temp >= 15) return 'text-yellow-600';
                      return 'text-blue-600';
                    };
                    
                    return (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        {/* City Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-800 text-sm">{cityName}</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live Data"></div>
                          </div>
                          <span className="text-xs text-gray-400">{location.source || 'OpenMeteo'}</span>
                        </div>
                        
                        {/* Temperature and Condition */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`text-3xl font-bold ${getTempColor(location.temperature)}`}>
                            {location.temperature.toFixed(1)}°C
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 capitalize">{location.conditions}</div>
                            <div className="text-xs text-gray-500">Feels {location.temperature + 2}°C</div>
                          </div>
                        </div>
                        
                        {/* Weather Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <span className="text-blue-500">💧</span>
                            <span>{location.humidity}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">💨</span>
                            <span>{location.windSpeed.toFixed(1)} km/h</span>
                          </div>
                          {location.rainfall > 0 && (
                            <>
                              <div className="flex items-center space-x-1 text-blue-600">
                                <span>🌧️</span>
                                <span>{location.rainfall.toFixed(1)}mm</span>
                              </div>
                              <div className="text-blue-600 text-xs">Rain detected</div>
                            </>
                          )}
                        </div>
                        
                        {/* Click to select */}
                        <button
                          onClick={() => {
                            const cityData = popularCities.find(city => 
                              city.name.toLowerCase().includes(cityName.toLowerCase())
                            );
                            if (cityData) {
                              selectLocation(cityData);
                            }
                          }}
                          className="w-full mt-3 text-xs py-1 bg-gray-50 text-gray-600 rounded hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          Select as current location
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                {/* Weather Summary Stats */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-lg font-bold text-blue-600">{realTimeWeatherData.length}</div>
                    <div className="text-xs text-gray-600">Active Cities</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-lg font-bold text-red-600">
                      {Math.max(...realTimeWeatherData.map(d => d.temperature)).toFixed(1)}°C
                    </div>
                    <div className="text-xs text-gray-600">Highest Temp</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.min(...realTimeWeatherData.map(d => d.temperature)).toFixed(1)}°C
                    </div>
                    <div className="text-xs text-gray-600">Lowest Temp</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-lg font-bold text-green-600">
                      {(realTimeWeatherData.reduce((acc, d) => acc + d.temperature, 0) / realTimeWeatherData.length).toFixed(1)}°C
                    </div>
                    <div className="text-xs text-gray-600">Average Temp</div>
                  </div>
                </div>
                
                {realTimeWeatherData.length > 8 && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => window.open('/real-time-dashboard', '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View all {realTimeWeatherData.length} locations →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex items-center justify-center mb-4">
                  <RefreshCw className="animate-spin text-blue-500 mr-2" size={24} />
                  <span className="text-blue-700 font-medium">Loading real-time weather data...</span>
                </div>
                <p className="text-blue-600 text-sm">
                  Connecting to weather network and government data sources...
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      console.log('Manual refresh clicked');
                      checkRealTimeDataAvailability();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location Search Section */}
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for a city... / शहर खोजें..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              autoComplete="off"
            />
            {searchLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <RefreshCw className="animate-spin h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchResults.map((city, index) => (
                  <div
                    key={`${city.lat}-${city.lon}-${index}`}
                    onClick={() => selectLocation(city)}
                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{city.name || 'Unknown City'}</div>
                      {city.state && (
                        <div className="text-sm text-gray-500">{city.state}, {city.country || 'IN'}</div>
                      )}
                      {!city.state && (
                        <div className="text-sm text-gray-500">{city.country || 'IN'}</div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFavorite(city)) {
                          removeFromFavorites(city);
                        } else {
                          addToFavorites(city);
                        }
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Star
                        size={16}
                        className={isFavorite(city) ? "text-yellow-400 fill-current" : "text-gray-400"}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Cities */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Cities</h3>
            <div className="flex flex-wrap gap-2">
              {popularCities.slice(0, 6).map((city, index) => (
                <button
                  key={index}
                  onClick={() => selectLocation(city)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Locations */}
          {favoriteLocations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Star size={16} className="mr-1 text-yellow-400" />
                Favorite Locations
              </h3>
              <div className="flex flex-wrap gap-2">
                {favoriteLocations.map((city, index) => (
                  <div key={index} className="flex items-center bg-yellow-50 rounded-full">
                    <button
                      onClick={() => selectLocation(city)}
                      className="px-3 py-1 text-sm text-yellow-700 hover:bg-yellow-100 rounded-l-full"
                    >
                      {city.name}
                    </button>
                    <button
                      onClick={() => removeFromFavorites(city)}
                      className="px-2 py-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-r-full"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Location Button */}
          <div className="flex justify-center">
            <button
              onClick={getCurrentLocation}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Navigation size={16} className="mr-2" />
              Use Current Location
            </button>
          </div>
        </div>

        {/* Weather Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'current', label: 'Current Weather', icon: '🌤️' },
              { id: 'hourly', label: '24 Hours', icon: '⏰' },
              { id: 'daily', label: '7 Days', icon: '📅' },
              { id: 'alerts', label: 'Alerts', icon: '⚠️' },
              { id: 'agricultural', label: 'Agriculture', icon: '🌱' },
              { id: 'air', label: 'Air Quality', icon: '🌬️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.id === 'alerts' && weatherData?.alerts.length && weatherData.alerts.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {weatherData.alerts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Current Weather */}
        {activeTab === 'current' && weatherData && (
          <>
            <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className="mr-2" size={20} />
                    <span className="text-xl font-semibold">{weatherData.location.name || 'Unknown Location'}</span>
                    {realTimeConnected && (
                      <div className="ml-3 flex items-center space-x-1 px-2 py-1 bg-white/20 rounded-full">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <span className="text-xs">Live</span>
                      </div>
                    )}
                  </div>
                  <div className="text-5xl font-bold mb-2">{weatherData.current.temp || 0}°C</div>
                  <div className="text-green-100 capitalize">{weatherData.current.description || 'No data'}</div>
                  <div className="text-green-200 text-sm mt-1">
                    Source: {dataSource === 'live' ? 'Real-time Network' : 'Weather API'}
                  </div>
                </div>
                <div className="text-center">
                  {getWeatherIcon(weatherData.current.condition || 'clear')}
                </div>
              </div>
            </div>

            {/* Enhanced Weather Details Grid with Real-time Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center relative">
                {realTimeConnected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <Droplets className="mx-auto mb-2 text-blue-500" size={24} />
                <div className="text-xl font-bold">{weatherData.current.humidity || 0}%</div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center relative">
                {realTimeConnected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <Wind className="mx-auto mb-2 text-gray-500" size={24} />
                <div className="text-xl font-bold">{(weatherData.current.windSpeed || 0).toFixed(1)} km/h</div>
                <div className="text-sm text-gray-600">Wind Speed</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Eye className="mx-auto mb-2 text-purple-500" size={24} />
                <div className="text-xl font-bold">{(weatherData.current.visibility || 0).toFixed(1)} km</div>
                <div className="text-sm text-gray-600">Visibility</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Thermometer className="mx-auto mb-2 text-orange-500" size={24} />
                <div className="text-xl font-bold">{weatherData.current.feelsLike || 0}°C</div>
                <div className="text-sm text-gray-600">Feels Like</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🌡️</div>
                <div className="text-xl font-bold">{weatherData.current.pressure || 0} hPa</div>
                <div className="text-sm text-gray-600">Pressure</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">☀️</div>
                <div className="text-xl font-bold">{weatherData.current.uv || 0}</div>
                <div className="text-sm text-gray-600">UV Index</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">💧</div>
                <div className="text-xl font-bold">{weatherData.current.dewPoint || 0}°C</div>
                <div className="text-sm text-gray-600">Dew Point</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">☁️</div>
                <div className="text-xl font-bold">{weatherData.current.cloudCover || 0}%</div>
                <div className="text-sm text-gray-600">Cloud Cover</div>
              </div>
            </div>

            {/* Real-time Data Comparison */}
            {realTimeConnected && realTimeWeatherData.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Database className="mr-2" size={16} />
                  Real-time Network Comparison
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-blue-700 font-medium">Temperature Range</div>
                    <div className="text-blue-800">
                      {Math.min(...realTimeWeatherData.map(d => d.temperature)).toFixed(1)}° - {' '}
                      {Math.max(...realTimeWeatherData.map(d => d.temperature)).toFixed(1)}°C
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-700 font-medium">Avg Humidity</div>
                    <div className="text-blue-800">
                      {(realTimeWeatherData.reduce((sum, d) => sum + d.humidity, 0) / realTimeWeatherData.length).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-700 font-medium">Active Sources</div>
                    <div className="text-blue-800">
                      {new Set(realTimeWeatherData.map(d => d.source)).size} different APIs
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hourly Weather */}
        {activeTab === 'hourly' && weatherData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">24-Hour Forecast</h3>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {weatherData.hourly.slice(0, 12).map((hour, index) => (
                <div key={index} className="flex-shrink-0 bg-white border rounded-lg p-3 text-center min-w-[120px]">
                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(hour.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="mb-2">
                    {getWeatherIcon(hour.description || 'clear', 32)}
                  </div>
                  <div className="font-bold text-lg">{hour.temp || 0}°C</div>
                  <div className="text-xs text-gray-500 mt-1">{hour.humidity || 0}%</div>
                  {(hour.rainfall || 0) > 0 && (
                    <div className="text-xs text-blue-500 mt-1">
                      {(hour.rainfall || 0).toFixed(1)}mm
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {hour.chanceOfRain || 0}% rain
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Weather */}
        {activeTab === 'daily' && weatherData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">7-Day Forecast</h3>
            <div className="space-y-3">
              {weatherData.daily.map((day, index) => (
                <div key={index} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-medium w-20">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString([], {weekday: 'short'})}
                    </div>
                    <div>
                      {getWeatherIcon(day.description, 32)}
                    </div>
                    <div className="text-sm text-gray-600 capitalize min-w-[100px]">
                      {day.description}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500">High/Low</div>
                      <div className="font-medium">
                        {day.tempMax}°/{day.tempMin}°
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Humidity</div>
                      <div className="font-medium">{day.humidity}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Rain</div>
                      <div className="font-medium text-blue-600">{day.chanceOfRain}%</div>
                    </div>
                    {day.rainfall > 0 && (
                      <div className="text-center">
                        <div className="text-gray-500">Amount</div>
                        <div className="font-medium text-blue-600">{day.rainfall.toFixed(1)}mm</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        {activeTab === 'alerts' && weatherData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Weather Alerts</h3>
            {weatherData.alerts.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="mx-auto mb-3 text-green-500" size={48} />
                <p className="text-green-700 font-medium">No active weather alerts</p>
                <p className="text-green-600 text-sm mt-1">Weather conditions are normal for your area</p>
              </div>
            ) : (
              <div className="space-y-4">
                {weatherData.alerts.map((alert, index) => (
                  <div key={index} className={`border-l-4 rounded-lg p-4 ${
                    alert.severity === 'Minor' ? 'border-yellow-400 bg-yellow-50' :
                    alert.severity === 'Moderate' ? 'border-orange-400 bg-orange-50' :
                    alert.severity === 'Severe' ? 'border-red-400 bg-red-50' :
                    'border-red-600 bg-red-100'
                  }`}>
                    <div className="flex items-center mb-2">
                      <AlertTriangle className={`mr-2 ${
                        alert.severity === 'Minor' ? 'text-yellow-500' :
                        alert.severity === 'Moderate' ? 'text-orange-500' :
                        alert.severity === 'Severe' ? 'text-red-500' :
                        'text-red-600'
                      }`} size={20} />
                      <h4 className="font-semibold text-gray-800">{alert.event}</h4>
                      <span className={`ml-auto px-2 py-1 text-xs font-medium rounded ${
                        alert.severity === 'Minor' ? 'bg-yellow-200 text-yellow-800' :
                        alert.severity === 'Moderate' ? 'bg-orange-200 text-orange-800' :
                        alert.severity === 'Severe' ? 'bg-red-200 text-red-800' :
                        'bg-red-300 text-red-900'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.description}</p>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span><strong>Urgency:</strong> {alert.urgency}</span>
                        <span><strong>Certainty:</strong> {alert.certainty}</span>
                      </div>
                      <div className="mt-1">
                        <span className="font-medium">Duration:</span>{' '}
                        {new Date(alert.start * 1000).toLocaleString()} - {new Date(alert.end * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agricultural Information */}
        {activeTab === 'agricultural' && weatherData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Agricultural Conditions</h3>
            
            {/* Soil Conditions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-brown-50 p-4 rounded-lg text-center border">
                <div className="text-2xl mb-2">💧</div>
                <div className="text-xl font-bold">{((weatherData.agricultural.soilMoisture || 0) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Soil Moisture</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center border">
                <div className="text-2xl mb-2">🌡️</div>
                <div className="text-xl font-bold">{(weatherData.agricultural.soilTemperature || 0).toFixed(1)}°C</div>
                <div className="text-sm text-gray-600">Soil Temperature</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center border">
                <div className="text-2xl mb-2">💨</div>
                <div className="text-xl font-bold">{(weatherData.agricultural.evapotranspiration || 0).toFixed(1)} mm</div>
                <div className="text-sm text-gray-600">Evapotranspiration</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center border">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-xl font-bold">{(weatherData.agricultural.growingDegreeDay || 0).toFixed(1)}</div>
                <div className="text-sm text-gray-600">Growing Degree Day</div>
              </div>
            </div>

            {/* Agricultural Recommendations */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Agricultural Recommendations
              </h4>
              
              {/* Spraying Conditions */}
              <div className="mb-4 p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Spraying Conditions:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    weatherData.agricultural.sprayingConditions === 'Excellent' ? 'bg-green-500 text-white' :
                    weatherData.agricultural.sprayingConditions === 'Good' ? 'bg-green-400 text-white' :
                    weatherData.agricultural.sprayingConditions === 'Fair' ? 'bg-yellow-400 text-black' :
                    weatherData.agricultural.sprayingConditions === 'Poor' ? 'bg-orange-400 text-white' :
                    'bg-red-400 text-white'
                  }`}>
                    {weatherData.agricultural.sprayingConditions}
                  </span>
                </div>
              </div>

              {/* Risk Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {weatherData.agricultural.frostRisk && (
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                    <div className="flex items-center text-blue-800">
                      <AlertTriangle size={16} className="mr-2" />
                      <span className="font-medium">Frost Risk Detected</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">Protect sensitive crops from frost damage</p>
                  </div>
                )}
                
                {weatherData.agricultural.heatStress && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                    <div className="flex items-center text-red-800">
                      <AlertTriangle size={16} className="mr-2" />
                      <span className="font-medium">Heat Stress Warning</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">Provide shade and increase irrigation</p>
                  </div>
                )}
              </div>

              {/* Irrigation Advice */}
              <div className="bg-white rounded-lg border p-3">
                <div className="flex items-center mb-2">
                  <Droplets className="text-blue-500 mr-2" size={16} />
                  <span className="font-medium">Irrigation Advice:</span>
                </div>
                <p className="text-gray-700">{weatherData.agricultural.irrigationAdvice || 'Monitor soil moisture and irrigate as needed.'}</p>
              </div>

              {/* Live Recommendations */}
              <div className="mt-4">
                <h5 className="font-medium text-green-800 mb-2">Live Recommendations:</h5>
                <ul className="space-y-2">
                  {liveWeatherService.getAgriculturalRecommendations(weatherData).map((rec, index) => (
                    <li key={index} className="flex items-start text-green-700 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Air Quality */}
        {activeTab === 'air' && weatherData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Air Quality Information</h3>
            
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">Air Quality Index (AQI)</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  weatherData.airQuality.quality === 'Good' ? 'bg-green-100 text-green-800' :
                  weatherData.airQuality.quality === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  weatherData.airQuality.quality === 'Unhealthy for Sensitive Groups' ? 'bg-orange-100 text-orange-800' :
                  weatherData.airQuality.quality === 'Unhealthy' ? 'bg-red-100 text-red-800' :
                  weatherData.airQuality.quality === 'Very Unhealthy' ? 'bg-purple-100 text-purple-800' :
                  'bg-red-200 text-red-900'
                }`}>
                  {weatherData.airQuality.quality}
                </span>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-800 mb-2">{weatherData.airQuality.aqi || 0}</div>
                <div className="text-gray-600">AQI Value</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{weatherData.airQuality.pm25 || 0}</div>
                  <div className="text-sm text-gray-600">PM2.5 (μg/m³)</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{weatherData.airQuality.pm10 || 0}</div>
                  <div className="text-sm text-gray-600">PM10 (μg/m³)</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{weatherData.airQuality.co || 0}</div>
                  <div className="text-sm text-gray-600">CO (μg/m³)</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{weatherData.airQuality.no2 || 0}</div>
                  <div className="text-sm text-gray-600">NO₂ (μg/m³)</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{weatherData.airQuality.so2 || 0}</div>
                  <div className="text-sm text-gray-600">SO₂ (μg/m³)</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{weatherData.airQuality.o3 || 0}</div>
                  <div className="text-sm text-gray-600">O₃ (μg/m³)</div>
                </div>
              </div>
              
              {/* Air Quality Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Health & Agricultural Impact:</h5>
                <ul className="text-blue-700 text-sm space-y-1">
                  {weatherData.airQuality.quality === 'Good' && (
                    <>
                      <li>• Air quality is satisfactory for outdoor activities</li>
                      <li>• No restrictions on agricultural operations</li>
                    </>
                  )}
                  {weatherData.airQuality.quality === 'Moderate' && (
                    <>
                      <li>• Acceptable air quality for most people</li>
                      <li>• Sensitive individuals should limit prolonged outdoor exposure</li>
                    </>
                  )}
                  {(weatherData.airQuality.quality === 'Unhealthy for Sensitive Groups' || 
                    weatherData.airQuality.quality === 'Unhealthy') && (
                    <>
                      <li>• Limit outdoor activities, especially for sensitive groups</li>
                      <li>• Consider postponing field work during peak pollution hours</li>
                      <li>• Use protective equipment when working outdoors</li>
                    </>
                  )}
                  {(weatherData.airQuality.quality === 'Very Unhealthy' || 
                    weatherData.airQuality.quality === 'Hazardous') && (
                    <>
                      <li>• Avoid outdoor activities</li>
                      <li>• Postpone all non-essential agricultural operations</li>
                      <li>• Keep livestock indoors if possible</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveWeather;