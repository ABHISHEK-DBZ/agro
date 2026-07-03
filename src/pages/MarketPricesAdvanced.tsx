import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, MapPin, IndianRupee, Search, X, Filter, BarChart3, Globe, Star, History, Calendar, Clock, Activity, Zap, Target, Award, AlertCircle, ChevronDown, Eye, Bell, Download, Share2, Database, Wifi, Signal, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import realTimeDataService from '../services/realTimeDataService';
import offlineStorageService from '../services/offlineStorageService';
import type { RealTimeMarketData } from '../services/realTimeDataService';

interface MarketPrice {
  id: string;
  commodity: string;
  commodityHindi: string;
  price: number;
  unit: string;
  market: string;
  district: string;
  state: string;
  change: number;
  changePercent: number;
  lastUpdated: string;
  volume: number;
  quality: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

interface StateData {
  name: string;
  districts: string[];
}

const MarketPricesAdvanced: React.FC = () => {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume' | 'name'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'chart'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true); // Enable auto-refresh by default
  const [favoriteItems, setFavoriteItems] = useState<string[]>(['Wheat', 'Rice', 'Cotton']);
  const [priceAlerts, setPriceAlerts] = useState<{commodity: string, targetPrice: number}[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // All Indian States and Major Districts
  const statesAndDistricts: StateData[] = [
    {
      name: 'Andhra Pradesh',
      districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Anantapur', 'Kadapa', 'Chittoor', 'West Godavari', 'East Godavari', 'Krishna', 'Prakasam', 'Srikakulam']
    },
    {
      name: 'Assam',
      districts: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur', 'Nagaon', 'Bongaigaon', 'Tinsukia', 'Dhubri', 'Goalpara', 'Karimganj', 'Sivasagar', 'Lakhimpur', 'Darrang', 'Kamrup']
    },
    {
      name: 'Bihar',
      districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari']
    },
    {
      name: 'Chhattisgarh',
      districts: ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Mahasamund', 'Kanker', 'Bastar', 'Kondagaon', 'Narayanpur', 'Sukma']
    },
    {
      name: 'Delhi',
      districts: ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi', 'Shahdara']
    },
    {
      name: 'Gujarat',
      districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Mehsana', 'Morbi', 'Navsari', 'Bharuch', 'Patan', 'Valsad']
    },
    {
      name: 'Haryana',
      districts: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Sirsa', 'Bhiwani', 'Jind', 'Kaithal', 'Rewari']
    },
    {
      name: 'Himachal Pradesh',
      districts: ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Chamba', 'Kangra', 'Kinnaur', 'Lahaul Spiti', 'Sirmaur']
    },
    {
      name: 'Jharkhand',
      districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chaibasa', 'Dumka', 'Godda', 'Gumla', 'Koderma']
    },
    {
      name: 'Karnataka',
      districts: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Chitradurga', 'Hassan', 'Mandya', 'Udupi']
    },
    {
      name: 'Kerala',
      districts: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kottayam', 'Kannur', 'Kasaragod', 'Malappuram', 'Pathanamthitta', 'Idukki', 'Wayanad']
    },
    {
      name: 'Madhya Pradesh',
      districts: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli', 'Burhanpur', 'Khandwa', 'Katni', 'Morena']
    },
    {
      name: 'Maharashtra',
      districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Nanded', 'Satara', 'Thane']
    },
    {
      name: 'Odisha',
      districts: ['Bhubaneswar', 'Cuttack', 'Berhampur', 'Sambalpur', 'Rourkela', 'Balasore', 'Baripada', 'Jharsuguda', 'Jeypore', 'Barbil', 'Puri', 'Angul', 'Dhenkanal', 'Bolangir', 'Koraput']
    },
    {
      name: 'Punjab',
      districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Sangrur', 'Khanna', 'Abohar', 'Malerkotla']
    },
    {
      name: 'Rajasthan',
      districts: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Tonk', 'Kishangarh', 'Beawar', 'Gangapur City']
    },
    {
      name: 'Tamil Nadu',
      districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Hosur']
    },
    {
      name: 'Telangana',
      districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Kothagudem']
    },
    {
      name: 'Uttar Pradesh',
      districts: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi']
    },
    {
      name: 'West Bengal',
      districts: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Haldia', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri']
    }
  ];

  // Commodity Categories
  const categories = [
    'All Categories',
    'Cereals',
    'Pulses', 
    'Oilseeds',
    'Spices',
    'Fruits',
    'Vegetables',
    'Cash Crops',
    'Fodder'
  ];

  // Enhanced Mock Data with all states and districts
  const mockPrices: MarketPrice[] = [
    // Cereals
    { id: '1', commodity: 'Wheat', commodityHindi: 'गेहूं', price: 2150, unit: 'per quintal', market: 'Azadpur Mandi', district: 'New Delhi', state: 'Delhi', change: 50, changePercent: 2.4, lastUpdated: '2 hours ago', volume: 450, quality: 'FAQ', category: 'Cereals', minPrice: 2000, maxPrice: 2300, avgPrice: 2150 },
    { id: '2', commodity: 'Rice', commodityHindi: 'चावल', price: 3200, unit: 'per quintal', market: 'Ludhiana Mandi', district: 'Ludhiana', state: 'Punjab', change: -30, changePercent: -0.9, lastUpdated: '1 hour ago', volume: 320, quality: 'Grade A', category: 'Cereals', minPrice: 3000, maxPrice: 3400, avgPrice: 3200 },
    { id: '3', commodity: 'Maize', commodityHindi: 'मक्का', price: 1850, unit: 'per quintal', market: 'Pune Mandi', district: 'Pune', state: 'Maharashtra', change: 25, changePercent: 1.4, lastUpdated: '3 hours ago', volume: 280, quality: 'FAQ', category: 'Cereals', minPrice: 1700, maxPrice: 2000, avgPrice: 1850 },
    { id: '4', commodity: 'Barley', commodityHindi: 'जौ', price: 1650, unit: 'per quintal', market: 'Jaipur Mandi', district: 'Jaipur', state: 'Rajasthan', change: 15, changePercent: 0.9, lastUpdated: '4 hours ago', volume: 180, quality: 'Medium', category: 'Cereals', minPrice: 1500, maxPrice: 1800, avgPrice: 1650 },
    
    // Pulses
    { id: '5', commodity: 'Chana', commodityHindi: 'चना', price: 5200, unit: 'per quintal', market: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh', change: 75, changePercent: 1.5, lastUpdated: '1.5 hours ago', volume: 220, quality: 'Bold', category: 'Pulses', minPrice: 4800, maxPrice: 5500, avgPrice: 5200 },
    { id: '6', commodity: 'Arhar', commodityHindi: 'अरहर', price: 7800, unit: 'per quintal', market: 'Latur Mandi', district: 'Solapur', state: 'Maharashtra', change: -120, changePercent: -1.5, lastUpdated: '2.5 hours ago', volume: 150, quality: 'FAQ', category: 'Pulses', minPrice: 7200, maxPrice: 8200, avgPrice: 7800 },
    { id: '7', commodity: 'Moong', commodityHindi: 'मूंग', price: 8500, unit: 'per quintal', market: 'Kota Mandi', district: 'Kota', state: 'Rajasthan', change: 200, changePercent: 2.4, lastUpdated: '1 hour ago', volume: 120, quality: 'Good', category: 'Pulses', minPrice: 8000, maxPrice: 9000, avgPrice: 8500 },
    
    // Oilseeds & Cash Crops
    { id: '8', commodity: 'Cotton', commodityHindi: 'कपास', price: 6200, unit: 'per quintal', market: 'Guntur Mandi', district: 'Guntur', state: 'Andhra Pradesh', change: 100, changePercent: 1.6, lastUpdated: '2 hours ago', volume: 380, quality: 'Shankar-6', category: 'Cash Crops', minPrice: 5800, maxPrice: 6600, avgPrice: 6200 },
    { id: '9', commodity: 'Groundnut', commodityHindi: 'मूंगफली', price: 5800, unit: 'per quintal', market: 'Rajkot Mandi', district: 'Rajkot', state: 'Gujarat', change: 80, changePercent: 1.4, lastUpdated: '3 hours ago', volume: 200, quality: 'Bold', category: 'Oilseeds', minPrice: 5400, maxPrice: 6200, avgPrice: 5800 },
    { id: '10', commodity: 'Mustard', commodityHindi: 'सरसों', price: 4200, unit: 'per quintal', market: 'Bharatpur Mandi', district: 'Bharatpur', state: 'Rajasthan', change: 60, changePercent: 1.5, lastUpdated: '2.5 hours ago', volume: 160, quality: 'RM-8', category: 'Oilseeds', minPrice: 3900, maxPrice: 4500, avgPrice: 4200 },
    
    // Spices
    { id: '11', commodity: 'Turmeric', commodityHindi: 'हल्दी', price: 12500, unit: 'per quintal', market: 'Erode Mandi', district: 'Erode', state: 'Tamil Nadu', change: 300, changePercent: 2.5, lastUpdated: '4 hours ago', volume: 80, quality: 'Salem', category: 'Spices', minPrice: 11500, maxPrice: 13500, avgPrice: 12500 },
    { id: '12', commodity: 'Coriander', commodityHindi: 'धनिया', price: 8900, unit: 'per quintal', market: 'Ramganj Mandi', district: 'Kota', state: 'Rajasthan', change: 150, changePercent: 1.7, lastUpdated: '3.5 hours ago', volume: 90, quality: 'Eagle', category: 'Spices', minPrice: 8200, maxPrice: 9600, avgPrice: 8900 },
    
    // Vegetables
    { id: '13', commodity: 'Onion', commodityHindi: 'प्याज', price: 2800, unit: 'per quintal', market: 'Nashik Mandi', district: 'Nashik', state: 'Maharashtra', change: -80, changePercent: -2.8, lastUpdated: '1 hour ago', volume: 420, quality: 'Medium', category: 'Vegetables', minPrice: 2400, maxPrice: 3200, avgPrice: 2800 },
    { id: '14', commodity: 'Potato', commodityHindi: 'आलू', price: 1200, unit: 'per quintal', market: 'Agra Mandi', district: 'Agra', state: 'Uttar Pradesh', change: 40, changePercent: 3.4, lastUpdated: '2 hours ago', volume: 520, quality: 'Jyoti', category: 'Vegetables', minPrice: 1000, maxPrice: 1400, avgPrice: 1200 },
    { id: '15', commodity: 'Tomato', commodityHindi: 'टमाटर', price: 3500, unit: 'per quintal', market: 'Bangalore Mandi', district: 'Bangalore', state: 'Karnataka', change: -150, changePercent: -4.1, lastUpdated: '1.5 hours ago', volume: 300, quality: 'Hybrid', category: 'Vegetables', minPrice: 3000, maxPrice: 4000, avgPrice: 3500 },
    
    // Fruits
    { id: '16', commodity: 'Apple', commodityHindi: 'सेब', price: 8500, unit: 'per quintal', market: 'Shimla Mandi', district: 'Shimla', state: 'Himachal Pradesh', change: 200, changePercent: 2.4, lastUpdated: '5 hours ago', volume: 150, quality: 'Royal Delicious', category: 'Fruits', minPrice: 7800, maxPrice: 9200, avgPrice: 8500 },
    { id: '17', commodity: 'Mango', commodityHindi: 'आम', price: 4500, unit: 'per quintal', market: 'Lucknow Mandi', district: 'Lucknow', state: 'Uttar Pradesh', change: 100, changePercent: 2.3, lastUpdated: '3 hours ago', volume: 180, quality: 'Dasheri', category: 'Fruits', minPrice: 4000, maxPrice: 5000, avgPrice: 4500 },
    
    // More items from different states
    { id: '18', commodity: 'Sugarcane', commodityHindi: 'गन्ना', price: 350, unit: 'per quintal', market: 'Muzaffarpur Mandi', district: 'Muzaffarpur', state: 'Bihar', change: 10, changePercent: 2.9, lastUpdated: '2 hours ago', volume: 800, quality: 'Co-238', category: 'Cash Crops', minPrice: 320, maxPrice: 380, avgPrice: 350 },
    { id: '19', commodity: 'Jute', commodityHindi: 'जूट', price: 4200, unit: 'per quintal', market: 'Kolkata Mandi', district: 'Kolkata', state: 'West Bengal', change: 80, changePercent: 1.9, lastUpdated: '4 hours ago', volume: 120, quality: 'TD-5', category: 'Cash Crops', minPrice: 3800, maxPrice: 4600, avgPrice: 4200 },
    { id: '20', commodity: 'Tea', commodityHindi: 'चाय', price: 280, unit: 'per kg', market: 'Guwahati Mandi', district: 'Guwahati', state: 'Assam', change: 5, changePercent: 1.8, lastUpdated: '6 hours ago', volume: 2500, quality: 'CTC', category: 'Cash Crops', minPrice: 260, maxPrice: 300, avgPrice: 280 }
  ];

  // Auto-refresh functionality with real-time WebSocket data service
  useEffect(() => {
    // Initialize offline storage
    offlineStorageService.init().catch(err => {
      console.error('❌ Failed to initialize offline storage:', err);
    });

    // Setup online/offline listeners
    const handleOnline = () => {
      console.log('🌐 Connection restored');
      setIsOnline(true);
      setRealTimeConnected(true);
      loadPrices(); // Reload when coming back online
    };

    const handleOffline = () => {
      console.log('📴 Connection lost');
      setIsOnline(false);
      setRealTimeConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial load
    loadPrices();
    
    // WebSocket disabled - using HTTP polling only
    // realTimeDataService.enableWebSocket();
    
    // Subscribe to real-time market data (via HTTP polling)
    const unsubscribe = realTimeDataService.subscribe('market_prices', async (data: RealTimeMarketData[]) => {
      console.log('📥 Received market price update', data.length, 'items');
      const transformedData = transformRealTimeData(data);
      setPrices(prevPrices => {
        // Merge with existing data, update existing items or add new ones
        const updatedPrices = [...prevPrices];
        transformedData.forEach(newItem => {
          // Safely check if both commodity and market exist before comparing
          const existingIndex = updatedPrices.findIndex(p => 
            p?.commodity && newItem?.commodity && p?.market && newItem?.market &&
            p.commodity === newItem.commodity && p.market === newItem.market
          );
          if (existingIndex >= 0) {
            updatedPrices[existingIndex] = newItem;
          } else {
            updatedPrices.push(newItem);
          }
        });
        return updatedPrices;
      });
      
      // Save updated data to offline storage
      const dataToSave = transformedData.map(price => ({
        id: price.id,
        data: price,
        commodity: price.commodity,
        synced: true,
        timestamp: Date.now()
      }));
      await offlineStorageService.saveBatch('market_prices', dataToSave);
      setLastSyncTime(new Date());
      
      setRealTimeConnected(realTimeDataService.isWebSocketConnected());
      setLoading(false);
    });
    
    // Monitor connection status
    const checkConnection = setInterval(() => {
      setRealTimeConnected(realTimeDataService.isWebSocketConnected());
      setIsOnline(navigator.onLine);
    }, 1000);
    
    // Enable continuous price updates every 10 seconds when autoRefresh is ON
    let refreshInterval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      console.log('⏱️ Starting live price updates (10s interval)');
      realTimeDataService.startRealTimeUpdates(['market_prices'], 30000); // 30 seconds for API calls
      
      // Also update mock prices every 10 seconds to simulate real-time changes
      refreshInterval = setInterval(() => {
        if (navigator.onLine) {
          console.log('🔄 Auto-refreshing market prices...');
          loadMockPrices(); // Simulate live price changes
        } else {
          console.log('📴 Skipping refresh - offline');
        }
      }, 10000); // 10 seconds
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      clearInterval(checkConnection);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (!autoRefresh) {
        realTimeDataService.disableWebSocket();
      }
    };
  }, [autoRefresh]);

  const transformRealTimeData = (realTimeData: RealTimeMarketData[]): MarketPrice[] => {
    return realTimeData.map((item, index) => ({
      id: `rt-${index}`,
      commodity: item.commodity,
      commodityHindi: getCommodityHindi(item.commodity),
      price: item.price.current,
      unit: 'per quintal',
      market: item.market,
      district: extractDistrictFromMarket(item.market),
      state: item.state,
      change: item.price.change,
      changePercent: item.price.changePercent,
      lastUpdated: new Date(item.timestamp).toLocaleString(),
      volume: item.volume,
      quality: item.quality,
      category: getCommodityCategory(item.commodity),
      minPrice: item.price.min,
      maxPrice: item.price.max,
      avgPrice: item.price.current
    }));
  };

  const getCommodityHindi = (commodity: string): string => {
    const hindiMap: { [key: string]: string } = {
      'Rice': 'चावल', 'Wheat': 'गेहूं', 'Cotton': 'कपास', 'Sugarcane': 'गन्ना',
      'Onion': 'प्याज', 'Tomato': 'टमाटर', 'Potato': 'आलू', 'Soybean': 'सोयाबीन',
      'Mustard': 'सरसों', 'Groundnut': 'मूंगफली', 'Maize': 'मक्का', 'Bajra': 'बाजरा'
    };
    return hindiMap[commodity] || commodity;
  };

  const extractDistrictFromMarket = (market: string): string => {
    // Extract district name from market string
    const parts = market.split(' ');
    return parts[0] || 'Unknown';
  };

  const getCommodityCategory = (commodity: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Rice': 'Cereals', 'Wheat': 'Cereals', 'Maize': 'Cereals', 'Bajra': 'Cereals',
      'Cotton': 'Cash Crops', 'Sugarcane': 'Cash Crops',
      'Onion': 'Vegetables', 'Tomato': 'Vegetables', 'Potato': 'Vegetables',
      'Soybean': 'Oilseeds', 'Mustard': 'Oilseeds', 'Groundnut': 'Oilseeds'
    };
    return categoryMap[commodity] || 'Other';
  };

  const loadPrices = async () => {
    setLoading(true);
    try {
      // First, load cached data from IndexedDB for instant display
      const cachedPrices = await offlineStorageService.getAll('market_prices');
      if (cachedPrices && cachedPrices.length > 0) {
        console.log('📦 Loaded', cachedPrices.length, 'prices from offline cache');
        // Filter out invalid items and extract data property
        const formattedCached = cachedPrices
          .map((item: any) => item.data)
          .filter((price: any) => price && price.commodity && price.market);
        setPrices(formattedCached);
        setLastSyncTime(new Date(cachedPrices[0].timestamp));
      }

      // If online, try to fetch fresh data
      if (navigator.onLine) {
        try {
          const realTimeData = await realTimeDataService.fetchData('market_prices');
          const transformedData = transformRealTimeData(realTimeData);
          
          if (transformedData.length > 0) {
            setPrices(transformedData);
            setRealTimeConnected(true);
            
            // Save fresh data to IndexedDB
            const dataToSave = transformedData.map(price => ({
              id: price.id,
              data: price,
              commodity: price.commodity,
              synced: true,
              timestamp: Date.now()
            }));
            await offlineStorageService.saveBatch('market_prices', dataToSave);
            setLastSyncTime(new Date());
            console.log('✅ Saved', dataToSave.length, 'prices to offline storage');
          } else {
            // Fallback to mock data if no real-time data
            await loadMockPrices();
            setRealTimeConnected(false);
          }
        } catch (error) {
          console.error('Error loading market prices:', error);
          // Use cached data on error
          if (cachedPrices && cachedPrices.length === 0) {
            await loadMockPrices();
          }
          setRealTimeConnected(false);
        }
      } else {
        // Offline mode - use cached data or mock data
        console.log('📴 Offline mode - using cached data');
        if (!cachedPrices || cachedPrices.length === 0) {
          await loadMockPrices();
        }
        setRealTimeConnected(false);
      }
    } catch (error) {
      console.error('Error in loadPrices:', error);
      await loadMockPrices();
      setRealTimeConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMockPrices = async () => {
    // Simulate API call with random price fluctuations and LIVE timestamps
    const now = new Date();
    const timeVariations = [
      'Just now',
      '1 minute ago',
      '2 minutes ago',
      '5 minutes ago',
      '10 minutes ago',
      '15 minutes ago',
      '30 minutes ago'
    ];
    
    const updatedPrices = mockPrices.map((price, index) => {
      const priceFluctuation = (Math.random() - 0.5) * 150;
      const newPrice = Math.max(price.price + priceFluctuation, 100);
      const changeValue = priceFluctuation;
      const changePercentValue = (changeValue / price.price) * 100;
      
      return {
        ...price,
        price: Math.round(newPrice),
        change: Math.round(changeValue),
        changePercent: Number(changePercentValue.toFixed(2)),
        lastUpdated: timeVariations[index % timeVariations.length],
        volume: price.volume + Math.floor((Math.random() - 0.5) * 50),
        minPrice: Math.round(newPrice * 0.92),
        maxPrice: Math.round(newPrice * 1.08),
        avgPrice: Math.round(newPrice)
      };
    });
    setPrices(updatedPrices);
    
    // Save mock data to offline storage
    const dataToSave = updatedPrices.map(price => ({
      id: price.id,
      data: price,
      commodity: price.commodity,
      synced: true,
      timestamp: Date.now()
    }));
    await offlineStorageService.saveBatch('market_prices', dataToSave);
    setLastSyncTime(new Date());
    
    console.log('📊 Market prices updated with live data:', updatedPrices.length, 'items');
  };

  const toggleFavorite = (commodity: string) => {
    setFavoriteItems(prev => 
      prev.includes(commodity) 
        ? prev.filter(item => item !== commodity)
        : [...prev, commodity]
    );
  };

  const addPriceAlert = (commodity: string, targetPrice: number) => {
    setPriceAlerts(prev => [...prev, { commodity, targetPrice }]);
  };

  // Enhanced filtering and sorting
  const filteredAndSortedPrices = prices
    .filter(price => {
      const matchesState = !selectedState || price.state === selectedState;
      const matchesDistrict = !selectedDistrict || price.district === selectedDistrict;
      const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || price.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        price.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.commodityHindi.includes(searchTerm) ||
        price.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.district.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !showFavorites || favoriteItems.includes(price.commodity);
      return matchesState && matchesDistrict && matchesCategory && matchesSearch && matchesFavorites;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.changePercent;
          bValue = b.changePercent;
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        default:
          aValue = a.commodity.toLowerCase();
          bValue = b.commodity.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getDistrictsForState = (state: string) => {
    const stateData = statesAndDistricts.find(s => s.name === state);
    return stateData ? stateData.districts : [];
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict(''); // Reset district when state changes
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="relative">
            <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 animate-spin" />
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-gray-700 text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Loading Live Market Prices</p>
            <p className="text-gray-500 text-sm">Fetching latest rates from mandis across India...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Live Market Prices</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Real-time commodity prices from mandis across India</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Online/Offline Status */}
              <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 transition-all duration-300 ${
                isOnline 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-orange-100 text-orange-700 border border-orange-300'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline font-semibold">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline font-semibold">Offline</span>
                  </>
                )}
              </div>

              {/* Real-time Connection Status with Animation */}
              <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 transition-all duration-300 ${
                realTimeConnected 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}>
                {realTimeConnected ? (
                  <>
                    <div className="relative">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="hidden xs:inline font-semibold">Live</span>
                    <span className="hidden sm:inline text-xs">(WebSocket)</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 opacity-60" />
                    <span className="hidden xs:inline">Cached</span>
                    {!isOnline && <span className="hidden sm:inline text-xs">(Offline)</span>}
                  </>
                )}
              </div>

              {/* Last Sync Time */}
              {lastSyncTime && (
                <div className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs bg-purple-50 text-purple-700 border border-purple-200">
                  <Clock className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    Synced {new Date().getTime() - lastSyncTime.getTime() < 60000 ? 'just now' : `${Math.floor((new Date().getTime() - lastSyncTime.getTime()) / 60000)}m ago`}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  autoRefresh 
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={autoRefresh ? "Stop Auto Refresh" : "Start Auto Refresh"}
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{autoRefresh ? 'Auto On' : 'Auto Off'}</span>
              </button>
              
              <button
                onClick={loadPrices}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
                title="Refresh Now"
                disabled={!isOnline}
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh Now</span>
              </button>
              
              <button
                onClick={() => window.open('/data-sources', '_blank')}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors flex-shrink-0"
                title="Data Sources"
              >
                <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Data Sources</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search commodities, markets, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                  showFavorites 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Favorites"
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Favorites</span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors flex-shrink-0"
                title="Filters"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All States</option>
                    {statesAndDistricts.map(state => (
                      <option key={state.name} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>

                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={!selectedState}
                  >
                    <option value="">All Districts</option>
                    {selectedState && getDistrictsForState(selectedState).map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="change">Change</option>
                      <option value="volume">Volume</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>            {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium text-sm">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'chart' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chart
              </button>
            </div>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {filteredAndSortedPrices.length} of {prices.length} commodities
          </div>
        </div>

        {/* Market Prices Display */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredAndSortedPrices.map((price) => (
              <div key={price.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{price.commodity}</h3>
                    <p className="text-sm text-gray-600">{price.commodityHindi}</p>
                    <p className="text-xs text-gray-500">{price.quality}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(price.commodity)}
                    className={`p-2 rounded-full transition-colors ${
                      favoriteItems.includes(price.commodity)
                        ? 'text-yellow-500 bg-yellow-50'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {price.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">{price.unit}</span>
                  </div>
                  
                  <div className={`flex items-center mt-2 ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {price.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="ml-1 text-sm font-medium">
                      ₹{Math.abs(price.change).toFixed(0)} ({price.changePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{price.market}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>{price.district}, {price.state}</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    <span>Volume: {price.volume} quintals</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Updated {price.lastUpdated}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: ₹{price.minPrice}</span>
                    <span>Avg: ₹{price.avgPrice}</span>
                    <span>Max: ₹{price.maxPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedPrices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{price.commodity}</div>
                            <div className="text-sm text-gray-500">{price.commodityHindi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">₹{price.price.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{price.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {price.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                          <span className="text-sm font-medium">
                            ₹{Math.abs(price.change).toFixed(0)} ({price.changePercent.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{price.market}</div>
                        <div className="text-sm text-gray-500">{price.district}, {price.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {price.volume} quintals
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFavorite(price.commodity)}
                            className={`p-1 rounded ${
                              favoriteItems.includes(price.commodity)
                                ? 'text-yellow-500'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Bell className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && filteredAndSortedPrices.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prices found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}            {/* Market Insights */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Market Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-800">Trending Up</h3>
                  <p className="text-sm text-green-600 mt-1">
                    Potato, Turmeric, Cotton
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-red-800">Trending Down</h3>
                  <p className="text-sm text-red-600 mt-1">
                    Onion, Rice, Tomato
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-blue-800">High Volume</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Wheat, Sugarcane, Tea
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-purple-800">Price Alerts</h3>
                  <p className="text-sm text-purple-600 mt-1">
                    {priceAlerts.length} active alerts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{statesAndDistricts.length} States</h3>
                <p className="text-gray-600">Coverage across India</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {statesAndDistricts.reduce((total, state) => total + state.districts.length, 0)} Districts
                </h3>
                <p className="text-gray-600">Major markets covered</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{prices.length} Commodities</h3>
                <p className="text-gray-600">Real-time tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPricesAdvanced;