// Bottom Tab Navigator
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal as RNModal, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { MainTabParamList } from './types';
import { useTranslation, LANGUAGES } from '../context/LanguageContext';
import { FloatingVoiceButton } from '../components/FloatingVoiceButton';

import HomeScreen from '../screens/HomeScreen';
import WeatherScreen from '../screens/WeatherScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';
import CropInfoScreen from '../screens/CropInfoScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabBarIconProps {
  focused: boolean;
  icon: string;
  label: string;
}

const TabIcon: React.FC<TabBarIconProps> = ({ focused, icon, label }) => (
  <View style={tabStyles.iconContainer}>
    <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icon}</Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    {focused && <View style={tabStyles.activeIndicator} />}
  </View>
);

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
});

export const TabNavigator: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs,
          ...shadows.lg,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Weather"
        component={WeatherScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌤️" label="Weather" />
          ),
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketPricesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="💰" label="Market" />
          ),
        }}
      />
      <Tab.Screen
        name="Crops"
        component={CropInfoScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌾" label="Crops" />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⚙️" label="More" />
          ),
        }}
      />
    </Tab.Navigator>
      <FloatingVoiceButton bottomOffset={80} />
    </View>
  );
};

// More / Menu Screen (shown in tab bar)

const MoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t, language, setLanguage, getCurrentLanguage } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);

  const menuItems = [
    { id: 'ai', icon: '🤖', label: t('nav.aiAssistant', 'AI Assistant'), screen: 'AiAssistant' },
    { id: 'disease', icon: '🔬', label: t('nav.diseaseDetection', 'Disease Detection'), screen: 'DiseaseDetection' },
    { id: 'community', icon: '💬', label: t('nav.community', 'Community Feed'), screen: 'CommunityFeed' },
    { id: 'groups', icon: '👥', label: t('nav.groups', 'Farmer Groups'), screen: 'Groups' },
    { id: 'messages', icon: '✉️', label: t('nav.messages', 'Messages'), screen: 'Messages' },
    { id: 'polls', icon: '📊', label: t('nav.polls', 'Polls'), screen: 'Polls' },
    { id: 'notifications', icon: '🔔', label: t('nav.notifications', 'Notifications'), screen: 'Notifications' },
    { id: 'schemes', icon: '🏛️', label: t('nav.schemes', 'Govt Schemes'), screen: 'Schemes' },
    { id: 'testing', icon: '🌱', label: t('nav.soilTesting', 'Soil Testing'), screen: 'SoilTesting' },
    { id: 'calendar', icon: '📅', label: t('nav.cropCalendar', 'Crop Calendar'), screen: 'CropCalendar' },
    { id: 'cropmgmt', icon: '🌾', label: t('nav.cropGuide', 'Crop Guide'), screen: 'CropManagement' },
    { id: 'loan', icon: '💰', label: t('nav.loanCalc', 'Loan Calculator'), screen: 'LoanCalculator' },
    { id: 'grievances', icon: '📋', label: t('nav.grievances', 'Grievances'), screen: 'Grievances' },
    { id: 'dailylog', icon: '📝', label: t('nav.dailyTrack', 'Daily Track'), screen: 'DailyTrackingLog' },
    { id: 'analytics', icon: '📈', label: t('nav.analytics', 'Analytics'), screen: 'Analytics' },
    { id: 'profile', icon: '👤', label: t('nav.profile', 'Profile'), screen: 'Profile' },
    { id: 'settings', icon: '⚙️', label: t('nav.settings', 'Settings'), screen: 'Settings' },
  ];

  const handleLanguageSwitch = () => {
    setShowLangModal(true);
  };

  const selectLanguage = async (code: string) => {
    await setLanguage(code);
    setShowLangModal(false);
  };

  return (
    <View style={moreStyles.container}>
      <View style={moreStyles.header}>
        <View style={moreStyles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={moreStyles.title}>More</Text>
            <Text style={moreStyles.subtitle}>{t('common.settings', 'All features & settings')}</Text>
          </View>
          <TouchableOpacity style={moreStyles.langBtn} onPress={handleLanguageSwitch} activeOpacity={0.7}>
            <Text style={moreStyles.langBtnText}>{getCurrentLanguage().flag}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={moreStyles.gridContainer} showsVerticalScrollIndicator={false}>
        <View style={moreStyles.grid}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={moreStyles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={moreStyles.iconBox}>
                <Text style={moreStyles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={moreStyles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Language Selection Modal — shows all 12 languages, no Android Alert limit */}
      <RNModal
        visible={showLangModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLangModal(false)}
      >
        <Pressable style={moreStyles.modalOverlay} onPress={() => setShowLangModal(false)}>
          <Pressable style={moreStyles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={moreStyles.modalHeader}>
              <Text style={moreStyles.modalTitle}>{t('settings.language', 'App Language')}</Text>
              <Text style={moreStyles.modalSubtitle}>{t('onboarding.languageChangeNote', 'You can change language anytime')}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              {LANGUAGES.map(lang => {
                const isSelected = language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[moreStyles.langRow, isSelected && moreStyles.langRowSelected]}
                    onPress={() => selectLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={moreStyles.langRowFlag}>{lang.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[moreStyles.langRowName, isSelected && moreStyles.langRowNameSelected]}>
                        {lang.native}
                      </Text>
                      <Text style={moreStyles.langRowEnglish}>{lang.name}</Text>
                    </View>
                    {isSelected && <Text style={moreStyles.langRowCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={moreStyles.modalCloseBtn}
              onPress={() => setShowLangModal(false)}
              activeOpacity={0.7}
            >
              <Text style={moreStyles.modalCloseText}>{t('common.close', 'Close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </RNModal>
    </View>
  );
};

const moreStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langBtnText: {
    fontSize: 22,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  gridContainer: {
    paddingBottom: spacing.huge,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuItem: {
    width: '46%',
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  // Language Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.primary,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  langRowSelected: {
    backgroundColor: colors.primaryFaded,
  },
  langRowFlag: {
    fontSize: 26,
    marginRight: spacing.md,
  },
  langRowName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  langRowNameSelected: {
    color: colors.primary,
  },
  langRowEnglish: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: 1,
  },
  langRowCheck: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },
  modalCloseBtn: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  modalCloseText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});

export default TabNavigator;
