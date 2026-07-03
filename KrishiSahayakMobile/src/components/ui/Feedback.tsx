// Loading & Feedback Components
import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = colors.primary,
  message,
  fullScreen = false,
  style,
}) => {
  const containerStyles: ViewStyle[] = [
    styles.spinnerContainer,
    fullScreen && styles.fullScreen,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={containerStyles}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.spinnerMessage}>{message}</Text>}
    </View>
  );
};

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {description && <Text style={styles.emptyDescription}>{description}</Text>}
    {action && <View style={styles.emptyAction}>{action}</View>}
  </View>
);

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  onRetry,
  retryLabel = 'Retry',
}) => (
  <View style={styles.errorView}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    {onRetry && (
      <Text style={styles.retryButton} onPress={onRetry}>
        {retryLabel}
      </Text>
    )}
  </View>
);

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
}) => {
  const badgeColors = {
    success: { bg: '#D1FAE5', text: '#065F46' },
    warning: { bg: '#FEF3C7', text: '#92400E' },
    error: { bg: '#FEE2E2', text: '#991B1B' },
    info: { bg: '#DBEAFE', text: '#1E40AF' },
    neutral: { bg: '#F3F4F6', text: '#374151' },
    premium: { bg: '#FEF9C3', text: '#854D0E' },
  };

  const badgeStyle = badgeColors[variant];

  return (
    <View style={[
      styles.badge,
      { backgroundColor: badgeStyle.bg },
      size === 'sm' ? styles.badgeSm : styles.badgeMd,
    ]}>
      <Text style={[
        styles.badgeText,
        { color: badgeStyle.text },
        size === 'sm' ? styles.badgeTextSm : styles.badgeTextMd,
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Spinner
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  spinnerMessage: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyAction: {
    marginTop: spacing.md,
  },

  // Error
  errorView: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: spacing.md,
  },
  errorMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontWeight: typography.fontWeight.medium,
  },
  badgeTextSm: {
    fontSize: typography.fontSize.xs,
  },
  badgeTextMd: {
    fontSize: typography.fontSize.sm,
  },
});

export default LoadingSpinner;
