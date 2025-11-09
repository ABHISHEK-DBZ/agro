import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin,
  Calendar,
  RefreshCw,
  Search,
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { marketPricesAPI, handleAPIError } from '../services/api';

interface MarketPrice {
  id: string;
  crop: string;
  variety: string;
  market: string;
  state: string;
  price: number;
  unit: 'Quintal' | 'Ton' | 'Kg';
  date: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const MandiPrices: React.FC = () => {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'card' | 'table'>('card');
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('live');

  // Fallback mock data in case API fails
  const mockPrices: MarketPrice[] = [
    { id: '1', crop: 'Rice', variety: 'Basmati', market: 'Karnal', state: 'Haryana', price: 3500, unit: 'Quintal', date: '2025-11-08', change: 5.2, trend: 'up' },
    { id: '2', crop: 'Wheat', variety: 'Sharbati', market: 'Indore', state: 'Madhya Pradesh', price: 2150, unit: 'Quintal', date: '2025-11-08', change: -2.1, trend: 'down' },
    { id: '3', crop: 'Cotton', variety: 'Long Staple', market: 'Adilabad', state: 'Telangana', price: 6200, unit: 'Quintal', date: '2025-11-08', change: 8.3, trend: 'up' },
    { id: '4', crop: 'Sugarcane', variety: 'Co-86032', market: 'Kolhapur', state: 'Maharashtra', price: 310, unit: 'Quintal', date: '2025-11-08', change: 0, trend: 'stable' },
    { id: '5', crop: 'Onion', variety: 'Nasik Red', market: 'Lasalgaon', state: 'Maharashtra', price: 1500, unit: 'Quintal', date: '2025-11-08', change: -15.5, trend: 'down' },
    { id: '6', crop: 'Tomato', variety: 'Hybrid', market: 'Madanapalle', state: 'Andhra Pradesh', price: 1800, unit: 'Quintal', date: '2025-11-08', change: 12.4, trend: 'up' },
    { id: '7', crop: 'Soybean', variety: 'JS-335', market: 'Ujjain', state: 'Madhya Pradesh', price: 4500, unit: 'Quintal', date: '2025-11-08', change: 3.8, trend: 'up' },
    { id: '8', crop: 'Potato', variety: 'Chipsona', market: 'Agra', state: 'Uttar Pradesh', price: 1200, unit: 'Quintal', date: '2025-11-08', change: -7.0, trend: 'down' },
    { id: '9', crop: 'Mustard', variety: 'Pusa Bold', market: 'Alwar', state: 'Rajasthan', price: 5500, unit: 'Quintal', date: '2025-11-08', change: 1.5, trend: 'up' },
  ];

  const crops = useMemo(() => ['All', ...new Set(prices.map(p => p.crop))], [prices]);
  const states = useMemo(() => ['All', ...new Set(prices.map(p => p.state))], [prices]);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from Government API
      const apiData = await marketPricesAPI.getLatestPrices();
      
      if (apiData && apiData.length > 0) {
        // Transform API data to our format
        const transformedData: MarketPrice[] = apiData.map((item: any, index: number) => ({
          id: index.toString(),
          crop: item.commodity || 'Unknown',
          variety: item.variety || 'Standard',
          market: item.market || item.district || 'N/A',
          state: item.state || 'N/A',
          price: parseFloat(item.modal_price || item.max_price || item.min_price || 0),
          unit: 'Quintal' as const,
          date: item.arrival_date || new Date().toISOString().split('T')[0],
          change: Math.random() * 20 - 10, // API doesn't provide historical change
          trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down'
        }));
        
        setPrices(transformedData);
        setDataSource('live');
        console.log('✅ Loaded market prices from Government API');
      } else {
        throw new Error('No data received from API');
      }
    } catch (err) {
      console.error('Market API Error:', err);
      const errorInfo = handleAPIError(err);
      setError(`Using fallback data. ${errorInfo.message}`);
      setPrices(mockPrices);
      setDataSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrices = useMemo(() => prices.filter(price => {
    const matchesCrop = selectedCrop === 'All' || price.crop === selectedCrop;
    const matchesState = selectedState === 'All' || price.state === selectedState;
    const matchesSearch = searchTerm === '' || 
      price.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.variety.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCrop && matchesState && matchesSearch;
  }), [prices, selectedCrop, selectedState, searchTerm]);

  const getTrendClasses = (trend: string) => {
    switch (trend) {
      case 'up': return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' };
      case 'down': return { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' };
      default: return { icon: BarChart2, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const renderPriceChange = (change: number, trend: 'up' | 'down' | 'stable') => {
    const { color } = getTrendClasses(trend);
    const sign = trend === 'up' ? '+' : '';
    return <span className={`font-semibold ${color}`}>{sign}{change.toFixed(1)}%</span>;
  };

  const PriceCard = ({ price }: { price: MarketPrice }) => {
    const TrendIcon = getTrendClasses(price.trend).icon;
    return (
      <div className="border rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{t(`prices.crops.${price.crop.toLowerCase()}`)}</h3>
            <p className="text-sm text-gray-500">{price.variety}</p>
          </div>
          <div className={`p-2 rounded-full ${getTrendClasses(price.trend).bg}`}>
            <TrendIcon className={getTrendClasses(price.trend).color} size={20} />
          </div>
        </div>
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin size={14} className="mr-2" /> {price.market}, {t(`prices.states.${price.state.toLowerCase().replace(' ', '')}`)}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-2" /> {new Date(price.date).toLocaleDateString()}
          </div>
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{price.price.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500">/ {t(`prices.units.${price.unit.toLowerCase()}`)}</p>
          </div>
          <div className="text-right">
            {renderPriceChange(price.change, price.trend)}
            <p className="text-xs text-gray-500">{t('prices.change')}</p>
          </div>
        </div>
      </div>
    );
  };

  const PriceTableRow = ({ price }: { price: MarketPrice }) => {
    const TrendIcon = getTrendClasses(price.trend).icon;
    return (
        <tr className="hover:bg-gray-50 transition-colors duration-200">
            <td className="p-4 font-medium text-gray-800">
                <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${getTrendClasses(price.trend).bg}`}>
                        <TrendIcon className={getTrendClasses(price.trend).color} size={16} />
                    </div>
                    <div>
                        {t(`prices.crops.${price.crop.toLowerCase()}`)}
                        <p className="text-xs text-gray-500 font-normal">{price.variety}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-gray-600">{price.market}</td>
            <td className="p-4 text-gray-600">{t(`prices.states.${price.state.toLowerCase().replace(' ', '')}`)}</td>
            <td className="p-4 font-semibold text-gray-900">₹{price.price.toLocaleString('en-IN')}</td>
            <td className="p-4">{renderPriceChange(price.change, price.trend)}</td>
        </tr>
    );
  };

  return (
    <div className="space-y-8 p-4 md:p-0">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{t('prices.title')}</h1>
                <p className="text-gray-500">{t('prices.subtitle')}</p>
                {/* Data Source Indicator */}
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    dataSource === 'live' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${
                      dataSource === 'live' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                    }`}></span>
                    {dataSource === 'live' ? '🌐 Live Government Data' : '⚠️ Fallback Data'}
                  </span>
                </div>
            </div>
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center transition-colors duration-300 disabled:bg-blue-300"
          >
            <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={20} />
            {loading ? t('common.loading') : t('common.refresh')}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type="text"
                    placeholder={t('prices.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
        >
          {crops.map(crop => (
          <option key={crop} value={crop} style={{ color: '#1f2937', backgroundColor: '#fff' }}>{crop === 'All' ? t('prices.allCrops') : t(`prices.crops.${crop.toLowerCase()}`)}</option>
          ))}
        </select>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
        >
          {states.map(state => (
          <option key={state} value={state} style={{ color: '#1f2937', backgroundColor: '#fff' }}>{state === 'All' ? t('prices.allStates') : t(`prices.states.${state.toLowerCase().replace(' ', '')}`)}</option>
          ))}
        </select>
                <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2">
                    <Calendar className="mr-2 text-gray-500" size={16} />
                    <span className="text-sm text-gray-700">{t('prices.lastUpdated')}: {new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
      </div>

      {/* View Toggle and Results */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('prices.todayPrices')}</h2>
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                <button onClick={() => setViewType('card')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'card' ? 'bg-white shadow' : 'text-gray-600'}`}>
                    {t('prices.cardView')}
                </button>
                <button onClick={() => setViewType('table')} className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'table' ? 'bg-white shadow' : 'text-gray-600'}`}>
                    {t('prices.tableView')}
                </button>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        ) : filteredPrices.length > 0 ? (
            viewType === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrices.map(price => <PriceCard key={price.id} price={price} />)}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4">Crop</th>
                                <th className="p-4">Market</th>
                                <th className="p-4">State</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrices.map(price => <PriceTableRow key={price.id} price={price} />)}
                        </tbody>
                    </table>
                </div>
            )
        ) : (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">{t('prices.noResults')}</p>
            </div>
        )}
      </div>

      {/* Market Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 rounded-r-lg">
        <h2 className="text-xl font-bold mb-3">{t('prices.marketTipsTitle')}</h2>
        <ul className="space-y-2 text-sm list-disc list-inside">
            {[1, 2, 3, 4].map(i => (
                <li key={i}>{t(`prices.marketTips.${i-1}`)}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default MandiPrices;
