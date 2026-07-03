/**
 * FloatingVoiceButton — Accessible from any screen
 * 
 * A floating action button that provides voice command access
 * across the entire app. Supports all 12 Indian languages for speech
 * recognition (Hindi, English, Bengali, Marathi, Gujarati, Tamil,
 * Telugu, Kannada, Malayalam, Punjabi, Odia, Urdu).
 * Falls back to AI Assistant if voice module isn't available.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useTranslation } from '../context/LanguageContext';
import voiceService, { SPEECH_LANG_MAP } from '../services/voiceService';
import { parseVoiceCommand } from '../services/voiceCommandParser';

interface FloatingVoiceButtonProps {
  bottomOffset?: number;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({
  bottomOffset = 80,
}) => {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [listeningText, setListeningText] = useState('');
  const isListeningRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the mic button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVoicePress = useCallback(async () => {
    const voiceAvailable = voiceService.state.isAvailable;

    if (voiceAvailable) {
      setListeningText('🎤 ' + t('voice.listening', 'Listening...'));
      setShowModal(true);
      setIsListening(true);
      isListeningRef.current = true;

      voiceService.startListening(
        (text) => {
          setIsListening(false);
          isListeningRef.current = false;
          setListeningText('✅ ' + text);
          const command = parseVoiceCommand(text);
          navTimerRef.current = setTimeout(() => {
            setShowModal(false);
            if (command.action === 'navigate' && command.screen) {
              try {
                navigation.navigate(command.screen);
              } catch {
                navigation.navigate('Home');
              }
            } else {
              navigation.navigate('AiAssistant');
            }
          }, 800);
        },
        () => {
          setIsListening(false);
          isListeningRef.current = false;
          setShowModal(false);
          navigation.navigate('AiAssistant');
        },
        SPEECH_LANG_MAP[language] || 'hi-IN',
      );

      // Auto-stop after 8 seconds (uses ref to avoid stale closure)
      const autoStopTimer = setTimeout(() => {
        if (isListeningRef.current) {
          voiceService.stopListening();
          setIsListening(false);
          isListeningRef.current = false;
          setShowModal(false);
        }
      }, 8000);
      timeoutRef.current = autoStopTimer;
    } else {
      // Voice not available — go to AI Assistant
      navigation.navigate('AiAssistant');
    }
  }, [navigation, language, t]);

  const handleCancel = useCallback(() => {
    // Clear all pending timeouts to prevent stale updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    voiceService.stopListening();
    setShowModal(false);
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  return (
    <>
      {/* Floating Mic Button */}
      <Animated.View
        style={[
          styles.floatingBtnContainer,
          { bottom: bottomOffset, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.floatingBtn, isListening && styles.floatingBtnActive]}
          onPress={handleVoicePress}
          activeOpacity={0.8}
        >
          <Animated.Text
            style={[
              styles.micIcon,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            🎤
          </Animated.Text>
        </TouchableOpacity>
        <Text style={styles.floatingLabel}>
          {t('voice.tapToSpeak', 'Voice')}
        </Text>
      </Animated.View>

      {/* Voice Modal */}
      <RNModal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={vmStyles.overlay} onPress={handleCancel}>
          <Pressable style={vmStyles.content} onPress={e => e.stopPropagation()}>
            {/* Waveform visualization */}
            <View style={vmStyles.waveform}>
              <View style={[vmStyles.wave, { height: 24 }]} />
              <View style={[vmStyles.wave, { height: 44 }]} />
              <View style={[vmStyles.wave, { height: 32 }]} />
              <View style={[vmStyles.wave, { height: 48 }]} />
              <View style={[vmStyles.wave, { height: 28 }]} />
            </View>

            <Text style={vmStyles.statusText}>{listeningText}</Text>

            {isListening && (
              <Text style={vmStyles.hintText}>
                {t('voice.listening', 'Say a command...')}{'\n'}
                "{t('nav.weather', 'Open Weather')}" · "{t('nav.market', 'Show Market')}"
              </Text>
            )}

            <TouchableOpacity
              style={vmStyles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={vmStyles.cancelText}>
                {t('common.cancel', 'Cancel')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </RNModal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingBtnContainer: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 999,
  },
  floatingBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  floatingBtnActive: {
    backgroundColor: '#DC2626',
  },
  micIcon: {
    fontSize: 24,
  },
  floatingLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginTop: 4,
    textAlign: 'center',
  },
});

const vmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '85%',
    maxWidth: 360,
    ...shadows.lg,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.lg,
    height: 60,
  },
  wave: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.7,
  },
  statusText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  cancelBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});

export default FloatingVoiceButton;
