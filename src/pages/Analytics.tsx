import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Droplets, 
  Sun, 
  Cloud, 
  Thermometer, 
  Activity,
  Leaf,
  DollarSign,
  Users,
  MessageCircle,
  Eye,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  farmingMetrics: {
    totalCrops: number;
    activeSeason: string;
    yieldTrend: 'up' | 'down' | 'stable';
    yieldPercentage: number;
  };
  weatherAnalytics: {
    avgTemperature: number;
    totalRainfall: number;
    humidityLevel: number;
    weatherTrend: 'improving' | 'declining' | 'stable';
  };
  communityEngagement: {
    totalPosts: number;
    totalLikes: number;
    totalViews: number;
    engagementRate: number;
  };
  marketInsights: {
    pricesTrend: 'up' | 'down' | 'stable';
    topCrop: string;
    profitMargin: number;
    marketScore: number;
  };
}

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock analytics data generation
  const generateAnalyticsData = (): AnalyticsData => {
    return {
      farmingMetrics: {
        totalCrops: Math.floor(Math.random() * 10) + 5,
        activeSeason: ['Kharif', 'Rabi', 'Zaid'][Math.floor(Math.random() * 3)],
        yieldTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        yieldPercentage: Math.floor(Math.random() * 30) + 70
      },
      weatherAnalytics: {
        avgTemperature: Math.floor(Math.random() * 15) + 20,
        totalRainfall: Math.floor(Math.random() * 200) + 50,
        humidityLevel: Math.floor(Math.random() * 40) + 40,
        weatherTrend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as 'improving' | 'declining' | 'stable'
      },
      communityEngagement: {
        totalPosts: Math.floor(Math.random() * 100) + 50,
        totalLikes: Math.floor(Math.random() * 500) + 200,
        totalViews: Math.floor(Math.random() * 2000) + 1000,
        engagementRate: Math.floor(Math.random() * 40) + 60
      },
      marketInsights: {
        pricesTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        topCrop: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize'][Math.floor(Math.random() * 5)],
        profitMargin: Math.floor(Math.random() * 30) + 15,
        marketScore: Math.floor(Math.random() * 30) + 70
      }
    };
  };

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateAnalyticsData();
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Use default data on error
      setAnalyticsData(generateAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    loadAnalytics();
    
    let interval: NodeJS.Timeout;
    if (isRealTime) {
      interval = setInterval(() => {
        loadAnalytics();
      }, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTime]);

  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return 'text-green-600 bg-green-100';
      case 'down':
      case 'declining':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load analytics data</p>
          <button 
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                {t('nav.analytics')} Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive farming analytics and insights / व्यापक कृषि विश्लेषण और अंतर्दृष्टि
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={toggleRealTime}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isRealTime 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className={`h-4 w-4 ${isRealTime ? 'animate-pulse' : ''}`} />
                {isRealTime ? 'Live Mode ON' : 'Enable Live Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Farming Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Total Crops</h3>
                <p className="text-2xl font-bold text-green-600">{analyticsData.farmingMetrics.totalCrops}</p>
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Active Season: {analyticsData.farmingMetrics.activeSeason}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Yield Performance</h3>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.farmingMetrics.yieldPercentage}%</p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(analyticsData.farmingMetrics.yieldTrend)}
              </div>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(analyticsData.farmingMetrics.yieldTrend)}`}>
                {getTrendIcon(analyticsData.farmingMetrics.yieldTrend)}
                {analyticsData.farmingMetrics.yieldTrend}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Avg Temperature</h3>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.weatherAnalytics.avgTemperature}°C</p>
              </div>
              <Thermometer className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Humidity: {analyticsData.weatherAnalytics.humidityLevel}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Market Score</h3>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.marketInsights.marketScore}/100</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Top Crop: {analyticsData.marketInsights.topCrop}</span>
            </div>
          </div>
        </div>

        {/* Weather Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              Weather Analytics
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Total Rainfall</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-blue-600">{analyticsData.weatherAnalytics.totalRainfall}mm</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Weather Trend</p>
                    <p className="text-sm text-gray-600">Overall conditions</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(analyticsData.weatherAnalytics.weatherTrend)}`}>
                  {getTrendIcon(analyticsData.weatherAnalytics.weatherTrend)}
                  {analyticsData.weatherAnalytics.weatherTrend}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Community Engagement
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{analyticsData.communityEngagement.totalPosts}</p>
                  <p className="text-xs text-gray-600">Posts</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600">{analyticsData.communityEngagement.totalLikes}</p>
                  <p className="text-xs text-gray-600">Likes</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-600">{analyticsData.communityEngagement.totalViews}</p>
                  <p className="text-xs text-gray-600">Views</p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Engagement Rate</span>
                  <span className="text-lg font-bold text-green-600">{analyticsData.communityEngagement.engagementRate}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.communityEngagement.engagementRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Market Insights & Profitability
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Price Trends</h3>
              <div className="flex items-center gap-2">
                {getTrendIcon(analyticsData.marketInsights.pricesTrend)}
                <span className="font-semibold text-gray-800 capitalize">{analyticsData.marketInsights.pricesTrend}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Profit Margin</h3>
              <p className="text-2xl font-bold text-purple-600">{analyticsData.marketInsights.profitMargin}%</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Top Performing Crop</h3>
              <p className="text-xl font-bold text-orange-600">{analyticsData.marketInsights.topCrop}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Analytics data updates every 30 seconds in live mode / लाइव मोड में एनालिटिक्स डेटा हर 30 सेकंड में अपडेट होता है</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;