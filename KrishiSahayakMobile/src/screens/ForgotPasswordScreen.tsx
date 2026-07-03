// Forgot Password Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>
              Reset link sent! Check your email (including spam folder).
            </Text>
            <Button
              title="Back to Login"
              onPress={() => navigation.goBack()}
              fullWidth
              style={{ marginTop: spacing.lg }}
            />
          </View>
        ) : (
          <>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="Enter your registered email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              title="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              fullWidth
              size="lg"
            />

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    paddingBottom: spacing.huge,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
  },
  successIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  backLink: {
    alignSelf: 'center',
    marginTop: spacing.xl,
  },
  backText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default ForgotPasswordScreen;
