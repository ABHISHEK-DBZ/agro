// Login Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { typography, spacing, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Button, Input, LoadingSpinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const { login, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setError('');
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Branding */}
        <View style={[styles.brandSection, { backgroundColor: colors.primary }]}>
          <View style={[styles.logoContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.logoIcon}>🌾</Text>
          </View>
          <Text style={[styles.appName, { color: colors.textInverse }]}>Krishi Sahayak</Text>
          <Text style={styles.tagline}>स्मार्ट कृषि सहायक</Text>
          <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.6)' }]}>Your Intelligent Farming Assistant</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>Sign in to continue</Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: isDark ? '#3B1A1A' : '#FEE2E2' }]}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Text>📧</Text>}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Text>🔒</Text>}
            rightIcon={<Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google Sign In */}
          <Button
            title="Continue with Google"
            variant="outline"
            onPress={loginWithGoogle}
            fullWidth
            size="lg"
            icon={<Text style={{ fontSize: 18 }}>G</Text>}
          />

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: spacing.huge + spacing.xxl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  formSection: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  formTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  formSubtitle: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    fontSize: typography.fontSize.sm,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  registerText: {
    fontSize: typography.fontSize.md,
  },
  registerLink: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default LoginScreen;
