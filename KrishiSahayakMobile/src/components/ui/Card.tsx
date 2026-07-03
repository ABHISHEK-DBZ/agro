// Professional Card Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padded = true,
  variant = 'elevated',
}) => {
  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    padded && styles.padded,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

export interface CardRowProps {
  label: string;
  value: string;
  icon?: string;
}

export const CardRow: React.FC<CardRowProps> = ({ label, value, icon }) => (
  <View style={styles.row}>
    {icon && <Text style={styles.icon}>{icon}</Text>}
    <View style={styles.rowContent}>
      <View style={styles.labelContainer}>
        <View style={styles.dot} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {},
  padded: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  rowContent: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  labelText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  valueText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
    paddingLeft: spacing.sm,
  },
});

export default Card;
