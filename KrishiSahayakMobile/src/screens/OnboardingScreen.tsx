// Onboarding Screen — Welcome & Language Selection
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Button } from '../components/ui';
import storageService, { KEYS } from '../services/storage';

const { width, height } = Dimensions.get('window');

// ─── Onboarding Slide Data ───────────────────────────────────
interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: [string, string];
}

const slides: Slide[] = [
  {
    id: 'welcome',
    emoji: '🌾',
    title: 'Krishi Sahayak',
    subtitle: 'स्मार्ट कृषि सहायक',
    description:
      'Your intelligent farming companion. Get real-time weather, market prices, crop advice, and government schemes in your preferred language.',
    gradient: ['#1B7A3D', '#22C55E'],
  },
  {
    id: 'weather',
    emoji: '🌤️',
    title: 'Real-Time Weather',
    subtitle: 'मौसम अपडेट',
    description:
      'Accurate 7-day weather forecasts, rainfall predictions, and severe weather alerts tailored to your farm location.',
    gradient: ['#0284C7', '#38BDF8'],
  },
  {
    id: 'market',
    emoji: '💰',
    title: 'Market Prices',
    subtitle: 'बाजार भाव',
    description:
      'Live mandi prices for crops in your area. Track price trends, compare across markets, and decide the best time to sell.',
    gradient: ['#059669', '#34D399'],
  },
  {
    id: 'disease',
    emoji: '🔬',
    title: 'Disease Detection',
    subtitle: 'रोग पहचान',
    description:
      'Snap a photo of your crop and our AI instantly identifies diseases, pests, and nutrient deficiencies with treatment recommendations.',
    gradient: ['#DC2626', '#FB7185'],
  },
  {
    id: 'schemes',
    emoji: '🏛️',
    title: 'Government Schemes',
    subtitle: 'सरकारी योजनाएं',
    description:
      'Discover and apply for PM-KISAN, Fasal Bima Yojana, Soil Health Cards, and 50+ other schemes. Get notified about new benefits.',
    gradient: ['#7C3AED', '#A78BFA'],
  },
];

// ─── Language Data ────────────────────────────────────────────
interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
];

