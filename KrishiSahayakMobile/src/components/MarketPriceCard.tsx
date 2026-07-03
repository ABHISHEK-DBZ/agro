// Market Price Card Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { MarketPrice } from '../types';
import { Badge } from './ui';

interface MarketPriceCardProps {
  item: MarketPrice;
  onPress?: () => void;
}

export const MarketPriceCard: React.FC<MarketPriceCardProps> = ({ item, onPress }) => {
  const trendColor = item.trend.direction === 'up'
    ? colors.success
    : item.trend.direction === 'down'
    ? colors.error
    : colors.textTertiary;

  const trendIcon = item.trend.direction === 'up' ? '📈' : item.trend.direction === 'down' ? '📉' : '➡️';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.commoditySection}>
          <Text style={styles.commodityName}>{item.commodity}</Text>
          <Text style={styles.variety}>{item.variety}</Text>
        </View>
        <Badge
          label={item.marketStatus}
          variant={item.marketStatus === 'Open' ? 'success' : 'neutral'}
        />
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Modal Price</Text>
          <Text style={styles.mainPrice}>₹{item.price.modal.toLocaleString()}</Text>
          <Text style={styles.priceUnit}>per {item.unit}</Text>
        </View>
        <View style={styles.priceRange}>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeLabel}>Min</Text>
            <Text style={styles.rangeValue}>₹{item.price.min}</Text>
          </View>
          <View style={styles.rangeDivider} />
          <View style={styles.rangeItem}>
            <Text style={styles.rangeLabel}>Max</Text>
            <Text style={styles.rangeValue}>₹{item.price.max}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.marketInfo}>
          <Text style={styles.marketName}>📍 {item.market}</Text>
          <Text style={styles.marketState}>{item.state}, {item.district}</Text>
        </View>
        <View style={styles.trendBox}>
          <Text style={styles.trendIcon}>{trendIcon}</Text>
          <Text style={[styles.trendValue, { color: trendColor }]}>
            {item.trend.percentage > 0 ? '+' : ''}{item.trend.percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.volumeSection}>
        <VolumeItem label="Arrival" value={`${item.volume.arrival} q`} />
        <VolumeItem label="Sold" value={`${item.volume.sold} q`} />
        <VolumeItem label="Unsold" value={`${item.volume.unsold} q`} />
      </View>
    </View>
  );
};

const VolumeItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.volumeItem}>
    <Text style={styles.volumeLabel}>{label}</Text>
    <Text style={styles.volumeValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  commoditySection: {
    flex: 1,
  },
  commodityName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  variety: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainPrice: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginVertical: 2,
  },
  priceUnit: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  rangeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  rangeValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  rangeDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  marketInfo: {
    flex: 1,
  },
  marketName: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  marketState: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  trendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  trendIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  trendValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  volumeSection: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  volumeItem: {
    flex: 1,
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  volumeValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginTop: 2,
  },
});

export default MarketPriceCard;
