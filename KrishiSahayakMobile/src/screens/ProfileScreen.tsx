// Profile Screen — Fully Functional
import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Share,
  Linking,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { Card, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
  const { t, language, setLanguage, getCurrentLanguage } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLogout = () => {
    Alert.alert(
      t('profile.signOut', 'Sign Out'),
      t('profile.logoutConfirm', 'Are you sure you want to logout?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('profile.signOut', 'Sign Out'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error('[Profile] Logout error:', err);
            }
          },
        },
      ]
    );
  };

  const handleChangeLanguage = useCallback(() => {
    const options = [
      { code: 'hi', label: 'हिन्दी (Hindi)' },
      { code: 'en', label: 'English' },
      { code: 'bn', label: 'বাংলা (Bengali)' },
      { code: 'mr', label: 'मराठी (Marathi)' },
      { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
      { code: 'ta', label: 'தமிழ் (Tamil)' },
      { code: 'te', label: 'తెలుగు (Telugu)' },
      { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
      { code: 'ml', label: 'മലയാളം (Malayalam)' },
      { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
      { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
      { code: 'ur', label: 'اردو (Urdu)' },
    ];

    Alert.alert(
      t('profile.language', 'Language'),
      t('common.search', 'Select your preferred language'),
      options.map(opt => ({
        text: opt.label,
        onPress: () => setLanguage(opt.code),
      })),
      { cancelable: true }
    );
  }, [setLanguage, t]);

  const handleTheme = useCallback(() => {
    Alert.alert(
      t('profile.theme', 'Theme'),
      'Dark mode coming in the next update! 🌙',
      [{ text: t('common.cancel', 'Cancel'), style: 'cancel' }]
    );
  }, [t]);

  const handleNotifications = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleChangePassword = useCallback(() => {
    const email = user?.email;
    if (email) {
      Alert.alert(
        t('profile.changePassword', 'Change Password'),
        `A password reset link will be sent to ${email}`,
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          { text: t('common.confirm', 'Send'), onPress: async () => {
            try {
              const { sendPasswordResetEmail } = require('firebase/auth');
              const { auth } = require('../config/firebase');
              if (auth) {
                await sendPasswordResetEmail(auth, email);
                Alert.alert(t('common.success', 'Success'), 'Password reset link sent!');
              }
            } catch (err: any) {
              Alert.alert(t('common.error', 'Error'), err.message || 'Failed to send reset email');
            }
          }},
        ]
      );
    }
  }, [user, t]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: '🌾 Krishi Sahayak - Smart Farming Assistant\nDownload now and get real-time weather, market prices, and expert farming advice!',
      });
    } catch {}
  }, []);

  const handleOpenUrl = useCallback(async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) Linking.openURL(url);
  }, []);

  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('profile.title', 'Profile')}
        subtitle={t('profile.subtitle', 'Your account')}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>📤</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() || '🌾'}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.name}>{userProfile?.displayName || 'Farmer'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {userProfile?.role === 'expert' ? t('profile.expert', '👨‍🔬 Agri Expert') : t('profile.farmer', '👨‍🌾 Farmer')}
            </Text>
          </View>
        </View>

        {/* Stats */}
        {userProfile?.stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statValue}>{userProfile.stats.postsCount}</Text>
              <Text style={styles.statLabel}>{t('profile.posts', 'Posts')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👍</Text>
              <Text style={styles.statValue}>{userProfile.stats.helpfulVotes}</Text>
              <Text style={styles.statLabel}>{t('profile.helpful', 'Helpful')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statValue}>{userProfile.stats.answersCount}</Text>
              <Text style={styles.statLabel}>{t('profile.answers', 'Answers')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>❓</Text>
              <Text style={styles.statValue}>{userProfile.stats.questionsCount}</Text>
              <Text style={styles.statLabel}>{t('profile.questions', 'Questions')}</Text>
            </View>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings', 'Settings')}</Text>
          <MenuItem
            icon="🌐"
            label={t('profile.language', 'Language')}
            value={getCurrentLanguage().native}
            onPress={handleChangeLanguage}
          />
          <MenuItem
            icon="🎨"
            label={t('profile.theme', 'Theme')}
            value="Light"
            onPress={handleTheme}
          />
          <MenuItem
            icon="🔔"
            label={t('profile.notifications', 'Notifications')}
            value={t('common.settings', 'Configure')}
            onPress={handleNotifications}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account', 'Account')}</Text>
          <MenuItem
            icon="🔒"
            label={t('profile.changePassword', 'Change Password')}
            onPress={handleChangePassword}
          />
          <MenuItem
            icon="📧"
            label={t('profile.emailVerification', 'Email Verification')}
            value={user?.emailVerified ? `✅ ${t('profile.verified', 'Verified')}` : `❌ ${t('profile.notVerified', 'Not Verified')}`}
            onPress={() => {
              if (!user?.emailVerified) {
                Alert.alert(
                  t('profile.emailVerification', 'Email Verification'),
                  'A verification email has not been sent yet. Check your inbox or request a new one.',
                  [
                    { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                    { text: 'Resend Email', onPress: async () => {
                      try {
                        const { sendEmailVerification } = require('firebase/auth');
                        if (user) await sendEmailVerification(user);
                        Alert.alert(t('common.success', 'Success'), 'Verification email sent!');
                      } catch (err: any) {
                        Alert.alert(t('common.error', 'Error'), err.message);
                      }
                    }},
                  ]
                );
              }
            }}
          />
          <MenuItem
            icon="📋"
            label={t('profile.privacyPolicy', 'Privacy Policy')}
            onPress={() => handleOpenUrl('https://smart-krishi.app/privacy')}
          />
          <MenuItem
            icon="📄"
            label={t('profile.termsConditions', 'Terms & Conditions')}
            onPress={() => handleOpenUrl('https://smart-krishi.app/terms')}
          />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.appInfo', 'App Info')}</Text>
          <MenuItem icon="ℹ️" label={t('profile.version', 'Version')} value="2.0.0" />
          <MenuItem icon="📤" label="Share App" onPress={handleShare} />
        </View>

        {/* Sign Out */}
        <View style={styles.logoutSection}>
          <Button
            title={t('profile.signOut', 'Sign Out')}
            variant="danger"
            onPress={handleLogout}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const MenuItem: React.FC<{
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}> = ({ icon, label, value, onPress }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.6}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuLabel}>{label}</Text>
    {value && <Text style={styles.menuValue}>{value}</Text>}
    {onPress && <Text style={styles.menuArrow}>›</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing.huge },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 18 },
  profileCard: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.white,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  email: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryFaded,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: spacing.xs },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  menuIcon: { fontSize: 18, marginRight: spacing.md },
  menuLabel: { flex: 1, fontSize: typography.fontSize.lg, color: colors.textPrimary },
  menuValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginRight: spacing.sm,
  },
  menuArrow: { fontSize: typography.fontSize.xl, color: colors.textTertiary },
  logoutSection: { padding: spacing.xl, marginTop: spacing.lg },
});

export default ProfileScreen;
