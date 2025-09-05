import React, { useState, useEffect, useCallback } from 'react';
// ...existing code...
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin,
  Calendar,
  RefreshCw,
  Search,
  BarChart2,
  Activity,
  Bell,
  Target,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  // ...existing code...
  Eye,
  Star,
  Zap
} from 'lucide-react';
import liveMarketService, { LiveMarketPrice, MarketAlert, MarketTrend } from '../services/liveMarketService';

const LiveMarketPrices: React.FC = () => {
  // ...existing code...
  
  // State management
  const [prices, setPrices] = useState<LiveMarketPrice[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [trends, setTrends] = useState<{ [key: string]: MarketTrend }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  // Filter states
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'card' | 'table' | 'chart'>('card');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Watchlist
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  // Available commodities and states
  const commodities = ['All', 'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Onion', 'Tomato', 'Potato', 'Soybean', 'Mustard', 'Groundnut', 'Maize', 'Bajra'];
  const states = ['All', 'Maharashtra', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Rajasthan', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Punjab', 'Haryana'];

  // Initialize live data
  const initializeLiveData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch market prices
      const marketPrices = await liveMarketService.getLivePrices({ 
        commodities: selectedCommodity === 'All' ? undefined : [selectedCommodity],
        states: selectedState === 'All' ? undefined : [selectedState],
        forceRefresh: true 
      });
      setPrices(marketPrices);

      // Generate market alerts
      const marketAlerts = await liveMarketService.generateMarketAlerts(marketPrices);
      setAlerts(marketAlerts);

      // Fetch trends for top commodities
      const topCommodities = [...new Set(marketPrices.slice(0, 5).map(p => p.commodity))];
      const trendPromises = topCommodities.map(async (commodity) => {
        const trend = await liveMarketService.getMarketTrend(commodity, 'weekly');
        return { commodity, trend };
      });
      
      const trendResults = await Promise.all(trendPromises);
      const trendsMap: { [key: string]: MarketTrend } = {};
      trendResults.forEach(({ commodity, trend }) => {
        if (trend) trendsMap[commodity] = trend;
      });
      setTrends(trendsMap);

      setLastUpdated(new Date());
      setIsConnected(true);
    } catch (err: any) {
      console.error('Error initializing live market data:', err);
      setError(err.message || 'Failed to load market data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [selectedCommodity, selectedState]);

  // Setup live updates
  useEffect(() => {
    initializeLiveData();

    if (isLiveMode) {
      // Subscribe to live market updates
      const marketUnsubscribe = liveMarketService.subscribe((data) => {
        setPrices(data);
        setLastUpdated(new Date());
      });

      // Subscribe to market alerts
      const alertUnsubscribe = liveMarketService.subscribeToAlerts((alertData) => {
        setAlerts(alertData);
      });

      // Start live updates
      const commoditiesToWatch = selectedCommodity === 'All' ? commodities.slice(1) : [selectedCommodity];
      liveMarketService.startLiveUpdates(commoditiesToWatch);

      return () => {
        marketUnsubscribe();
        alertUnsubscribe();
        liveMarketService.stopLiveUpdates();
      };
    }
  }, [initializeLiveData, isLiveMode, selectedCommodity]);

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('marketWatchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage
  const saveWatchlist = (newWatchlist: string[]) => {
    setWatchlist(newWatchlist);
    localStorage.setItem('marketWatchlist', JSON.stringify(newWatchlist));
  };

  // Toggle watchlist item
  const toggleWatchlist = (commodity: string) => {
    const newWatchlist = watchlist.includes(commodity)
      ? watchlist.filter(item => item !== commodity)
      : [...watchlist, commodity];
    saveWatchlist(newWatchlist);
  };

  // Toggle live mode
  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    if (!isLiveMode) {
      initializeLiveData();
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    initializeLiveData();
  };

  // Filter and sort prices
  const filteredAndSortedPrices = React.useMemo(() => {
    let filtered = prices.filter(price => {
      const matchesCommodity = selectedCommodity === 'All' || price.commodity === selectedCommodity;
      const matchesState = selectedState === 'All' || price.state === selectedState;
      const matchesSearch = searchTerm === '' || 
        price.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.variety.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWatchlist = !showWatchlistOnly || watchlist.includes(price.commodity);
      
      return matchesCommodity && matchesState && matchesSearch && matchesWatchlist;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price.modal;
          bValue = b.price.modal;
          break;
        case 'change':
          aValue = a.trend.percentage;
          bValue = b.trend.percentage;
          break;
        case 'volume':
          aValue = a.volume.arrival;
          bValue = b.volume.arrival;
          break;
        default:
          aValue = a.price.modal;
          bValue = b.price.modal;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [prices, selectedCommodity, selectedState, searchTerm, showWatchlistOnly, watchlist, sortBy, sortOrder]);

  // Get trend icon and color
  const getTrendIcon = (direction: string, size: number = 16) => {
    switch (direction) {
      case 'up': return <TrendingUp className="text-green-500" size={size} />;
      case 'down': return <TrendingDown className="text-red-500" size={size} />;
      default: return <BarChart2 className="text-gray-500" size={size} />;
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

  // Render price change
  const renderPriceChange = (change: number, direction: 'up' | 'down' | 'stable') => {
    const color = direction === 'up' ? 'text-green-600' : direction === 'down' ? 'text-red-600' : 'text-gray-600';
    const sign = direction === 'up' ? '+' : '';
    return <span className={`font-semibold ${color}`}>{sign}{change.toFixed(1)}%</span>;
  };

  // Price Card Component
  const PriceCard = ({ price }: { price: LiveMarketPrice }) => {
    const TrendIcon = getTrendIcon(price.trend.direction).type;
    const isInWatchlist = watchlist.includes(price.commodity);
    
    return (
      <div className="border rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{price.commodity}</h3>
              <button
                onClick={() => toggleWatchlist(price.commodity)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Star
                  size={16}
                  className={isInWatchlist ? "text-yellow-400 fill-current" : "text-gray-400"}
                />
              </button>
            </div>
            <p className="text-sm text-gray-500">{price.variety}</p>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              price.quality === 'Premium' ? 'bg-purple-100 text-purple-800' :
              price.quality === 'Good' ? 'bg-green-100 text-green-800' :
              price.quality === 'Average' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {price.quality}
            </div>
          </div>
          <div className={`p-2 rounded-full ${
            price.trend.direction === 'up' ? 'bg-green-50' :
            price.trend.direction === 'down' ? 'bg-red-50' :
            'bg-gray-50'
          }`}>
            <TrendIcon className={
              price.trend.direction === 'up' ? 'text-green-500' :
              price.trend.direction === 'down' ? 'text-red-500' :
              'text-gray-500'
            } size={20} />
          </div>
        </div>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin size={14} className="mr-2" /> {price.market}, {price.state}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-2" /> {new Date(price.arrivalDate).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-600">
            <Activity size={14} className="mr-2" /> 
            <span className={`px-2 py-1 rounded text-xs ${
              price.marketStatus === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {price.marketStatus}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{price.price.modal.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">/ {price.unit}</p>
            </div>
            <div className="text-right">
              {renderPriceChange(price.trend.percentage, price.trend.direction)}
              <p className="text-xs text-gray-500">vs {price.trend.duration}</p>
            </div>
          </div>
          
          {/* Price Range */}
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Min: ₹{price.price.min.toLocaleString()}</span>
            <span>Max: ₹{price.price.max.toLocaleString()}</span>
          </div>
          
          {/* Volume Information */}
          <div className="bg-gray-50 rounded-lg p-2 text-xs">
            <div className="flex justify-between">
              <span>Arrival: {price.volume.arrival} {price.unit}s</span>
              <span>Sold: {((price.volume.sold / price.volume.arrival) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Table Row Component
  const PriceTableRow = ({ price }: { price: LiveMarketPrice }) => {
    const TrendIcon = getTrendIcon(price.trend.direction).type;
    const isInWatchlist = watchlist.includes(price.commodity);
    
    return (
      <tr className="hover:bg-gray-50 transition-colors duration-200">
        <td className="p-4">
          <div className="flex items-center">
            <button
              onClick={() => toggleWatchlist(price.commodity)}
              className="p-1 hover:bg-gray-100 rounded mr-2"
            >
              <Star
                size={14}
                className={isInWatchlist ? "text-yellow-400 fill-current" : "text-gray-400"}
              />
            </button>
            <div className={`p-2 rounded-full mr-3 ${
              price.trend.direction === 'up' ? 'bg-green-50' :
              price.trend.direction === 'down' ? 'bg-red-50' :
              'bg-gray-50'
            }`}>
              <TrendIcon className={
                price.trend.direction === 'up' ? 'text-green-500' :
                price.trend.direction === 'down' ? 'text-red-500' :
                'text-gray-500'
              } size={16} />
            </div>
            <div>
              <div className="font-medium text-gray-800">{price.commodity}</div>
              <div className="text-xs text-gray-500">{price.variety}</div>
            </div>
          </div>
        </td>
        <td className="p-4 text-gray-600">{price.market}</td>
        <td className="p-4 text-gray-600">{price.state}</td>
        <td className="p-4">
          <div className="font-semibold text-gray-900">₹{price.price.modal.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500">₹{price.price.min} - ₹{price.price.max}</div>
        </td>
        <td className="p-4">{renderPriceChange(price.trend.percentage, price.trend.direction)}</td>
        <td className="p-4 text-gray-600">{price.volume.arrival}</td>
        <td className="p-4">
          <span className={`px-2 py-1 rounded text-xs ${
            price.marketStatus === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {price.marketStatus}
          </span>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-green-600" size={48} />
          <p className="text-gray-600">Loading live market data...</p>
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
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Live Market Prices</h1>
              <p className="text-gray-600">Real-time agricultural commodity prices</p>
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
            
            {/* Live Mode Toggle */}
            <button
              onClick={toggleLiveMode}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                isLiveMode 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Activity size={16} className={isLiveMode ? 'animate-pulse' : ''} />
              <span>{isLiveMode ? 'Live' : 'Manual'}</span>
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
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            {isLiveMode && <span className="ml-2 text-blue-600">(Live updates active)</span>}
          </div>
          <div className="flex items-center space-x-4">
            <span>Total Markets: {prices.length}</span>
            <span>Active Alerts: {alerts.length}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Market Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Market Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Bell className="text-orange-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Market Alerts</h2>
            <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
              {alerts.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.slice(0, 6).map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 rounded-r-lg p-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{alert.commodity}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                    {alert.actionRequired && (
                      <div className="mt-2 flex items-center text-xs">
                        <Zap size={12} className="mr-1" />
                        <span className="font-medium">Action Required</span>
                      </div>
                    )}
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

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search commodities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {/* Commodity Filter */}
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {commodities.map(commodity => (
              <option key={commodity} value={commodity}>{commodity}</option>
            ))}
          </select>
          
          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="price">Sort by Price</option>
            <option value="change">Sort by Change</option>
            <option value="volume">Sort by Volume</option>
          </select>
          
          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="ml-2">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
          
          {/* Watchlist Toggle */}
          <button
            onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              showWatchlistOnly 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Star size={16} className={showWatchlistOnly ? 'fill-current' : ''} />
            <span className="ml-2">Watchlist</span>
            {watchlist.length > 0 && (
              <span className="ml-1 bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                {watchlist.length}
              </span>
            )}
          </button>
        </div>
        
        {/* View Type Toggle */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedPrices.length} of {prices.length} markets
          </div>
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            <button 
              onClick={() => setViewType('card')} 
              className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'card' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Cards
            </button>
            <button 
              onClick={() => setViewType('table')} 
              className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'table' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Table
            </button>
            <button 
              onClick={() => setViewType('chart')} 
              className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'chart' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Charts
            </button>
          </div>
        </div>
      </div>

      {/* Market Data Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {filteredAndSortedPrices.length > 0 ? (
          <>
            {viewType === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedPrices.map(price => <PriceCard key={price.id} price={price} />)}
              </div>
            )}
            
            {viewType === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="p-4">Commodity</th>
                      <th className="p-4">Market</th>
                      <th className="p-4">State</th>
                      <th className="p-4">Price (₹)</th>
                      <th className="p-4">Change</th>
                      <th className="p-4">Volume</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedPrices.map(price => <PriceTableRow key={price.id} price={price} />)}
                  </tbody>
                </table>
              </div>
            )}
            
            {viewType === 'chart' && (
              <div className="space-y-6">
                {Object.entries(trends).map(([commodity, trend]) => (
                  <div key={commodity} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{commodity} Price Trend</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          trend.analysis.trend === 'bullish' ? 'bg-green-100 text-green-800' :
                          trend.analysis.trend === 'bearish' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trend.analysis.trend}
                        </span>
                        <span className="text-gray-600">
                          Volatility: {trend.analysis.volatility}
                        </span>
                      </div>
                    </div>
                    
                    {/* Simple price chart representation */}
                    <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
                      {trend.data.slice(-7).map((point, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-green-500 rounded-t"
                            style={{ 
                              height: `${(point.price / Math.max(...trend.data.map(d => d.price))) * 80}px`,
                              width: '20px'
                            }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(point.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">Current</div>
                        <div>₹{trend.data[trend.data.length - 1]?.price.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Prediction</div>
                        <div>₹{trend.analysis.prediction.nextWeek.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Confidence</div>
                        <div>{(trend.analysis.prediction.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Timeframe</div>
                        <div className="capitalize">{trend.timeframe}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Eye className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 text-lg">No market data found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Target className="text-blue-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Market Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Gainers */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <TrendingUp size={16} className="mr-2" />
              Top Gainers
            </h3>
            <div className="space-y-2">
              {filteredAndSortedPrices
                .filter(p => p.trend.direction === 'up')
                .slice(0, 3)
                .map((price, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{price.commodity}</span>
                    <span className="text-green-600">+{price.trend.percentage.toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Top Losers */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center">
              <TrendingDown size={16} className="mr-2" />
              Top Losers
            </h3>
            <div className="space-y-2">
              {filteredAndSortedPrices
                .filter(p => p.trend.direction === 'down')
                .slice(0, 3)
                .map((price, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{price.commodity}</span>
                    <span className="text-red-600">{price.trend.percentage.toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* High Volume */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <BarChart2 size={16} className="mr-2" />
              High Volume
            </h3>
            <div className="space-y-2">
              {filteredAndSortedPrices
                .sort((a, b) => b.volume.arrival - a.volume.arrival)
                .slice(0, 3)
                .map((price, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{price.commodity}</span>
                    <span className="text-blue-600">{price.volume.arrival} {price.unit}s</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMarketPrices;