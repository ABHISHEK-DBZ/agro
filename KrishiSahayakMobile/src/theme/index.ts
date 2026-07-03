// Professional App Theme — Smart Krishi Sahayak
export const colors = {
  // Primary palette
  primary: '#1B7A3D',
  primaryLight: '#228B22',
  primaryDark: '#145A2D',
  primaryFaded: '#E8F5E9',

  // Secondary palette
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8FAF5',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Feedback
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0284C7',

  // Weather specific
  sunny: '#F59E0B',
  rainy: '#3B82F6',
  cloudy: '#6B7280',
  stormy: '#7C3AED',

  // Gradients
  gradientStart: '#1B7A3D',
  gradientEnd: '#22C55E',
  gradientAccent: '#059669',
} as const;

export const typography = {
  fontFamily: {
    regular: undefined, // Uses system default
    medium: undefined,
    bold: undefined,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 34,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
export default theme;
