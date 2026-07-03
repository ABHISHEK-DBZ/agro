// Settings Screen — Fully Functional with Dark Mode & Crash Protection
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { typography, spacing, borderRadius } from '../theme';
import { Header } from '../components';
import { useTranslation, LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import storageService from '../services/storage';

interface SettingsScreenProps {
  navigation: any;
}

const SETTINGS_KEY = '@krishi_settings_data';

interface SettingsData {
  language: string;
  darkMode: boolean;
  notifications: {
    weather: boolean;
    prices: boolean;
    schemes: boolean;
    disease: boolean;
    community: boolean;
  };
}

const DEFAULT_SETTINGS: SettingsData = {
  language: 'hi',
  darkMode: false,
  notifications: {
    weather: true,
    prices: true,
    schemes: true,
    disease: true,
    community: false,
  },
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t, language, setLanguage, getCurrentLanguage } = useTranslation();
  const { isDark, setTheme, colors } = useTheme();
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);

  // Load saved settings with error handling
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const saved = await storageService.getItem<SettingsData>(SETTINGS_KEY);
        if (saved && mountedRef.current) {
          setSettings(prev => ({ ...prev, ...saved }));
        }
      } catch (e) {
        console.warn('[Settings] Failed to load settings:', e);
        // Use defaults — no crash
      } finally {
        if (mountedRef.current) {
          setIsLoaded(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      }
    })();
    return () => { mountedRef.current = false; };
  }, []);

  // Save settings when they change (with error handling)
  useEffect(() => {
    (async () => {
      try {
        await storageService.setItem(SETTINGS_KEY, settings);
      } catch (e) {
        console.warn('[Settings] Failed to save settings:', e);
      }
    })();
  }, [settings]);

  const handleLanguageChange = useCallback(async (code: string) => {
    try {
      await setLanguage(code);
      setSettings(prev => ({ ...prev, language: code }));
      setShowLanguagePicker(false);
    } catch (e) {
      console.warn('[Settings] Language change error:', e);
    }
  }, [setLanguage]);

  const toggleDarkMode = useCallback((value: boolean) => {
    try {
      setSettings(prev => ({ ...prev, darkMode: value }));
      setTheme(value);
    } catch (e) {
      console.warn('[Settings] Theme toggle error:', e);
    }
  }, [setTheme]);

  const toggleNotification = useCallback((key: keyof SettingsData['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  }, []);

  const currentLang = getCurrentLanguage();

  const handleBack = useCallback(() => {
    try {
      if (navigation && navigation.goBack) {
        navigation.goBack();
      } else {
        navigation?.navigate?.('Home');
      }
    } catch {
      try { navigation?.navigate?.('Home'); } catch {}
    }
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('settings.title', 'Settings')}
        subtitle={t('common.settings', 'App preferences')}
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoaded && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Language Section */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                {t('settings.language', 'App Language')}
              </Text>
              <TouchableOpacity
                style={[styles.settingItem, { borderTopColor: colors.borderLight }]}
                onPress={() => setShowLanguagePicker(!showLanguagePicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.settingIcon}>🌐</Text>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    {t('settings.language', 'App Language')}
                  </Text>
                  <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
                    {currentLang.native} ({currentLang.name})
                  </Text>
                </View>
                <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>
                  {showLanguagePicker ? '▼' : '›'}
                </Text>
              </TouchableOpacity>

              {showLanguagePicker && (
                <View style={styles.languageList}>
                  {(LANGUAGES || []).map(lang => {
                    const isSelected = language === lang.code;
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.languageItem,
                          isSelected && { backgroundColor: colors.primaryFaded },
                        ]}
                        onPress={() => handleLanguageChange(lang.code)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.langFlag}>{lang.flag}</Text>
                        <Text style={[styles.langName, { color: colors.textPrimary }]}>
                          {lang.native}
                        </Text>
                        <Text style={[styles.langEnglish, { color: colors.textSecondary }]}>
                          {lang.name}
                        </Text>
                        {isSelected && (
                          <Text style={[styles.langCheck, { color: colors.primary }]}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Appearance Section */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                {t('settings.appearance', 'Appearance')}
              </Text>
              <View style={[styles.settingItem, { borderTopColor: colors.borderLight }]}>
                <Text style={styles.settingIcon}>🎨</Text>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    {t('settings.darkMode', 'Dark Mode')}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={isDark ? colors.primary : '#f4f3f4'}
                  ios_backgroundColor={colors.border}
                />
              </View>
            </View>

            {/* Notifications Section */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                {t('settings.notifications', 'Notifications')}
              </Text>
              {([
                { key: 'weather' as const, icon: '🌤️', label: t('settings.weatherAlerts', 'Weather Alerts') },
                { key: 'prices' as const, icon: '💰', label: t('settings.priceAlerts', 'Price Alerts') },
                { key: 'schemes' as const, icon: '🏛️', label: t('settings.schemeAlerts', 'Scheme Alerts') },
                { key: 'disease' as const, icon: '🔬', label: t('settings.diseaseAlerts', 'Disease Alerts') },
                { key: 'community' as const, icon: '👥', label: t('settings.communityAlerts', 'Community Alerts') },
              ] as const).map(({ key, icon, label }) => (
                <View key={key} style={[styles.settingItem, { borderTopColor: colors.borderLight }]}>
                  <Text style={styles.settingIcon}>{icon}</Text>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
                  </View>
                  <Switch
                    value={settings.notifications[key]}
                    onValueChange={() => toggleNotification(key)}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={settings.notifications[key] ? colors.primary : '#f4f4f4'}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              ))}
            </View>

            {/* About Section */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                {t('settings.about', 'About')}
              </Text>
              <View style={[styles.settingItem, { borderTopColor: colors.borderLight }]}>
                <Text style={styles.settingIcon}>ℹ️</Text>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    {t('profile.version', 'Version')}
                  </Text>
                </View>
                <Text style={[styles.settingValue, { color: colors.textTertiary }]}>2.0.0</Text>
              </View>
              <TouchableOpacity
                style={[styles.settingItem, { borderTopColor: colors.borderLight }]}
                activeOpacity={0.7}
              >
                <Text style={styles.settingIcon}>📄</Text>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    {t('settings.privacy', 'Privacy Policy')}
                  </Text>
                </View>
                <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.settingItem, { borderTopColor: colors.borderLight }]}
                activeOpacity={0.7}
              >
                <Text style={styles.settingIcon}>📋</Text>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    {t('settings.terms', 'Terms of Service')}
                  </Text>
                </View>
                <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: spacing.huge }} />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing.huge },
  section: {
    marginTop: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 28,
    textAlign: 'center',
  },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: typography.fontSize.lg },
  settingValue: { fontSize: typography.fontSize.sm, marginTop: 2 },
  settingArrow: { fontSize: typography.fontSize.xxl },
  languageList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  langFlag: { fontSize: 22, marginRight: spacing.md },
  langName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    width: 80,
  },
  langEnglish: { fontSize: typography.fontSize.sm, flex: 1 },
  langCheck: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginLeft: spacing.sm },
});


export default SettingsScreen;
