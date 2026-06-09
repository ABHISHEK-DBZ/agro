import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
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
  Zap,
  Calendar,
  Sprout
} from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import communityService from '../services/communityService';
import { Card, Kpi, EmptyState, Skeleton, PageHeader, Button, SectionTitle } from '../components/ui';

interface AnalyticsData {
  farmingMetrics: {
    totalCrops: number;
    activeSeason: string;
    yieldTrend: 'up' | 'down' | 'stable';
    yieldPercentage: number;
  };
  weatherAnalytics: {
    avgTemperature: number | null;
    totalRainfall: number | null;
    humidityLevel: number | null;
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
    topCrop: string | null;
    profitMargin: number | null;
    marketScore: number | null;
  };
  dataAvailable: {
    weather: boolean;
    community: boolean;
    market: boolean;
  };
}

// Derive Indian agricultural season deterministically from current month.
const getActiveSeason = (): string => {
  const m = new Date().getMonth(); // 0-11
  if (m >= 5 && m <= 9) return 'Kharif';
  if (m === 10 || m === 11 || m <= 2) return 'Rabi';
  return 'Zaid';
};

const buildEmptyData = (): AnalyticsData => ({
  farmingMetrics: {
    totalCrops: 0,
    activeSeason: getActiveSeason(),
    yieldTrend: 'stable',
    yieldPercentage: 0
  },
  weatherAnalytics: {
    avgTemperature: null,
    totalRainfall: null,
    humidityLevel: null,
    weatherTrend: 'stable'
  },
  communityEngagement: {
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
    engagementRate: 0
  },
  marketInsights: {
    pricesTrend: 'stable',
    topCrop: null,
    profitMargin: null,
    marketScore: null
  },
  dataAvailable: {
    weather: false,
    community: false,
    market: false
  }
});

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAnalytics = async () => {
    if (!user?.uid) {
      setAnalyticsData(buildEmptyData());
      setLoading(false);
      return;
    }

    setLoading(true);
    const data: AnalyticsData = buildEmptyData();

    try {
      // 1. Farming metrics: count crops from `users/{uid}.crops` array
      try {
        const userSnap = await import('firebase/firestore').then(({ getDoc, doc }) => getDoc(doc(db, 'users', user.uid)));
        if (userSnap.exists()) {
          const userData = userSnap.data() as { crops?: unknown[]; activeCrop?: { cropName?: string } };
          if (Array.isArray(userData.crops)) {
            data.farmingMetrics.totalCrops = userData.crops.filter((c) => typeof c === 'string').length;
          }
        }
      } catch (err) {
        console.warn('Analytics: failed to read user crops', err);
      }

      // 2. Weather analytics: real Open-Meteo for user location (or Pune as a sensible default)
      try {
        let lat = 18.5204;
        let lon = 73.8567;
        try {
          const userSnap = await import('firebase/firestore').then(({ getDoc, doc }) => getDoc(doc(db, 'users', user.uid)));
          if (userSnap.exists()) {
            const u = userSnap.data() as { location?: { coordinates?: { latitude?: number; longitude?: number } } };
            const c = u.location?.coordinates;
            if (typeof c?.latitude === 'number' && typeof c?.longitude === 'number') {
              lat = c.latitude;
              lon = c.longitude;
            }
          }
        } catch {
          // keep default
        }
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation` +
            `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
            `&forecast_days=7&timezone=auto`
        );
        if (response.ok) {
          const json = (await response.json()) as {
            current?: { temperature_2m?: number; relative_humidity_2m?: number; precipitation?: number };
            daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[]; precipitation_sum?: number[] };
          };
          if (json.current) {
            data.weatherAnalytics.avgTemperature =
              typeof json.current.temperature_2m === 'number' ? json.current.temperature_2m : null;
            data.weatherAnalytics.humidityLevel =
              typeof json.current.relative_humidity_2m === 'number' ? json.current.relative_humidity_2m : null;
            data.weatherAnalytics.totalRainfall =
              typeof json.current.precipitation === 'number' ? json.current.precipitation : null;
          }
          if (json.daily?.temperature_2m_max && json.daily?.temperature_2m_min && json.daily.precipitation_sum) {
            const maxs = json.daily.temperature_2m_max.filter((v) => typeof v === 'number');
            const mins = json.daily.temperature_2m_min.filter((v) => typeof v === 'number');
            const rain = json.daily.precipitation_sum.filter((v) => typeof v === 'number');
            if (maxs.length > 0) {
              const avgMax = maxs.reduce((a, b) => a + b, 0) / maxs.length;
              const avgMin = mins.reduce((a, b) => a + b, 0) / Math.max(mins.length, 1);
              data.weatherAnalytics.avgTemperature = (avgMax + avgMin) / 2;
              data.weatherAnalytics.totalRainfall = rain.reduce((a, b) => a + b, 0);
              // crude trend: compare first half vs second half
              if (maxs.length >= 4) {
                const first = (maxs[0] + maxs[1]) / 2;
                const second = (maxs[maxs.length - 1] + maxs[maxs.length - 2]) / 2;
                if (second - first > 1.5) data.weatherAnalytics.weatherTrend = 'improving';
                else if (first - second > 1.5) data.weatherAnalytics.weatherTrend = 'declining';
                else data.weatherAnalytics.weatherTrend = 'stable';
              }
            }
            data.dataAvailable.weather = true;
          }
        }
      } catch (err) {
        console.warn('Analytics: Open-Meteo fetch failed', err);
      }

      // 3. Community engagement: real posts and likes by current user
      try {
        const userPostsQ = query(
          collection(db, 'communityPosts'),
          where('authorId', '==', user.uid)
        );
        const userPostsSnap = await getDocs(userPostsQ);
        let totalLikes = 0;
        let totalViews = 0;
        userPostsSnap.forEach((docSnap) => {
          const d = docSnap.data() as { likes?: number; views?: number };
          if (typeof d.likes === 'number') totalLikes += d.likes;
          if (typeof d.views === 'number') totalViews += d.views;
        });
        data.communityEngagement.totalPosts = userPostsSnap.size;
        data.communityEngagement.totalLikes = totalLikes;
        data.communityEngagement.totalViews = totalViews;
        if (userPostsSnap.size > 0) {
          data.communityEngagement.engagementRate = Math.min(
            100,
            Math.round((totalLikes / userPostsSnap.size) * 10)
          );
        }
        if (userPostsSnap.size > 0 || totalLikes > 0) {
          data.dataAvailable.community = true;
        }
      } catch (err) {
        console.warn('Analytics: failed to compute community engagement', err);
      }

      // 4. Market insights: empty state unless the service exposes real data
      try {
        const maybePrices = (communityService as unknown as {
          getMarketPrices?: () => Promise<Array<{ crop?: string; changePercent?: number; price?: number }>>;
        }).getMarketPrices;
        if (typeof maybePrices === 'function') {
          const prices = await maybePrices();
          if (Array.isArray(prices) && prices.length > 0) {
            data.dataAvailable.market = true;
            const top = prices.reduce<{ crop?: string; changePercent?: number; price?: number } | null>(
              (acc, p) => (typeof p.changePercent === 'number' && (!acc || p.changePercent > (acc.changePercent ?? -Infinity)) ? p : acc),
              null
            );
            if (top?.crop) data.marketInsights.topCrop = top.crop;
            if (typeof top?.changePercent === 'number') {
              data.marketInsights.profitMargin = Math.max(0, Math.round(top.changePercent));
              if (top.changePercent > 0) data.marketInsights.pricesTrend = 'up';
              else if (top.changePercent < 0) data.marketInsights.pricesTrend = 'down';
              data.marketInsights.marketScore = Math.max(0, Math.min(100, 50 + Math.round(top.changePercent)));
            }
          }
        }
      } catch (err) {
        console.warn('Analytics: getMarketPrices unavailable', err);
      }

      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalyticsData(buildEmptyData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-success-600" />;
      case 'down':
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-danger-600" />;
      default:
        return <Activity className="h-4 w-4 text-harvest-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return 'text-success-700 bg-success-50';
      case 'down':
      case 'declining':
        return 'text-danger-700 bg-danger-50';
      default:
        return 'text-harvest-700 bg-harvest-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container-app py-6 space-y-4">
          <Skeleton height={32} width="40%" />
          <Skeleton height={16} width="60%" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={120} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} height={200} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = analyticsData ?? buildEmptyData();
  const noData =
    !data.dataAvailable.weather &&
    !data.dataAvailable.community &&
    !data.dataAvailable.market &&
    data.farmingMetrics.totalCrops === 0;

  if (noData) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container-app py-6">
          <PageHeader
            eyebrow="Insights"
            title={t('nav.analytics') || 'Analytics'}
            description="Comprehensive farming analytics and insights / व्यापक कृषि विश्लेषण और अंतर्दृष्टि"
          />
          <div className="mt-4 card card-padded">
            <EmptyState
              icon={<BarChart3 className="w-7 h-7" />}
              title="No analytics data yet"
              description="Start by adding crops, posting in the community, and letting the app record your location. Real data will appear here as it's collected."
              action={
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="primary" size="sm" onClick={() => navigate('/profile')}>
                    Set up profile
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
                    Browse community
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-app py-6 space-y-6">
        {/* Header */}
        <PageHeader
          eyebrow="Insights"
          title={t('nav.analytics') || 'Analytics'}
          description="Comprehensive farming analytics and insights / व्यापक कृषि विश्लेषण और अंतर्दृष्टि"
          actions={
            <div className="flex items-center gap-3 text-sm text-muted">
              <Button variant="ghost" size="sm" onClick={loadAnalytics} leftIcon={<Zap className="w-4 h-4" />}>
                Refresh
              </Button>
              {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          }
        />

        {/* Farming Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Kpi
            label="Total Crops"
            value={data.farmingMetrics.totalCrops}
            icon={<Leaf className="w-4 h-4" />}
            hint={`Active Season: ${data.farmingMetrics.activeSeason}`}
          />
          <Kpi
            label="Yield Performance"
            value={data.farmingMetrics.yieldPercentage > 0 ? `${data.farmingMetrics.yieldPercentage}%` : '—'}
            icon={<Sprout className="w-4 h-4" />}
            trend={
              data.farmingMetrics.yieldPercentage > 0
                ? { direction: data.farmingMetrics.yieldTrend === 'up' ? 'up' : data.farmingMetrics.yieldTrend === 'down' ? 'down' : 'flat', value: data.farmingMetrics.yieldTrend }
                : undefined
            }
          />
          <Kpi
            label="Avg Temperature"
            value={data.weatherAnalytics.avgTemperature !== null ? `${data.weatherAnalytics.avgTemperature.toFixed(1)}°C` : '—'}
            icon={<Thermometer className="w-4 h-4" />}
            hint={data.weatherAnalytics.humidityLevel !== null ? `Humidity: ${data.weatherAnalytics.humidityLevel}%` : 'No humidity data'}
          />
          <Kpi
            label="Market Score"
            value={data.marketInsights.marketScore !== null ? `${data.marketInsights.marketScore}/100` : '—'}
            icon={<DollarSign className="w-4 h-4" />}
            hint={data.marketInsights.topCrop ? `Top Crop: ${data.marketInsights.topCrop}` : 'No market data'}
          />
        </div>

        {/* Weather Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <SectionTitle icon={<Cloud className="h-4 w-4 text-sky-600" />}>
              Weather Analytics
            </SectionTitle>

            {!data.dataAvailable.weather ? (
              <EmptyState
                icon={<Sun className="w-7 h-7" />}
                title="No live weather data"
                description="Allow location access to see real-time temperature and rainfall trends for your farm."
                action={
                  <Button size="sm" variant="primary" onClick={loadAnalytics}>
                    Retry
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium text-strong">Total Rainfall</p>
                      <p className="text-xs text-muted">Next 7 days</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-sky-600">
                    {data.weatherAnalytics.totalRainfall !== null
                      ? `${data.weatherAnalytics.totalRainfall.toFixed(1)}mm`
                      : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-harvest-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sun className="h-5 w-5 text-harvest-600" />
                    <div>
                      <p className="font-medium text-strong">Weather Trend</p>
                      <p className="text-xs text-muted">Overall 7-day outlook</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(data.weatherAnalytics.weatherTrend)}`}>
                    {getTrendIcon(data.weatherAnalytics.weatherTrend)}
                    {data.weatherAnalytics.weatherTrend}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle icon={<Users className="h-4 w-4 text-leaf-600" />}>
              Community Engagement
            </SectionTitle>

            {!data.dataAvailable.community ? (
              <EmptyState
                icon={<MessageCircle className="w-7 h-7" />}
                title="No community activity yet"
                description="Post a question or share an update to see your engagement metrics here."
                action={
                  <Button size="sm" variant="primary" onClick={() => navigate('/community')}>
                    Go to community
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-leaf-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-leaf-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-leaf-700">{data.communityEngagement.totalPosts}</p>
                    <p className="text-xs text-muted">Posts</p>
                  </div>
                  <div className="text-center p-3 bg-sky-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-sky-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-sky-700">{data.communityEngagement.totalLikes}</p>
                    <p className="text-xs text-muted">Likes</p>
                  </div>
                  <div className="text-center p-3 bg-soil-50 rounded-lg">
                    <Eye className="h-5 w-5 text-soil-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-soil-700">{data.communityEngagement.totalViews}</p>
                    <p className="text-xs text-muted">Views</p>
                  </div>
                </div>

                <div className="p-3 bg-sunken rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-strong">Engagement Rate</span>
                    <span className="text-lg font-bold text-leaf-700">{data.communityEngagement.engagementRate}%</span>
                  </div>
                  <div className="mt-2 bg-canvas rounded-full h-2">
                    <div
                      className="bg-leaf-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, data.communityEngagement.engagementRate)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Market Insights */}
        <Card>
          <SectionTitle icon={<DollarSign className="h-4 w-4 text-leaf-600" />}>
            Market Insights &amp; Profitability
          </SectionTitle>

          {!data.dataAvailable.market ? (
            <EmptyState
              icon={<DollarSign className="w-7 h-7" />}
              title="No market data"
              description="Live market prices will appear here when the data source is configured."
              action={
                <Button size="sm" variant="primary" onClick={() => navigate('/market-prices')}>
                  Open market prices
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-leaf-50 rounded-lg">
                <h3 className="font-medium text-strong mb-2">Price Trends</h3>
                <div className="flex items-center gap-2">
                  {getTrendIcon(data.marketInsights.pricesTrend)}
                  <span className="font-semibold text-strong capitalize">{data.marketInsights.pricesTrend}</span>
                </div>
              </div>

              <div className="p-4 bg-soil-50 rounded-lg">
                <h3 className="font-medium text-strong mb-2">Profit Margin</h3>
                <p className="text-2xl font-bold text-soil-700">
                  {data.marketInsights.profitMargin !== null ? `${data.marketInsights.profitMargin}%` : '—'}
                </p>
              </div>

              <div className="p-4 bg-harvest-50 rounded-lg">
                <h3 className="font-medium text-strong mb-2">Top Performing Crop</h3>
                <p className="text-xl font-bold text-harvest-700">{data.marketInsights.topCrop ?? '—'}</p>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center text-sm text-muted">
          <p>Analytics refresh on demand — click Refresh to fetch the latest data.</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