// ─── Language Selection Screen ────────────────────────────────
const LanguageSelection: React.FC<{
  selectedLanguage: string;
  onSelect: (code: string) => void;
  onContinue: () => void;
}> = ({ selectedLanguage, onSelect, onContinue }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[langStyles.container, { paddingTop: insets.top + 20 }]}>
      <View style={langStyles.header}>
        <Text style={langStyles.emoji}>🗣️</Text>
        <Text style={langStyles.title}>Choose Language</Text>
        <Text style={langStyles.subtitle}>भाषा चुनें</Text>
      </View>

      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        contentContainerStyle={langStyles.list}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={langStyles.row}
        renderItem={({ item }) => {
          const isSelected = selectedLanguage === item.code;
          return (
            <TouchableOpacity
              style={[
                langStyles.langCard,
                isSelected && langStyles.langCardSelected,
              ]}
              onPress={() => onSelect(item.code)}
              activeOpacity={0.7}
            >
              <Text style={langStyles.langFlag}>{item.flag}</Text>
              <Text
                style={[
                  langStyles.langName,
                  isSelected && langStyles.langNameSelected,
                ]}
              >
                {item.native}
              </Text>
              <Text
                style={[
                  langStyles.langEnglish,
                  isSelected && langStyles.langEnglishSelected,
                ]}
              >
                {item.name}
              </Text>
              {isSelected && (
                <View style={langStyles.checkmark}>
                  <Text style={langStyles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={[langStyles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title="Get Started →"
          onPress={onContinue}
          size="lg"
          fullWidth
          disabled={!selectedLanguage}
        />
        <Text style={langStyles.footerText}>
          You can change language anytime in Settings
        </Text>
      </View>
    </View>
  );
};

const langStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  langCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  langCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  langFlag: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  langName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  langNameSelected: {
    color: colors.primary,
  },
  langEnglish: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  langEnglishSelected: {
    color: colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});

// ─── Main Onboarding Component ────────────────────────────────
interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLanguage, setShowLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      setShowLanguage(true);
    }
  };

  const handleSkip = () => {
    setShowLanguage(true);
  };

  const handleComplete = async () => {
    if (selectedLanguage) {
      await storageService.setItem(KEYS.SELECTED_LANGUAGE, selectedLanguage);
    }
    await storageService.setItem(KEYS.ONBOARDING_COMPLETED, true);
    onComplete();
  };

  // If showing language selection
  if (showLanguage) {
    return (
      <LanguageSelection
        selectedLanguage={selectedLanguage}
        onSelect={setSelectedLanguage}
        onContinue={handleComplete}
      />
    );
  }

  // Slide item renderer
  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={[slideStyles.slide, { width }]}>
        {/* Gradient Background */}
        <View style={[slideStyles.gradientBg, { backgroundColor: item.gradient[0] }]}>
          <View style={slideStyles.gradientOverlay} />
          {/* Decorative circles */}
          <View style={[slideStyles.circle, slideStyles.circle1, { backgroundColor: item.gradient[1] }]} />
          <View style={[slideStyles.circle, slideStyles.circle2, { backgroundColor: item.gradient[1] }]} />

          <View style={slideStyles.emojiContainer}>
            <Text style={slideStyles.slideEmoji}>{item.emoji}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={slideStyles.content}>
          <View style={slideStyles.titleContainer}>
            <Text style={slideStyles.slideSubtitle}>{item.subtitle}</Text>
            <Text style={slideStyles.slideTitle}>{item.title}</Text>
          </View>

          <Text style={slideStyles.slideDescription}>{item.description}</Text>

          {/* Feature hints */}
          <View style={slideStyles.featureRow}>
            {item.id === 'welcome' && (
              <>
                <FeatureHint icon="🌐" text="12 Indian languages" />
                <FeatureHint icon="📡" text="Real-time data" />
              </>
            )}
            {item.id === 'weather' && (
              <>
                <FeatureHint icon="📍" text="Location-based" />
                <FeatureHint icon="🔔" text="Severe alerts" />
              </>
            )}
            {item.id === 'market' && (
              <>
                <FeatureHint icon="📊" text="Price trends" />
                <FeatureHint icon="🏪" text="Local mandis" />
              </>
            )}
            {item.id === 'disease' && (
              <>
                <FeatureHint icon="📸" text="Photo analysis" />
                <FeatureHint icon="💊" text="Treatment advice" />
              </>
            )}
            {item.id === 'schemes' && (
              <>
                <FeatureHint icon="📋" text="Easy apply" />
                <FeatureHint icon="🔔" text="New scheme alerts" />
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={onboardStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={slides[currentIndex].gradient[0]} />

      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={[onboardStyles.skipButton, { top: insets.top + 12 }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={onboardStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom section */}
      <View style={[onboardStyles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        {/* Page dots */}
        <View style={onboardStyles.dotsContainer}>
          {slides.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  onboardStyles.dot,
                  isActive && onboardStyles.activeDot,
                  isActive && { backgroundColor: slides[currentIndex].gradient[0] },
                ]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <Button
          title={currentIndex < slides.length - 1 ? 'Next →' : 'Choose Language →'}
          onPress={handleNext}
          size="lg"
          fullWidth
          style={onboardStyles.nextButton}
        />
      </View>
    </View>
  );
};

// ─── Feature Hint Chip ────────────────────────────────────────
const FeatureHint: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={hintStyles.container}>
    <Text style={hintStyles.icon}>{icon}</Text>
    <Text style={hintStyles.text}>{text}</Text>
  </View>
);

const hintStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    fontSize: typography.fontSize.sm,
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.medium,
  },
});

// ─── Styles ───────────────────────────────────────────────────
const onboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.xl,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.white,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    width: 28,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  nextButton: {
    borderRadius: borderRadius.lg,
  },
});

const slideStyles = StyleSheet.create({
  slide: {
    flex: 1,
  },
  gradientBg: {
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: '#000',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -40,
    right: -60,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -40,
  },
  emojiContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  slideEmoji: {
    fontSize: 52,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.white,
  },
  titleContainer: {
    marginBottom: spacing.lg,
  },
  slideSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  slideTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  slideDescription: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * 16,
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});

export default OnboardingScreen;
