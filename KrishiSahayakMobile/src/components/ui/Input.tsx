// Professional Input Component
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required = false,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyles: any[] = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    style,
  ].filter(Boolean);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={inputStyles}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {helper && !error && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xxxl + spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xxxl + spacing.sm,
  },
  leftIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  helper: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});

export default Input;
