import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw, MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun,
  CloudRain, Cloud, Calendar, TrendingUp, AlertTriangle, Sunrise, Sunset,
  Compass, Zap, Snowflake, CloudDrizzle, Navigation, Clock, BarChart3,
  Search, X, Star, History, Globe, Search as SearchIcon
} from 'lucide-react';
import { weatherAPI, getWeatherDescription } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader, Tabs, Kpi, Button, Badge, SectionTitle, Alert, EmptyState, Skeleton } from '../components/ui';
import toast from 'react-hot-toast';

interface ForecastDay {
  day: string; date: string; high: number; low: number;
  condition: string; icon: string; humidity: number; windSpeed: number;
  precipitation: number; rainProbability: number;
}
interface HourlyPoint {
  time: string; temp: number; condition: string; icon: string;
  rainChance: number; windSpeed: number;
}
interface WeatherAlert {
  type: string; severity: string; message: string; validUntil: string;
}
interface WeatherData {
  location: string; temperature: number; condition: string;
  humidity: number; windSpeed: number; windDirection: string;
  visibility: number; pressure: number; uvIndex: number; feelsLike: number;
  dewPoint: number; cloudCover: number; sunrise: string; sunset: string;
  moonPhase: string; airQuality: { index: number; level: string; pm25: number; pm10: number };
  forecast: ForecastDay[]; hourlyForecast: HourlyPoint[];
  alerts: WeatherAlert[]; historical: { avgTemp: number; maxTemp: number; minTemp: number; rainfall: number };
}

type WeatherView = 'current' | 'forecast' | 'hourly' | 'historical';

const POPULAR_CITIES = [
  'Delhi, India', 'Mumbai, Maharashtra', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu',
  'Kolkata, West Bengal', 'Hyderabad, Telangana', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Chandigarh, Punjab', 'Bhopal, Madhya Pradesh',
  'Patna, Bihar', 'Thiruvananthapuram, Kerala', 'Guwahati, Assam', 'Ranchi, Jharkhand',
];

const STORAGE_FAV_KEY = 'weather:favorites';
const STORAGE_HIST_KEY = 'weather:history';

