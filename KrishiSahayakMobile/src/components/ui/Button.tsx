// Professional Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    isDisabled && styles.textDisabled,
    textStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  variant_primary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  variant_secondary: {
    backgroundColor: colors.primaryFaded,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: colors.error,
    ...shadows.md,
  },

  // Sizes
  size_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
  size_md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 44 },
  size_lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, minHeight: 52 },

  // Text
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  text_primary: { color: colors.white },
  text_secondary: { color: colors.primary },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_danger: { color: colors.white },
  textDisabled: { opacity: 0.7 },

  textSize_sm: { fontSize: typography.fontSize.sm },
  textSize_md: { fontSize: typography.fontSize.lg },
  textSize_lg: { fontSize: typography.fontSize.xl },
});

export default Button;
