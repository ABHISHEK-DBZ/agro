// Weather Card Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { CurrentWeather, HourlyWeather, DailyWeather } from '../types';
import { Badge } from './ui';

interface WeatherCardProps {
  current?: CurrentWeather;
  hourly?: HourlyWeather[];
  daily?: DailyWeather[];
  locationName?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

const WeatherIcon: React.FC<{ icon: string; size?: number }> = ({ icon, size = 40 }) => {
  const iconMap: Record<string, string> = {
    sunny: '☀️',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    foggy: '🌫️',
    drizzle: '🌦️',
    rainy: '🌧️',
    snowy: '❄️',
    thunderstorm: '⛈️',
    '': '☀️',
  };

  return (
    <Text style={{ fontSize: size }}>
      {iconMap[icon] || '☀️'}
    </Text>
  );
};

export const WeatherCard: React.FC<WeatherCardProps> = ({
  current,
  hourly,
  daily,
  locationName,
  loading,
  onRefresh,
}) => {
  if (loading || !current) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  const getWeatherColor = (temp: number) => {
    if (temp >= 35) return colors.error;
    if (temp >= 25) return colors.warning;
    if (temp >= 15) return colors.success;
    return colors.info;
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return dateStr;
    }
  };

  const formatDay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      return d.toLocaleDateString('en-IN', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Current Weather */}
      <TouchableOpacity onPress={onRefresh} activeOpacity={0.8} style={styles.currentWeather}>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>📍 {locationName || 'Current Location'}</Text>
          <Badge label={current.condition.main} variant="info" />
        </View>

        <View style={styles.tempRow}>
          <WeatherIcon icon={current.icon} size={64} />
          <View style={styles.tempSection}>
            <Text style={[styles.temperature, { color: getWeatherColor(current.temperature) }]}>
              {current.temperature}°C
            </Text>
            <Text style={styles.feelsLike}>Feels like {current.feelsLike}°C</Text>
          </View>
        </View>

        <Text style={styles.weatherDesc}>{current.condition.description}</Text>

        <View style={styles.detailsGrid}>
          <DetailItem label="Humidity" value={`${current.humidity}%`} icon="💧" />
          <DetailItem label="Wind" value={`${current.windSpeed} km/h`} icon="💨" />
          <DetailItem label="Rainfall" value={`${current.rainfall} mm`} icon="🌧️" />
          <DetailItem label="UV Index" value={`${current.uvIndex}`} icon="☀️" />
        </View>
      </TouchableOpacity>

      {/* Hourly Forecast */}
      {hourly && hourly.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Hourly Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
            {hourly.filter((_, i) => i % 3 === 0).slice(0, 8).map((hour, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{formatTime(hour.time)}</Text>
                <WeatherIcon icon={hour.icon} size={24} />
                <Text style={styles.hourlyTemp}>{hour.temperature}°</Text>
                <Text style={styles.hourlyRain}>{hour.chanceOfRain > 0 ? `${hour.chanceOfRain}%` : ''}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Daily Forecast */}
      {daily && daily.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          {daily.map((day, index) => (
            <View key={index} style={styles.dailyItem}>
              <Text style={styles.dailyDay}>{formatDay(day.date)}</Text>
              <WeatherIcon icon={day.icon} size={20} />
              <View style={styles.dailyTempRange}>
                <Text style={styles.dailyTempMax}>{day.tempMax}°</Text>
                <View style={styles.dailyTempBar}>
                  <View style={[styles.dailyTempFill, {
                    left: `${Math.max(0, (day.tempMin - 10) * 5)}%`,
                    right: `${Math.max(0, 100 - (day.tempMax - 10) * 5)}%`,
                  }]} />
                </View>
                <Text style={styles.dailyTempMin}>{day.tempMin}°</Text>
              </View>
              <Text style={styles.dailyRain}>{day.chanceOfRain > 0 ? `${day.chanceOfRain}%` : ''}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const DetailItem: React.FC<{ label: string; value: string; icon: string }> = ({
  label, value, icon,
}) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: spacing.xxl,
  },
  currentWeather: {
    padding: spacing.xl,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tempSection: {
    marginLeft: spacing.lg,
  },
  temperature: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -1,
  },
  feelsLike: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weatherDesc: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.lg,
    textTransform: 'capitalize',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  hourlyScroll: {
    paddingBottom: spacing.sm,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: spacing.xl,
    minWidth: 60,
  },
  hourlyTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  hourlyTemp: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  hourlyRain: {
    fontSize: typography.fontSize.xs,
    color: colors.info,
    marginTop: 2,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dailyDay: {
    width: 60,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  dailyTempRange: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  dailyTempMax: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    width: 30,
    textAlign: 'right',
  },
  dailyTempBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    marginHorizontal: spacing.xs,
    overflow: 'hidden',
  },
  dailyTempFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
  },
  dailyTempMin: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    width: 30,
  },
  dailyRain: {
    width: 35,
    fontSize: typography.fontSize.xs,
    color: colors.info,
    textAlign: 'right',
  },
});

export default WeatherCard;
