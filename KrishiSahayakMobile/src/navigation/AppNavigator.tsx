// Root App Navigator
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner } from '../components/ui';
import { RootStackParamList } from './types';
import { colors } from '../theme';
import storageService, { KEYS } from '../services/storage';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Onboarding
import OnboardingScreen from '../screens/OnboardingScreen';

// Main Tab Navigator
import TabNavigator from './TabNavigator';

// Feature Screens (stacked on top of tabs)
import WeatherScreen from '../screens/WeatherScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';
import CropInfoScreen from '../screens/CropInfoScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// New Feature Screens
import GovernmentSchemesScreen from '../screens/GovernmentSchemesScreen';
import SoilTestingScreen from '../screens/SoilTestingScreen';
import CropCalendarScreen from '../screens/CropCalendarScreen';
import CommunityFeedScreen from '../screens/CommunityFeedScreen';
import AiAssistantScreen from '../screens/AiAssistantScreen';

// New Feature Screens Batch 2
import LoanCalculatorScreen from '../screens/LoanCalculatorScreen';
import GrievancesScreen from '../screens/GrievancesScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import MessagesScreen from '../screens/MessagesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PollsScreen from '../screens/PollsScreen';
import CropManagementScreen from '../screens/CropManagementScreen';
import DailyTrackingLogScreen from '../screens/DailyTrackingLogScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading, initialized } = useAuth();
  const { colors: themeColors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const done = await storageService.getItem<boolean>(KEYS.ONBOARDING_COMPLETED);
      setOnboardingComplete(!!done);
    };
    checkOnboarding();
  }, []);

  if (!initialized || loading || onboardingComplete === null) {
    return (
      <LoadingSpinner
        fullScreen
        message="Starting Krishi Sahayak..."
        color={themeColors.primary}
      />
    );
  }

  // First launch — show onboarding
  if (!onboardingComplete) {
    return <OnboardingScreen onComplete={() => setOnboardingComplete(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: themeColors.background },
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="Weather"
              component={WeatherScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="MarketPrices"
              component={MarketPricesScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="CropInfo"
              component={CropInfoScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="DiseaseDetection"
              component={DiseaseDetectionScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Schemes"
              component={GovernmentSchemesScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="SoilTesting"
              component={SoilTestingScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="CropCalendar"
              component={CropCalendarScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="CommunityFeed"
              component={CommunityFeedScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="AiAssistant"
              component={AiAssistantScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="LoanCalculator"
              component={LoanCalculatorScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Grievances"
              component={GrievancesScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Groups"
              component={GroupsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="GroupDetail"
              component={GroupDetailScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Polls"
              component={PollsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="CropManagement"
              component={CropManagementScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="DailyTrackingLog"
              component={DailyTrackingLogScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