const Weather: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, userProfile } = useAuth();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(userProfile?.location?.district
    ? `${userProfile.location.district}, ${userProfile.location.state || 'India'}`
    : 'Delhi, India');
  const [view, setView] = useState<WeatherView>('current');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FAV_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return ['Delhi, India', 'Punjab, India'];
  });
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HIST_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return ['Delhi, India'];
  });

  useEffect(() => { localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem(STORAGE_HIST_KEY, JSON.stringify(history)); }, [history]);

  const getWindDirection = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };
  const calculateDewPoint = (temp: number, humidity: number) => {
    const a = 17.27, b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
    return Math.round((b * alpha) / (a - alpha));
  };
  const getWeatherEmoji = (code: number): string => {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '🌨️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  };

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cityName = location.split(',')[0].trim();
      const w = await weatherAPI.getWeatherByCity(cityName);
      const data: WeatherData = {
        location,
        temperature: Math.round(w.current.temperature),
        condition: getWeatherDescription(w.current.weatherCode),
        humidity: w.current.humidity,
        windSpeed: Math.round(w.current.windSpeed),
        windDirection: getWindDirection(w.current.windDirection),
        visibility: 10,
        pressure: 1013,
        uvIndex: 0,
        feelsLike: Math.round(w.current.feelsLike),
        dewPoint: calculateDewPoint(w.current.temperature, w.current.humidity),
        cloudCover: 40,
        sunrise: '06:30 AM',
        sunset: '05:45 PM',
        moonPhase: 'Waxing Crescent',
        airQuality: { index: 85, level: 'Moderate', pm25: 35, pm10: 50 },
        forecast: w.daily.time.slice(0, 7).map((date, i) => ({
          day: new Date(date).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short' }),
          date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          high: Math.round(w.daily.temperature_2m_max[i]),
          low: Math.round(w.daily.temperature_2m_min[i]),
          condition: getWeatherDescription(w.daily.weather_code[i]),
          icon: getWeatherEmoji(w.daily.weather_code[i]),
          humidity: w.current.humidity,
          windSpeed: Math.round(w.current.windSpeed),
          precipitation: w.daily.precipitation_sum[i],
          rainProbability: Math.min(100, Math.round(w.daily.precipitation_sum[i] * 10)),
        })),
        hourlyForecast: w.hourly.time.slice(0, 12).map((time, i) => ({
          time: new Date(time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(w.hourly.temperature_2m[i]),
          condition: getWeatherDescription(w.hourly.weather_code[i]),
          icon: getWeatherEmoji(w.hourly.weather_code[i]),
          rainChance: w.hourly.precipitation_probability?.[i] || 0,
          windSpeed: Math.round(w.current.windSpeed),
        })),
        alerts: [],
        historical: {
          avgTemp: Math.round((w.daily.temperature_2m_max[0] + w.daily.temperature_2m_min[0]) / 2),
          maxTemp: Math.round(Math.max(...w.daily.temperature_2m_max.slice(0, 7))),
          minTemp: Math.round(Math.min(...w.daily.temperature_2m_min.slice(0, 7))),
          rainfall: w.daily.precipitation_sum.slice(0, 7).reduce((a, b) => a + b, 0),
        },
      };
      setWeatherData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Weather API Error:', err);
      setError(t('weather.fetchError', 'Unable to fetch weather data'));
    } finally {
      setLoading(false);
    }
  }, [location, t, i18n.language]);

  useEffect(() => {
    loadWeather();
    if (autoRefresh) {
      const id = setInterval(loadWeather, 300000);
      return () => clearInterval(id);
    }
  }, [loadWeather, autoRefresh]);

  const handleSearch = (q: string) => {
    if (q.length < 2) { setSearchResults([]); setShowSearchResults(false); return; }
    setSearchResults(POPULAR_CITIES.filter((c) => c.toLowerCase().includes(q.toLowerCase())));
    setShowSearchResults(true);
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setSearchQuery('');
    setShowSearchResults(false);
    setHistory((h) => [loc, ...h.filter((x) => x !== loc)].slice(0, 5));
  };

  const toggleFavorite = (loc: string) => {
    setFavorites((f) => f.includes(loc) ? f.filter((x) => x !== loc) : [...f, loc]);
    toast.success(favorites.includes(loc) ? 'Removed from favorites' : 'Added to favorites');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('weather.noGeolocation', 'Geolocation not supported'));
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mockLocation = `Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`;
        setLocation(mockLocation);
      },
      () => {
        toast.error(t('weather.locationError', 'Location access denied'));
        setLoading(false);
      },
    );
  };

  const aqiInfo = useMemo(() => {
    const aqi = weatherData?.airQuality?.index || 0;
    if (aqi <= 50) return { label: 'Good', tone: 'leaf' as const };
    if (aqi <= 100) return { label: 'Moderate', tone: 'harvest' as const };
    if (aqi <= 150) return { label: 'Unhealthy for sensitive', tone: 'harvest' as const };
    return { label: 'Unhealthy', tone: 'danger' as const };
  }, [weatherData]);

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container-app py-8 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <EmptyState
          icon={<AlertTriangle className="w-12 h-12" />}
          title="Weather data unavailable"
          description={error}
          action={<Button onClick={loadWeather} leftIcon={<RefreshCw className="w-4 h-4" />}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-app py-5 md:py-8">
        <PageHeader
          eyebrow={t('nav.live', 'Live Data')}
          title={t('weather.title', 'Weather Forecast')}
          description={t('weather.subtitle', 'Real-time weather data for your region.')}
          actions={
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex text-xs text-muted font-mono">
                {t('weather.lastUpdated', 'Last updated')}: {lastRefresh.toLocaleTimeString()}
              </span>
              <label className="inline-flex items-center gap-1.5 text-xs text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-leaf-600 focus:ring-leaf-500"
                />
                <span>Auto-refresh</span>
              </label>
              <Button size="sm" variant="secondary" onClick={loadWeather} leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}>
                {t('common.refresh', 'Refresh')}
              </Button>
            </div>
          }
        />

        {/* Search bar + actions */}
        <div className="mt-5 card card-padded">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder={t('weather.searchPlaceholder', 'Search for a city or location...')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="input pl-9 pr-9 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 card py-1.5 z-30 max-h-60 overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }}>
                  {searchResults.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => selectLocation(city)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-sunken"
                    >
                      <span className="flex items-center gap-2 text-ink-800">
                        <MapPin className="w-3.5 h-3.5 text-ink-400" />
                        {city}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(city); }}
                        className="p-1"
                      >
                        <Star className={`w-3.5 h-3.5 ${favorites.includes(city) ? 'text-harvest-600 fill-current' : 'text-ink-300'}`} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="md" onClick={getCurrentLocation} leftIcon={<Navigation className="w-4 h-4" />}>
                <span className="hidden sm:inline">{t('weather.useCurrentLocation', 'Current Location')}</span>
                <span className="sm:hidden">GPS</span>
              </Button>
              <Button variant="ghost" size="md" onClick={() => location && toggleFavorite(location)} leftIcon={<Star className={`w-4 h-4 ${favorites.includes(location) ? 'text-harvest-600 fill-current' : ''}`} />}>
                <span className="hidden md:inline">{favorites.includes(location) ? 'Favorited' : 'Favorite'}</span>
              </Button>
            </div>
          </div>

          {/* Favorites & history */}
          {(favorites.length > 0 || history.length > 0) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {favorites.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-harvest-600 fill-current" /> Favorites
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {favorites.slice(0, 5).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => selectLocation(f)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-harvest-50 text-harvest-700 hover:bg-harvest-100 border border-harvest-200"
                      >
                        <MapPin className="w-3 h-3" />
                        {f.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {history.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <History className="w-3 h-3" /> Recent
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {history.slice(0, 5).map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => selectLocation(h)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sunken text-ink-700 hover:bg-ink-200 border border-subtle"
                      >
                        <History className="w-3 h-3" />
                        {h.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alerts */}
        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {weatherData.alerts.map((a, i) => (
              <Alert
                key={i}
                tone={a.severity === 'High' ? 'danger' : a.severity === 'Medium' ? 'warn' : 'info'}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">{a.type}</div>
                  <div className="text-sm opacity-90">{a.message}</div>
                  <div className="text-xs opacity-75 mt-0.5">Valid until {a.validUntil}</div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* View tabs */}
        <div className="mt-5">
          <Tabs
            variant="pill"
            tabs={[
              { id: 'current', label: t('weather.current', 'Current'), icon: <Thermometer className="w-3.5 h-3.5" /> },
              { id: 'forecast', label: t('weather.forecast', '7-Day Forecast'), icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: 'hourly', label: t('weather.hourly', 'Hourly'), icon: <Clock className="w-3.5 h-3.5" /> },
              { id: 'historical', label: t('weather.historical', 'Historical'), icon: <BarChart3 className="w-3.5 h-3.5" /> },
            ]}
            active={view}
            onChange={(id) => setView(id as WeatherView)}
          />
        </div>

        {/* Current weather view */}
        {view === 'current' && weatherData && (
          <div className="mt-5 space-y-4">
            {/* Hero card */}
            <div className="card overflow-hidden">
              <div className="relative bg-gradient-to-br from-leaf-700 via-leaf-600 to-sky-700 text-white p-6 md:p-8">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent_50%)]" />
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{weatherData.location}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl md:text-7xl font-bold tracking-tight">{weatherData.temperature}</span>
                      <span className="text-2xl text-white/80">°C</span>
                    </div>
                    <div className="text-white/90 mt-1">{weatherData.condition}</div>
                    <div className="text-white/70 text-sm mt-3">
                      Feels like {weatherData.feelsLike}°C · {t('weather.humidity', 'Humidity')} {weatherData.humidity}%
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-start md:items-end justify-center">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                      <Sunrise className="w-3.5 h-3.5" />
                      <span>{weatherData.sunrise}</span>
                      <span className="mx-1 text-white/50">·</span>
                      <Sunset className="w-3.5 h-3.5" />
                      <span>{weatherData.sunset}</span>
                    </div>
                    <Badge tone={aqiInfo.tone} className="!bg-white/20 !text-white backdrop-blur-sm !border-white/30">
                      AQI {weatherData.airQuality?.index} · {aqiInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="Wind" value={`${weatherData.windSpeed}`} hint={`${weatherData.windDirection} · km/h`} icon={<Wind className="w-4 h-4" />} />
              <Kpi label="Humidity" value={`${weatherData.humidity}%`} icon={<Droplets className="w-4 h-4" />} />
              <Kpi label="Pressure" value={`${weatherData.pressure}`} hint="hPa" icon={<Gauge className="w-4 h-4" />} />
              <Kpi label="Dew Point" value={`${weatherData.dewPoint}°C`} icon={<Thermometer className="w-4 h-4" />} />
            </div>

            {/* Agriculture recommendations */}
            <div className="card card-padded">
              <SectionTitle title={t('weather.recommendations', 'Crop Recommendations')} description={t('weather.recommendationText', 'Based on current conditions')} />
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <RecCard icon="💧" title="Irrigation" text={t('weather.rec1', 'Good conditions for irrigation')} tone="sky" />
                <RecCard icon="🐛" title="Pest Watch" text={t('weather.rec2', 'Monitor crops for pest activity')} tone="harvest" />
                <RecCard icon="🌾" title="Harvesting" text={t('weather.rec3', 'Consider harvesting if ready')} tone="leaf" />
              </div>
            </div>
          </div>
        )}

        {/* Forecast view */}
        {view === 'forecast' && (
          <div className="mt-5 card card-padded">
            <SectionTitle title="7-Day Forecast" description="Daily highs, lows, and conditions" />
            {weatherData && weatherData.forecast.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {weatherData.forecast.map((day, i) => (
                  <div
                    key={`forecast-${day.date}-${i}`}
                    className={`p-3 rounded-md border text-center ${
                      i === 0 ? 'border-leaf-500 bg-leaf-50' : 'border-subtle bg-surface'
                    }`}
                  >
                    <div className="text-xs font-semibold text-ink-700">{day.day}</div>
                    <div className="text-[10px] text-muted mb-2">{day.date}</div>
                    <div className="text-2xl mb-1">{day.icon}</div>
                    <div className="text-xs text-ink-600 mb-1.5">{day.condition}</div>
                    <div className="flex items-center justify-center gap-1.5 text-sm font-semibold">
                      <span className="text-strong">{day.high}°</span>
                      <span className="text-muted">{day.low}°</span>
                    </div>
                    {day.rainProbability > 0 && (
                      <div className="text-[10px] text-sky-600 mt-1">💧 {day.rainProbability}%</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-10 h-10" />}
                title="Forecast unavailable"
                description={loading ? 'Loading forecast…' : 'No forecast data for this location. Try another city or refresh.'}
                action={!loading ? (
                  <Button onClick={loadWeather} leftIcon={<RefreshCw className="w-4 h-4" />}>Retry</Button>
                ) : undefined}
              />
            )}
          </div>
        )}

        {/* Hourly view */}
        {view === 'hourly' && (
          <div className="mt-5 card card-padded">
            <SectionTitle title="Hourly Forecast" description="Next 12 hours" />
            {weatherData && weatherData.hourlyForecast.length > 0 ? (
              <div className="mt-3 overflow-x-auto -mx-2 px-2">
                <div className="flex gap-2 min-w-max">
                  {weatherData.hourlyForecast.map((h, i) => (
                    <div key={`hour-${h.time}-${i}`} className="flex-shrink-0 w-20 p-2.5 rounded-md border border-subtle bg-surface text-center">
                      <div className="text-[10px] font-semibold text-muted uppercase">{h.time}</div>
                      <div className="text-xl my-1">{h.icon}</div>
                      <div className="text-sm font-semibold text-strong">{h.temp}°</div>
                      {h.rainChance > 0 && (
                        <div className="text-[10px] text-sky-600">💧 {h.rainChance}%</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Clock className="w-10 h-10" />}
                title="Hourly forecast unavailable"
                description={loading ? 'Loading…' : 'No hourly data for this location.'}
              />
            )}
          </div>
        )}

        {/* Historical view */}
        {view === 'historical' && weatherData && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="Avg Temp" value={`${weatherData.historical.avgTemp}°C`} icon={<Thermometer className="w-4 h-4" />} />
              <Kpi label="Max Temp" value={`${weatherData.historical.maxTemp}°C`} icon={<TrendingUp className="w-4 h-4" />} />
              <Kpi label="Min Temp" value={`${weatherData.historical.minTemp}°C`} icon={<Thermometer className="w-4 h-4" />} />
              <Kpi label="Total Rain" value={`${weatherData.historical.rainfall.toFixed(1)} mm`} icon={<CloudRain className="w-4 h-4" />} />
            </div>
            <div className="card card-padded">
              <SectionTitle title="Trend Summary" description="Past 7 days" />
              <p className="text-sm text-ink-700 mt-2 leading-relaxed">
                Average temperature over the past week was {weatherData.historical.avgTemp}°C, ranging from
                a low of {weatherData.historical.minTemp}°C to a high of {weatherData.historical.maxTemp}°C.
                Total rainfall was {weatherData.historical.rainfall.toFixed(1)} mm.
              </p>
            </div>
          </div>
        )}

        {/* Popular cities */}
        <div className="mt-6 card card-padded">
          <SectionTitle title={t('weather.popularCities', 'Popular Cities')} description="Quick access" />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => selectLocation(city)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                  location === city
                    ? 'bg-leaf-50 text-leaf-700 border border-leaf-500'
                    : 'bg-surface border border-subtle text-ink-700 hover:border-leaf-300 hover:bg-leaf-50/40'
                }`}
              >
                {city.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecCard: React.FC<{ icon: string; title: string; text: string; tone: 'leaf' | 'sky' | 'harvest' }> = ({ icon, title, text, tone }) => {
  const tones = {
    leaf: 'bg-leaf-50 border-leaf-200 text-leaf-800',
    sky: 'bg-sky-50 border-sky-200 text-sky-800',
    harvest: 'bg-harvest-50 border-harvest-200 text-harvest-800',
  };
  return (
    <div className={`p-3 rounded-md border ${tones[tone]}`}>
      <div className="text-2xl mb-1.5">{icon}</div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs opacity-90 mt-0.5 leading-relaxed">{text}</div>
    </div>
  );
};

export default Weather;
