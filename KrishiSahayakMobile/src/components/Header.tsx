// App Header with Gradient
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showAppName?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  showAppName = false,
}) => {
  const { isDark, colors: themeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? themeColors.card : themeColors.primary }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isDark ? themeColors.background : themeColors.primary}
      />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
          )}
          <View>
            {showAppName && (
              <Text style={styles.appName}>Krishi Sahayak</Text>
            )}
            <Text style={[styles.title, showAppName && styles.titleSmall]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        {rightAction && (
          <View style={styles.rightSection}>{rightAction}</View>
        )}
      </View>
    </View>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  backIcon: {
    fontSize: 28,
    color: colors.white,
    lineHeight: 30,
  },
  appName: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  titleSmall: {
    fontSize: typography.fontSize.xl,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  rightSection: {
    marginLeft: spacing.md,
  },
});

export default Header;
