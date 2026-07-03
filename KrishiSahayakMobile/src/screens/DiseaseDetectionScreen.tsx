// Disease Detection Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { Button, Card, Badge, LoadingSpinner } from '../components/ui';

interface DiseaseDetectionScreenProps {
  navigation: any;
}

interface DetectionResult {
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  cropName: string;
  description: string;
  symptoms: string[];
  treatment: string[];
  organicControl: string[];
  chemicalControl: string[];
}

const MOCK_RESULTS: Record<string, DetectionResult> = {
  'rice_blast': {
    diseaseName: 'Rice Blast (धान का झुलसा रोग)',
    confidence: 94.5,
    severity: 'critical',
    cropName: 'Rice',
    description: 'A fungal disease caused by Magnaporthe oryzae that affects leaves, nodes, and panicles of rice plants.',
    symptoms: [
      'Diamond-shaped lesions with gray centers and brown margins on leaves',
      'White-gray spore masses on lesions during humid weather',
      'Infected nodes turn black and break easily',
      'Panicle blast causes white or empty grains',
    ],
    treatment: [
      'Remove and destroy infected plant debris after harvest',
      'Use resistant varieties like CR Dhan 307, Pusa Basmati 1',
      'Avoid excessive nitrogen fertilizer application',
      'Maintain proper plant spacing for air circulation',
    ],
    organicControl: [
      'Apply neem oil (5ml/L) every 7-10 days',
      'Use Trichoderma harzianum as biocontrol agent',
      'Apply Pseudomonas fluorescens (10g/L) as foliar spray',
      'Use vermicompost enriched with biocontrol agents',
    ],
    chemicalControl: [
      'Spray Tricyclazole (0.1%) at first appearance',
      'Apply Carbendazim (0.1%) or Mancozeb (0.2%)',
      'Use Isoprothiolane (0.1%) for severe infection',
      'Repeat spray after 10-15 days if needed',
    ],
  },
  'wheat_rust': {
    diseaseName: 'Wheat Rust (गेहूं का किट्ट रोग)',
    confidence: 91.2,
    severity: 'high',
    cropName: 'Wheat',
    description: 'A fungal disease (Puccinia spp.) causing rust-colored pustules on leaves, stems, and grains of wheat plants.',
    symptoms: [
      'Orange-brown pustules on leaves (leaf rust)',
      'Black elongated pustules on stems (stem rust)',
      'Yellow-orange stripes on leaves (stripe rust)',
      'Premature leaf death and reduced grain filling',
    ],
    treatment: [
      'Plant resistant varieties like PBW 343, HD 2967',
      'Avoid late sowing of wheat',
      'Remove volunteer wheat plants',
      'Rotate crops with non-host crops',
    ],
    organicControl: [
      'Spray garlic-pepper solution (10ml/L)',
      'Apply sulfur-based organic fungicides',
      'Use compost tea as foliar spray',
      'Grow trap crops around field borders',
    ],
    chemicalControl: [
      'Apply Propiconazole (0.1%) at first sign',
      'Use Tebuconazole (0.1%) or Hexaconazole (0.1%)',
      'Spray Mancozeb (0.25%) as protectant',
      'Repeat treatment every 10-14 days in severe cases',
    ],
  },
};

