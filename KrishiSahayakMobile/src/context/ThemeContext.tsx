/**
 * Theme Context — Dark Mode / Light Mode support
 * Persists selection to AsyncStorage
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import storageService from '../services/storage';

const THEME_KEY = '@krishi_theme_mode';

export interface ThemeColors {
  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryFaded: string;
  // Secondary
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  // Neutrals
  white: string;
  background: string;
  surface: string;
  card: string;
  border: string;
  borderLight: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  // Feedback
  success: string;
  warning: string;
  error: string;
  info: string;
  // Shadows
  shadowColor: string;
}

export const lightColors: ThemeColors = {
  primary: '#1B7A3D',
  primaryLight: '#228B22',
  primaryDark: '#145A2D',
  primaryFaded: '#E8F5E9',
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',
  white: '#FFFFFF',
  background: '#F8FAF5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0284C7',
  shadowColor: '#000',
};

export const darkColors: ThemeColors = {
  primary: '#22C55E',
  primaryLight: '#34D399',
  primaryDark: '#16A34A',
  primaryFaded: '#1B3D25',
  secondary: '#FBBF24',
  secondaryLight: '#FDE68A',
  secondaryDark: '#F59E0B',
  white: '#1F2937',
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  border: '#374151',
  borderLight: '#2D3A4E',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0F172A',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#38BDF8',
  shadowColor: '#00000066',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
  setTheme: (dark: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      isDark: false,
      colors: lightColors,
      toggleTheme: async () => {},
      setTheme: async () => {},
    };
  }
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storageService.getItem<boolean>(THEME_KEY);
      if (saved === true) setIsDark(true);
    })();
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    await storageService.setItem(THEME_KEY, next);
  }, [isDark]);

  const setTheme = useCallback(async (dark: boolean) => {
    setIsDark(dark);
    await storageService.setItem(THEME_KEY, dark);
  }, []);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
