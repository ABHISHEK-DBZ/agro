// Crop Information Card
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Crop } from '../types';
import { Badge } from './ui';

interface CropCardProps {
  crop: Crop;
}

export const CropCard: React.FC<CropCardProps> = ({ crop }) => {
  const seasonColors = {
    Kharif: { bg: '#FEF3C7', text: '#92400E' },
    Rabi: { bg: '#DBEAFE', text: '#1E40AF' },
    Zaid: { bg: '#D1FAE5', text: '#065F46' },
  };

  const seasonColor = seasonColors[crop.season] || seasonColors.Kharif;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={styles.nameEn}>{crop.name.en}</Text>
          <Text style={styles.nameHi}>{crop.name.hi}</Text>
        </View>
        <View style={[styles.seasonBadge, { backgroundColor: seasonColor.bg }]}>
          <Text style={[styles.seasonText, { color: seasonColor.text }]}>{crop.season}</Text>
        </View>
      </View>

      {/* Quick Facts */}
      <View style={styles.factsGrid}>
        <FactItem label="Duration" value={crop.duration} icon="⏱️" />
        <FactItem label="Temperature" value={crop.temperature} icon="🌡️" />
        <FactItem label="Rainfall" value={crop.rainfall} icon="🌧️" />
        <FactItem label="Avg Yield" value={crop.avgYield} icon="📊" />
      </View>

      {/* Climate & Soil */}
      <View style={styles.infoSection}>
        <InfoRow label="Soil Type" value={crop.soilType} icon="🌱" />
        <InfoRow label="Climate" value={crop.climate} icon="🌤️" />
        <InfoRow label="Irrigation" value={crop.irrigation} icon="💧" />
        <InfoRow label="Fertilizer" value={crop.fertilizer} icon="🧪" />
      </View>

      {/* Major States */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Major Growing States</Text>
        <View style={styles.chipContainer}>
          {crop.majorStates.map((state, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{state}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Best Practices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Practices</Text>
        {crop.bestPractices.en.slice(0, 4).map((practice, index) => (
          <View key={index} style={styles.practiceRow}>
            <Text style={styles.practiceBullet}>•</Text>
            <Text style={styles.practiceText}>{practice}</Text>
          </View>
        ))}
      </View>

      {/* Varieties */}
      {crop.varieties && crop.varieties.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Varieties</Text>
          {crop.varieties.map((variety, index) => (
            <View key={index} style={styles.varietyCard}>
              <Text style={styles.varietyName}>{variety.name}</Text>
              <View style={styles.varietyDetails}>
                <Badge label={`${variety.duration}`} variant="info" />
                <Badge label={`${variety.yield}`} variant="success" />
              </View>
              <View style={styles.varietyFeatures}>
                {variety.features.map((f, i) => (
                  <Text key={i} style={styles.featureTag}>✨ {f}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Diseases */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Diseases</Text>
        <View style={styles.chipContainer}>
          {crop.diseases.map((disease, index) => (
            <View key={index} style={[styles.chip, styles.diseaseChip]}>
              <Text style={[styles.chipText, styles.diseaseText]}>{disease}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const FactItem: React.FC<{ label: string; value: string; icon: string }> = ({
  label, value, icon,
}) => (
  <View style={styles.factItem}>
    <Text style={styles.factIcon}>{icon}</Text>
    <Text style={styles.factValue}>{value}</Text>
    <Text style={styles.factLabel}>{label}</Text>
  </View>
);

const InfoRow: React.FC<{ label: string; value: string; icon: string }> = ({
  label, value, icon,
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  nameSection: {},
  nameEn: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  nameHi: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seasonBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  seasonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  factItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  factIcon: { fontSize: 20, marginBottom: spacing.xs },
  factValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  factLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoIcon: { fontSize: 16, marginRight: spacing.sm, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  diseaseChip: {
    backgroundColor: '#FEE2E2',
  },
  diseaseText: {
    color: colors.error,
  },
  practiceRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  practiceBullet: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  practiceText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  varietyCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  varietyName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  varietyDetails: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  varietyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  featureTag: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

export default CropCard;
