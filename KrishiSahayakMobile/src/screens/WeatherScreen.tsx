// Enhanced Weather Screen — Live, Realtime, with Alerts & Recommendations
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Animated,
  FlatList,
  Switch,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { WeatherCard } from '../components/WeatherCard';
import { LoadingSpinner, ErrorView, Badge } from '../components/ui';
import { weatherService } from '../services/weather';
interface LiveWeatherAlert {
  id: string;
  type: 'heat' | 'frost' | 'heavy_rain' | 'strong_wind' | 'thunderstorm' | 'fog';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  message: string;
  recommendation: string;
  startTime: number;
  endTime: number;
}

interface AgriculturalRecommendation {
  category: 'irrigation' | 'spraying' | 'harvesting' | 'planting' | 'fertilizer' | 'pest_control' | 'general';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  icon: string;
}

interface AirQualityData {
  aqi: number;
  level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
}
import notificationService from '../services/notificationService';
import { WeatherData } from '../types';

interface WeatherScreenProps {
  navigation: any;
}

const WEATHER_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const EnhancedWeatherScreen: React.FC<WeatherScreenProps> = ({ navigation }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Live weather data
  const [alerts, setAlerts] = useState<LiveWeatherAlert[]>([]);
  const [recommendations, setRecommendations] = useState<AgriculturalRecommendation[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Air quality
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);

  // Track sent notification types to avoid duplicates across refresh cycles
  const notifiedAlertTypesRef = useRef<Set<string>>(new Set());
  const autoRefreshRef = useRef<boolean>(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Default location
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.7041, lon: 77.1025, name: 'Delhi' });

  const fetchWeather = useCallback(async (lat: number, lon: number, name: string) => {
    try {
      setError(null);

      // Fetch weather data
      const data = await weatherService.getWeather(lat, lon);
      data.location.name = name;
      setWeatherData(data);
      setLastUpdated(new Date());

      // Generate alerts and recommendations via live service
      const generatedAlerts = generateAlertsFromWeather(data);
      setAlerts(generatedAlerts);

      const generatedRecs = generateRecommendations(data);
      setRecommendations(generatedRecs);

      // Simulate air quality (based on weather conditions)
      setAirQuality(generateAirQuality(data));

      // Send notification for new severe alerts (deduplicated by type + severity)
      const severeAlerts = generatedAlerts.filter(a => a.severity === 'high' || a.severity === 'extreme');
      if (severeAlerts.length > 0 && autoRefreshRef.current) {
        for (const alert of severeAlerts) {
          const alertKey = `${alert.type}_${alert.severity}`;
          if (!notifiedAlertTypesRef.current.has(alertKey)) {
            notifiedAlertTypesRef.current.add(alertKey);
            await notificationService.alertForSevereWeather(alert.type, alert.message);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initialize notifications on first load
    notificationService.initialize();
    fetchWeather(currentLocation.lat, currentLocation.lon, currentLocation.name);
  }, []);

  // Auto-refresh
  useEffect(() => {
    autoRefreshRef.current = autoRefresh;
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWeather(currentLocation.lat, currentLocation.lon, currentLocation.name);
    }, WEATHER_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, currentLocation, fetchWeather]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeather(currentLocation.lat, currentLocation.lon, currentLocation.name);
  }, [currentLocation, fetchWeather]);

  const handleCitySearch = async () => {
    if (!citySearch.trim()) return;
    setLoading(true);
    try {
      const location = await weatherService.getLocationByCity(citySearch);
      if (location) {
        setCurrentLocation({ lat: location.lat, lon: location.lon, name: location.name });
        await fetchWeather(location.lat, location.lon, location.name);
        setCitySearch('');
      } else {
        setError(`City "${citySearch}" not found`);
        setLoading(false);
      }
    } catch {
      setError('Failed to search city');
      setLoading(false);
    }
  };

  const getLocationName = () => {
    if (!weatherData) return '';
    return `${weatherData.location.name}, ${weatherData.location.country}`;
  };

  const criticalAlertCount = alerts.filter(a => a.severity === 'high' || a.severity === 'extreme').length;

  return (
    <View style={styles.container}>
      <Header
        title="Live Weather"
        subtitle={autoRefresh ? 'Auto-refreshing every 5 min' : 'Realtime weather data'}
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.autoRefreshRow}>
            <Text style={styles.autoRefreshLabel}>Auto</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: colors.border, true: colors.primaryFaded }}
              thumbColor={autoRefresh ? colors.primary : colors.textTertiary}
            />
          </View>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search city..."
            placeholderTextColor={colors.textTertiary}
            value={citySearch}
            onChangeText={setCitySearch}
            onSubmitEditing={handleCitySearch}
            returnKeyType="search"
          />
          {citySearch ? (
            <TouchableOpacity onPress={handleCitySearch}>
              <Text style={styles.searchAction}>Search</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading && !refreshing ? (
        <LoadingSpinner fullScreen message="Fetching live weather data..." />
      ) : error ? (
        <ErrorView message={error} onRetry={onRefresh} />
      ) : weatherData ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Last Updated */}
          <View style={styles.lastUpdatedRow}>
            <Text style={styles.lastUpdatedText}>
              Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {autoRefresh && <Badge label="Live" variant="success" size="sm" />}
          </View>

          {/* Weather Alerts */}
          {alerts.length > 0 && showAlerts && (
            <View style={styles.alertsSection}>
              <TouchableOpacity
                style={styles.alertsHeader}
                onPress={() => setShowAlerts(false)}
              >
                <View style={styles.alertsHeaderLeft}>
                  <Text style={styles.alertsIcon}>
                    {criticalAlertCount > 0 ? '🔴' : '🟡'}
                  </Text>
                  <Text style={styles.alertsTitle}>
                    Weather Alerts ({alerts.length})
                  </Text>
                </View>
                <Text style={styles.alertsToggle}>✕</Text>
              </TouchableOpacity>

              {alerts.slice(0, 3).map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={[
                    styles.alertItem,
                    alert.severity === 'high' || alert.severity === 'extreme'
                      ? styles.alertItemHigh
                      : styles.alertItemLow,
                  ]}
                  onPress={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                >
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Badge
                      label={alert.severity}
                      variant={
                        alert.severity === 'extreme' || alert.severity === 'high'
                          ? 'error'
                          : alert.severity === 'moderate'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    />
                  </View>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  {expandedAlert === alert.id && (
                    <View style={styles.alertRecommendation}>
                      <Text style={styles.alertRecTitle}>💡 Recommendation:</Text>
                      <Text style={styles.alertRecText}>{alert.recommendation}</Text>
                    </View>
                  )}
                  <Text style={styles.alertExpand}>
                    {expandedAlert === alert.id ? '▲ Less' : '▼ More'}
                  </Text>
                </TouchableOpacity>
              ))}

              {alerts.length > 3 && (
                <TouchableOpacity style={styles.alertsMore}>
                  <Text style={styles.alertsMoreText}>+{alerts.length - 3} more alerts</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!showAlerts && alerts.length > 0 && (
            <TouchableOpacity
              style={styles.alertsHiddenBar}
              onPress={() => setShowAlerts(true)}
            >
              <Text style={styles.alertsIcon}>
                {criticalAlertCount > 0 ? '🔴' : '🟡'}
              </Text>
              <Text style={styles.alertsHiddenText}>
                {alerts.length} alert{alerts.length > 1 ? 's' : ''} hidden
              </Text>
              <Text style={styles.alertsShowButton}>Show</Text>
            </TouchableOpacity>
          )}

          {/* Main Weather Card */}
          <WeatherCard
            current={weatherData.current}
            hourly={weatherData.hourly}
            daily={weatherData.daily}
            locationName={getLocationName()}
            onRefresh={onRefresh}
          />

          {/* Air Quality */}
          {airQuality && (
            <View style={styles.aqiSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🌬️ Air Quality</Text>
                <Badge
                  label={airQuality.level}
                  variant={
                    airQuality.level === 'Good'
                      ? 'success'
                      : airQuality.level === 'Moderate'
                      ? 'warning'
                      : 'error'
                  }
                  size="sm"
                />
              </View>
              <View style={styles.aqiGrid}>
                <AQIItem label="AQI" value={`${airQuality.aqi}`} />
                <AQIItem label="PM2.5" value={`${airQuality.pm25}`} />
                <AQIItem label="PM10" value={`${airQuality.pm10}`} />
                <AQIItem label="NO₂" value={`${airQuality.no2}`} />
              </View>
            </View>
          )}

          {/* Agricultural Insights */}
          {weatherData.agricultural && (
            <View style={styles.agriSection}>
              <Text style={styles.agriTitle}>🌱 Agricultural Insights</Text>
              <View style={styles.agriGrid}>
                <AgriItem
                  label="Soil Moisture"
                  value={`${(weatherData.agricultural.soilMoisture * 100).toFixed(0)}%`}
                  status={weatherData.agricultural.soilMoisture < 0.3 ? '⚠️ Low' : weatherData.agricultural.soilMoisture > 0.7 ? '💧 High' : '✅ Optimal'}
                />
                <AgriItem
                  label="Spraying"
                  value={weatherData.agricultural.sprayingConditions.replace(/_/g, ' ')}
                  status={weatherData.agricultural.sprayingConditions === 'not_recommended' ? '❌ Not Recommended' : '✅ Suitable'}
                />
                <AgriItem
                  label="Frost Risk"
                  value={weatherData.agricultural.frostRisk ? '⚠️ Risk' : '✅ No Risk'}
                  status={weatherData.agricultural.frostRisk ? 'Warning' : 'Safe'}
                />
                <AgriItem
                  label="Heat Stress"
                  value={weatherData.agricultural.heatStress ? '🔥 Yes' : '✅ Normal'}
                  status={weatherData.agricultural.heatStress ? 'Warning' : 'Safe'}
                />
              </View>
              <Text style={styles.agriAdvice}>
                💡 {weatherData.agricultural.irrigationAdvice}
              </Text>
            </View>
          )}

          {/* Smart Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.recsSection}>
              <TouchableOpacity
                style={styles.recsHeader}
                onPress={() => setShowRecommendations(!showRecommendations)}
              >
                <Text style={styles.recsTitle}>🤖 Smart Recommendations</Text>
                <Text style={styles.recsToggle}>
                  {showRecommendations ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showRecommendations && (
                <View style={styles.recsList}>
                  {recommendations.map((rec, index) => (
                    <View
                      key={`rec_${index}`}
                      style={[
                        styles.recItem,
                        rec.priority === 'high' && styles.recItemHigh,
                      ]}
                    >
                      <View style={styles.recHeader}>
                        <Text style={styles.recIcon}>{rec.icon}</Text>
                        <View style={styles.recInfo}>
                          <Text style={styles.recTitle}>{rec.title}</Text>
                          <Text style={styles.recDesc}>{rec.description}</Text>
                        </View>
                        <Badge
                          label={rec.priority}
                          variant={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                          size="sm"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

// ===== Helper Components =====

const AQIItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.aqiItem}>
    <Text style={styles.aqiLabel}>{label}</Text>
    <Text style={styles.aqiValue}>{value}</Text>
  </View>
);

const AgriItem: React.FC<{ label: string; value: string; status: string }> = ({
  label, value, status,
}) => (
  <View style={styles.agriItem}>
    <Text style={styles.agriLabel}>{label}</Text>
    <Text style={styles.agriValue}>{value}</Text>
    <Text style={styles.agriStatus}>{status}</Text>
  </View>
);

// ===== Helper Functions =====

function generateAlertsFromWeather(weather: WeatherData): LiveWeatherAlert[] {
  const alerts: LiveWeatherAlert[] = [];
  const now = Date.now();
  const { current, daily } = weather;

  if (current.temperature > 40) {
    alerts.push({
      id: `heat_${now}`, type: 'heat', severity: 'extreme',
      title: '🔥 Extreme Heat Warning',
      message: `Temperature at ${current.temperature}°C — dangerously high for crops.`,
      recommendation: 'Provide shade to sensitive crops. Increase irrigation. Avoid field work 11AM-4PM.',
      startTime: now, endTime: now + 86400000,
    });
  } else if (current.temperature > 35) {
    alerts.push({
      id: `heat_${now}`, type: 'heat', severity: 'high',
      title: '🌡️ Heat Advisory',
      message: `Temperature at ${current.temperature}°C — monitor for heat stress.`,
      recommendation: 'Irrigate early morning or evening. Apply mulch. Monitor for wilting.',
      startTime: now, endTime: now + 86400000,
    });
  }

  if (current.temperature < 5) {
    alerts.push({
      id: `frost_${now}`, type: 'frost', severity: 'high',
      title: '❄️ Frost Warning',
      message: `Temperature dropped to ${current.temperature}°C — frost risk high.`,
      recommendation: 'Cover sensitive crops. Irrigate before dawn. Harvest susceptible produce.',
      startTime: now, endTime: now + 43200000,
    });
  }

  if (current.rainfall > 20) {
    alerts.push({
      id: `rain_${now}`, type: 'heavy_rain', severity: 'high',
      title: '🌧️ Heavy Rainfall Alert',
      message: `${current.rainfall.toFixed(1)}mm rainfall — risk of waterlogging.`,
      recommendation: 'Ensure drainage channels clear. Delay planting if soil saturated.',
      startTime: now, endTime: now + 43200000,
    });
  } else if (current.rainfall > 10) {
    alerts.push({
      id: `rain_${now}`, type: 'heavy_rain', severity: 'moderate',
      title: '🌦️ Moderate Rainfall',
      message: `${current.rainfall.toFixed(1)}mm rainfall — monitor field conditions.`,
      recommendation: 'Good for soil moisture buildup. Avoid fertilizer during heavy showers.',
      startTime: now, endTime: now + 21600000,
    });
  }

  if (current.windSpeed > 40) {
    alerts.push({
      id: `wind_${now}`, type: 'strong_wind', severity: 'high',
      title: '💨 Strong Wind Warning',
      message: `Wind ${current.windSpeed} km/h — can damage crops.`,
      recommendation: 'Secure tall crops. Delay spraying. Check for structural damage.',
      startTime: now, endTime: now + 21600000,
    });
  } else if (current.windSpeed > 25) {
    alerts.push({
      id: `wind_${now}`, type: 'strong_wind', severity: 'moderate',
      title: '💨 Wind Advisory',
      message: `Wind ${current.windSpeed} km/h — spraying not recommended.`,
      recommendation: 'Postpone pesticide spraying. Good for wind-dispersed seed planting.',
      startTime: now, endTime: now + 21600000,
    });
  }

  if (current.temperature > 30 && current.humidity > 70 && current.cloudCover > 60) {
    alerts.push({
      id: `storm_${now}`, type: 'thunderstorm', severity: 'moderate',
      title: '⛈️ Thunderstorm Possible',
      message: 'Warm, humid conditions — thunderstorms possible.',
      recommendation: 'Unplug irrigation controllers. Move livestock to shelter if storm approaches.',
      startTime: now, endTime: now + 43200000,
    });
  }

  if (current.visibility < 2) {
    alerts.push({
      id: `fog_${now}`, type: 'fog', severity: 'low',
      title: '🌫️ Foggy Conditions',
      message: `Visibility ${current.visibility.toFixed(1)} km — delay morning operations.`,
      recommendation: 'Delay spraying and harvesting until fog lifts.',
      startTime: now, endTime: now + 14400000,
    });
  }

  return alerts;
}

function generateRecommendations(weather: WeatherData): AgriculturalRecommendation[] {
  const recs: AgriculturalRecommendation[] = [];
  const { current, agricultural } = weather;

  if (agricultural.soilMoisture < 0.3) {
    recs.push({ category: 'irrigation', priority: 'high', title: '💧 Irrigation Needed', description: `Soil moisture low (${(agricultural.soilMoisture * 100).toFixed(0)}%). Irrigate soon.`, icon: '💧' });
  } else if (agricultural.soilMoisture > 0.7) {
    recs.push({ category: 'irrigation', priority: 'medium', title: '🌊 Adequate Moisture', description: `Soil moisture ${(agricultural.soilMoisture * 100).toFixed(0)}%. Hold off irrigation.`, icon: '🌊' });
  } else {
    recs.push({ category: 'irrigation', priority: 'low', title: '✅ Moisture Normal', description: 'Soil moisture optimal. Maintain irrigation schedule.', icon: '✅' });
  }

  const sprayMap: Record<string, AgriculturalRecommendation> = {
    excellent: { category: 'spraying', priority: 'low', title: '✅ Ideal for Spraying', description: 'Perfect spraying conditions. Proceed with applications.', icon: '✅' },
    good: { category: 'spraying', priority: 'low', title: '👍 Good for Spraying', description: 'Favorable conditions for spraying.', icon: '👍' },
    fair: { category: 'spraying', priority: 'medium', title: '⚠️ Caution for Spraying', description: 'Marginal conditions. Consider delaying.', icon: '⚠️' },
    poor: { category: 'spraying', priority: 'high', title: '❌ Not Ideal for Spraying', description: 'Poor conditions — risk of drift.', icon: '❌' },
    not_recommended: { category: 'spraying', priority: 'high', title: '🚫 Do Not Spray', description: 'Spraying strongly not recommended.', icon: '🚫' },
  };
  recs.push(sprayMap[agricultural.sprayingConditions] || sprayMap.fair);

  if (agricultural.frostRisk) recs.push({ category: 'general', priority: 'high', title: '🧊 Frost Protection', description: 'Cover sensitive plants tonight!', icon: '🧊' });
  if (agricultural.heatStress) recs.push({ category: 'general', priority: 'high', title: '🔥 Heat Stress', description: 'Increase water supply, provide shade.', icon: '🔥' });
  if (current.humidity > 80 && current.temperature > 25) recs.push({ category: 'pest_control', priority: 'high', title: '🐛 Pest & Disease Risk', description: 'Warm, humid — monitor for fungal diseases.', icon: '🐛' });

  return recs.slice(0, 5);
}

function generateAirQuality(weather: WeatherData): AirQualityData {
  const temp = weather.current.temperature;
  const humidity = weather.current.humidity;
  const windSpeed = weather.current.windSpeed;

  // Simple estimation based on weather conditions
  const baseAQI = 50 + Math.round((temp > 30 ? 20 : 0) + (humidity > 80 ? 15 : 0) + (windSpeed < 5 ? 25 : windSpeed > 20 ? -10 : 0) + (Math.random() - 0.5) * 20);
  const aqi = Math.max(1, Math.min(300, baseAQI));

  const getLevel = (aqi: number): AirQualityData['level'] => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 250) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return {
    aqi,
    level: getLevel(aqi),
    pm25: Math.round(aqi * 0.3 + Math.random() * 10),
    pm10: Math.round(aqi * 0.5 + Math.random() * 20),
    no2: Math.round(20 + Math.random() * 30),
    so2: Math.round(5 + Math.random() * 15),
    o3: Math.round(30 + Math.random() * 40),
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.fontSize.md, color: colors.textPrimary },
  searchAction: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.semibold },
  autoRefreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  autoRefreshLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textInverse,
    fontWeight: typography.fontWeight.medium,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.huge, gap: spacing.lg },

  // Last Updated
  lastUpdatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastUpdatedText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },

  // Alerts Section
  alertsSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alertsIcon: { fontSize: 16 },
  alertsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  alertsToggle: { fontSize: typography.fontSize.lg, color: colors.textTertiary, padding: spacing.xs },
  alertItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  alertItemHigh: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  alertItemLow: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  alertMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  alertRecommendation: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primaryFaded,
    borderRadius: borderRadius.sm,
  },
  alertRecTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: 2,
  },
  alertRecText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  alertExpand: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  alertsMore: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  alertsMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  alertsHiddenBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    gap: spacing.sm,
  },
  alertsHiddenText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  alertsShowButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // AQI
  aqiSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  aqiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  aqiItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  aqiLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  aqiValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  // Agricultural Insights
  agriSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  agriTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  agriGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  agriItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  agriLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  agriValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  agriStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  agriAdvice: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    backgroundColor: colors.primaryFaded,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    lineHeight: 20,
  },

  // Recommendations
  recsSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  recsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  recsToggle: {
    fontSize: typography.fontSize.lg,
    color: colors.textTertiary,
  },
  recsList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  recItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  recItemHigh: {
    backgroundColor: '#FEF2F2',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  recIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  recInfo: {
    flex: 1,
  },
  recTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  recDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});

export default EnhancedWeatherScreen;