export const DiseaseDetectionScreen: React.FC<DiseaseDetectionScreenProps> = ({ navigation }) => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Tomato', 'Onion'];

  const startAnalysis = () => {
    setAnalyzing(true);
    setResult(null);

    // Simulate AI analysis
    setTimeout(() => {
      const mockResult = selectedCrop === 'Rice' ? MOCK_RESULTS.rice_blast : MOCK_RESULTS.wheat_rust;
      setResult(mockResult);
      setAnalyzing(false);
    }, 2000);
  };

  const resetDetection = () => {
    setResult(null);
    setImageUri(null);
    setSelectedCrop('');
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'low': return colors.success;
      case 'moderate': return colors.warning;
      case 'high': return colors.error;
      case 'critical': return '#7C3AED';
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Disease Detection"
        subtitle="Identify crop diseases"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🔬</Text>
              <Text style={styles.infoTitle}>AI Disease Detection</Text>
              <Text style={styles.infoText}>
                Upload a photo of affected leaves, stems, or fruits and our AI will identify the disease and suggest treatments.
              </Text>
            </View>

            {/* Crop Selection */}
            <Text style={styles.sectionTitle}>Select Crop</Text>
            <View style={styles.cropGrid}>
              {crops.map(crop => (
                <TouchableOpacity
                  key={crop}
                  style={[
                    styles.cropButton,
                    selectedCrop === crop && styles.cropButtonSelected,
                  ]}
                  onPress={() => setSelectedCrop(crop)}
                >
                  <Text style={[
                    styles.cropButtonText,
                    selectedCrop === crop && styles.cropButtonTextSelected,
                  ]}>
                    {crop === 'Rice' ? '🌾 ' : crop === 'Wheat' ? '🌾 ' : crop === 'Cotton' ? '🌿 ' : crop === 'Sugarcane' ? '🎋 ' : crop === 'Tomato' ? '🍅 ' : '🧅 '}
                    {crop}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Image Upload */}
            <View style={styles.uploadSection}>
              {imageUri ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => setImageUri(null)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadIcon}>📸</Text>
                  <Text style={styles.uploadText}>Tap to take a photo or upload from gallery</Text>
                </View>
              )}
            </View>

            <Button
              title={analyzing ? 'Analyzing...' : 'Analyze Disease'}
              onPress={startAnalysis}
              loading={analyzing}
              disabled={!selectedCrop}
              fullWidth
              size="lg"
            />
          </>
        ) : (
          <>
            {/* Result Header */}
            <View style={styles.resultHeader}>
              <View style={styles.resultIconContainer}>
                <Text style={styles.resultIcon}>🔍</Text>
              </View>
              <Text style={styles.resultTitle}>Detection Result</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {result.confidence.toFixed(1)}% Confidence
                </Text>
              </View>
            </View>

            {/* Disease Info */}
            <View style={styles.resultCard}>
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseName}>{result.diseaseName}</Text>
                <Badge
                  label={result.severity.toUpperCase()}
                  variant={result.severity === 'critical' ? 'error' : result.severity === 'high' ? 'warning' : 'info'}
                />
              </View>
              <Text style={styles.cropTag}>Affects: {result.cropName}</Text>
              <Text style={styles.diseaseDescription}>{result.description}</Text>
            </View>

            {/* Symptoms */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              {result.symptoms.map((s, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Organic Control */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌿 Organic Control</Text>
              {result.organicControl.map((t, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Chemical Control */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧪 Chemical Control</Text>
              {result.chemicalControl.map((t, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerIcon}>⚠️</Text>
              <Text style={styles.disclaimerText}>
                This is an AI-assisted detection. For accurate diagnosis, please consult a local agricultural expert or Krishi Vigyan Kendra.
              </Text>
            </View>

            <Button
              title="Detect Another"
              variant="outline"
              onPress={resetDetection}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.lg }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.primaryFaded,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cropButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cropButtonSelected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  cropButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  cropButtonTextSelected: {
    color: colors.primary,
  },
  uploadSection: {
    marginVertical: spacing.md,
  },
  imagePreview: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.white,
    fontSize: 16,
  },
  uploadPlaceholder: {
    height: 200,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  resultHeader: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  resultIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultIcon: {
    fontSize: 32,
  },
  resultTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  confidenceBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  confidenceText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  resultCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  diseaseName: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  cropTag: {
    fontSize: typography.fontSize.sm,
    color: colors.info,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  diseaseDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  bullet: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  listText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: '#92400E',
    lineHeight: 18,
  },
});

export default DiseaseDetectionScreen;
