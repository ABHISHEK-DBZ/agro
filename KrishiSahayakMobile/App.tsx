// Krishi Sahayak — Professional Mobile App Entry Point
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  LogBox,
  Platform,
  Animated,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import openRouterService from './src/services/openRouterService';
import voiceService from './src/services/voiceService';
import notificationService from './src/services/notificationService';
import { colors, typography, spacing } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Suppress known warnings in production
if (!__DEV__) {
  LogBox.ignoreAllLogs();
}

// Keep splash screen visible until ready
SplashScreen.preventAutoHideAsync().catch(() => {});

// Professional Loading Screen with Animation
const LoadingScreen = () => {
  const { colors: themeColors } = useTheme();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(spinAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(spinAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]),
      ),
    ]).start();
  }, []);

  const translateY = spinAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -8, 0],
  });

  return (
    <View style={[styles.loadingContainer, { backgroundColor: themeColors.primary }]}>
      <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
        <Animated.Text style={[styles.loadingLogo, { transform: [{ translateY }] }]}>
          🌾
        </Animated.Text>
        <Text style={styles.loadingTitle}>Krishi Sahayak</Text>
        <Text style={styles.loadingSubtitle}>स्मार्ट कृषि सहायक</Text>
        <View style={styles.loadingBar}>
          <View style={styles.loadingBarTrack}>
            <View style={styles.loadingBarFill} />
          </View>
        </View>
        <Text style={styles.loadingHint}>Preparing your farming assistant...</Text>
      </Animated.View>
    </View>
  );
};

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const prepare = async () => {
      try {
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }).start();

        // Initialize services in parallel
        await Promise.all([
          openRouterService.initialize(),
          voiceService.initialize(),
          notificationService.initialize(),
          // Cancel old daily briefings, then schedule new one (prevents stacking)
          notificationService.cancelAllNotifications().then(() =>
            notificationService.scheduleDailyBriefing(6, 0)
          ),
          new Promise(resolve => setTimeout(resolve, 1200)),
        ]);
      } catch (e) {
        console.warn('[App] Prepare error:', e);
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    };
    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ErrorBoundary>
            {!appReady ? <LoadingScreen /> : <AppWithTheme />}
          </ErrorBoundary>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Inner component that consumes ThemeContext */
const AppWithTheme: React.FC = () => {
  const { isDark, colors: themeColors } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F172A' : themeColors.background}
        translucent={Platform.OS === 'android'}
      />
      <LanguageProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </LanguageProvider>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  loadingSubtitle: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xxl,
  },
  loadingBar: {
    width: 220,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  loadingBarTrack: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  loadingBarFill: {
    width: '70%',
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  loadingHint: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.md,
  },
});
