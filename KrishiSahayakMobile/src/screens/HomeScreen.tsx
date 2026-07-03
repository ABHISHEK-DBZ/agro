// Home / Dashboard Screen — Real-Time Data, Professional UI
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { Card, LoadingSpinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { weatherService } from '../services/weather';
import { marketService } from '../services/market';
import communityService from '../services/communityService';
import openRouterService from '../services/openRouterService';
import storageService from '../services/storage';
import { WeatherData, MarketPrice } from '../types';

interface DashboardScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, userProfile  } = useAuth();
  const { t, language } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const greetAnim = useRef(new Animated.Value(0)).current;

  // Animate in
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(greetAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    // Voice is handled by FloatingVoiceButton (visible on all screens)
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setError('');

      // Step 1: Immediately show cached market data (no await)
      try {
        const cached = await storageService.getItem<MarketPrice[]>('@krishi_market_cache_data');
        if (cached) setMarketPrices(cached);
      } catch {}

      // Step 2: Seed community data in background (don't await)
      communityService.seedInitialData();

      // Step 3: Get location & weather in parallel
      let lat = 28.6139, lon = 77.2090;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
          const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geocode.length > 0) {
            const addr = geocode[0];
            const parts = [addr.city || addr.district, addr.region, addr.country].filter(Boolean);
            setLocationName(parts.slice(0, 2).join(', '));
          } else {
            setLocationName('Current Location');
          }
        } else {
          setLocationName('Delhi (Location off)');
        }
      } catch {
        setLocationName('Getting location...');
      }

      // Step 4: Fetch weather & market in parallel (don't block UI)
      const dataPromise = Promise.all([
        weatherService.getWeather(lat, lon).catch(() => null),
        marketService.getPrices({ limit: 6 }).catch(() => [] as MarketPrice[]),
      ]);

      // Show UI immediately after location check (don't wait for data)
      setLoading(false);

      // Wait for data in background
      const [weatherData, prices] = await dataPromise;
      if (weatherData) {
        setWeather(weatherData);
        // Cache weather
        storageService.setItem('@krishi_weather_cache_data', weatherData);
        // Get AI insight in background
        try {
          const response = await openRouterService.chat(
            `Given weather: ${weatherData.current.temperature}°C, ${weatherData.current.condition.main}, humidity ${weatherData.current.humidity}%, rainfall ${weatherData.current.rainfall}mm. Give one actionable farming tip. Max 2 sentences.`,
            language,
          );
          setAiInsight(response.text);
        } catch {}
      }
      if (prices.length > 0) {
        setMarketPrices(prices);
        storageService.setItem('@krishi_market_cache_data', prices);
      }
    } catch (error) {
      console.error('[Dashboard] Load error:', error);
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // ── Quick Actions ──
  const quickActions = [
    { id: 'ai', icon: '🤖', label: t('nav.aiAssistant', 'AI Asst.'), color: '#7C3AED', screen: 'AiAssistant' },
    { id: 'weather', icon: '🌤️', label: t('nav.weather', 'Weather'), color: '#3B82F6', screen: 'Weather' },
    { id: 'market', icon: '💰', label: t('nav.market', 'Market'), color: '#059669', screen: 'MarketPrices' },
    { id: 'crops', icon: '🌾', label: t('nav.crops', 'Crops'), color: '#D97706', screen: 'CropInfo' },
    { id: 'disease', icon: '🔬', label: t('nav.diseaseDetection', 'Disease'), color: '#DC2626', screen: 'DiseaseDetection' },
    { id: 'schemes', icon: '🏛️', label: t('nav.schemes', 'Schemes'), color: '#7C3AED', screen: 'Schemes' },
    { id: 'soil', icon: '🌱', label: t('nav.soilTesting', 'Soil'), color: '#0891B2', screen: 'SoilTesting' },
    { id: 'groups', icon: '👥', label: t('nav.groups', 'Groups'), color: '#EC4899', screen: 'Groups' },
    { id: 'loan', icon: '💰', label: t('nav.loanCalc', 'Loan'), color: '#F59E0B', screen: 'LoanCalculator' },
    { id: 'notifs', icon: '🔔', label: t('nav.notifications', 'Notifs'), color: '#EF4444', screen: 'Notifications' },
  ];

  // ── Greeting ──
  const greeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.displayName ? `, ${userProfile.displayName.split(' ')[0]}` : '';
    if (hour < 12) return `${t('home.greeting.morning', 'Good Morning')}${name}! ☀️`;
    if (hour < 17) return `${t('home.greeting.afternoon', 'Good Afternoon')}${name}! 🌤️`;
    return `${t('home.greeting.evening', 'Good Evening')}${name}! 🌙`;
  };

  const weatherEmoji = (main?: string) => {
    switch (main) {
      case 'Clear': return '☀️';
      case 'Clouds': return '⛅';
      case 'Rain': case 'Drizzle': return '🌧️';
      case 'Thunderstorm': return '⛈️';
      case 'Snow': return '🌨️';
      case 'Fog': return '🌫️';
      default: return '🌤️';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={t('nav.home', 'Home')} showAppName />
        <LoadingSpinner fullScreen message={t('common.loading', 'Loading your dashboard...')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={t('nav.home', 'Home')}
        showAppName
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Greeting Card */}
        <Animated.View style={[styles.greetingCard, { opacity: greetAnim }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{greeting()}</Text>
            <Text style={styles.greetingSubtext}>
              {userProfile?.role === 'expert'
                ? t('profile.expert', '👨‍🔬 Agri Expert')
                : t('profile.farmer', '👨‍🌾 Farmer')}
            </Text>
            {locationName ? (
              <Text style={styles.locationText}>📍 {locationName}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.profileAvatar}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>
              {userProfile?.displayName?.charAt(0)?.toUpperCase() || '🌾'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Live Weather Card */}
        {weather && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.weatherCard}
              onPress={() => navigation.navigate('Weather')}
              activeOpacity={0.8}
            >
              <View style={styles.weatherHeader}>
                <Text style={styles.weatherTitle}>{t('home.todayWeather', "Today's Weather")}</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>{t('weather.live', 'LIVE')}</Text>
                </View>
              </View>
              <View style={styles.weatherMain}>
                <Text style={styles.weatherEmoji}>{weatherEmoji(weather.current.condition.main)}</Text>
                <View>
                  <Text style={styles.weatherTemp}>{weather.current.temperature}°C</Text>
                  <Text style={styles.weatherDesc}>{weather.current.condition.description || weather.current.condition.main}</Text>
                </View>
              </View>
              <View style={styles.weatherStats}>
                <WeatherStat icon="💧" value={`${weather.current.humidity}%`} label={t('home.stats.humidity', 'Humidity')} />
                <WeatherStat icon="💨" value={`${weather.current.windSpeed} km/h`} label={t('nav.weather', 'Wind')} />
                <WeatherStat icon="🌧️" value={`${weather.current.rainfall}mm`} label={t('home.stats.rainfall', 'Rain')} />
              </View>
              {/* Smart AI Insight */}
              {aiInsight ? (
                <View style={styles.insightBox}>
                  <Text style={styles.insightIcon}>🧠</Text>
                  <Text style={styles.insightText}>{aiInsight}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>{t('home.quickActions', 'Quick Actions')}</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Market Prices Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.marketPrices', 'Market Prices')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MarketPrices')}>
            <Text style={styles.seeAll}>{t('common.seeAll', 'See All')} →</Text>
          </TouchableOpacity>
        </View>

        {marketPrices.length > 0 ? (
          marketPrices.slice(0, 3).map((item, index) => (
            <Card key={index} style={styles.marketCard} onPress={() => navigation.navigate('MarketPrices')}>
              <View style={styles.marketCardContent}>
                <View style={styles.marketInfo}>
                  <Text style={styles.commodityName}>{item.commodity}</Text>
                  <Text style={styles.marketLocation}>{item.market}, {item.state}</Text>
                </View>
                <View style={styles.priceSection}>
                  <Text style={styles.priceValue}>₹{item.price.modal.toLocaleString()}</Text>
                  <Text style={[
                    styles.trendValue,
                    { color: item.trend.direction === 'up' ? colors.success : item.trend.direction === 'down' ? colors.error : colors.textTertiary }
                  ]}>
                    {item.trend.percentage > 0 ? '+' : ''}{item.trend.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.marketCard}>
            <Text style={styles.noDataText}>{t('common.noData', 'No data available')}</Text>
          </Card>
        )}

        {/* Bottom spacing for safe area */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

// ─── Sub Components ──────────────────────────────────────────

const WeatherStat: React.FC<{ icon: string; value: string; label: string }> = ({
  icon, value, label,
}) => (
  <View style={styles.weatherStat}>
    <Text style={styles.weatherStatIcon}>{icon}</Text>
    <Text style={styles.weatherStatValue}>{value}</Text>
    <Text style={styles.weatherStatLabel}>{label}</Text>
  </View>
);

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  greetingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  greetingText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  greetingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: typography.fontSize.xxl },
  // Weather Card
  weatherCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weatherTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 4,
  },
  liveText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#DC2626',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  weatherEmoji: { fontSize: 48 },
  weatherTemp: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  weatherDesc: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weatherStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  weatherStat: {
    flex: 1,
    alignItems: 'center',
  },
  weatherStatIcon: { fontSize: 18, marginBottom: 2 },
  weatherStatValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  weatherStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryFaded,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  insightIcon: { fontSize: 16, marginTop: 1 },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primaryDark,
    lineHeight: 18,
  },
  // Quick Actions
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.sm },
  actionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  // Market Prices
  marketCard: { marginBottom: spacing.sm },
  marketCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketInfo: { flex: 1 },
  commodityName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  marketLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceSection: { alignItems: 'flex-end' },
  priceValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  trendValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  noDataText: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default HomeScreen;
