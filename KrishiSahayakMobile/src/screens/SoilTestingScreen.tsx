// Soil Testing Screen — Track & analyze soil health with local storage
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { LoadingSpinner, ErrorView, EmptyState, Badge } from '../components/ui';
import storageService, { KEYS } from '../services/storage';

// Types
interface SoilTestRecord {
  id: string;
  fieldName: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon: number;
  createdAt: string;
}

type NutrientLevel = 'low' | 'optimal' | 'high';
type HealthStatus = 'excellent' | 'good' | 'needsImprovement';

const STORAGE_KEY = '@krishi_soil_tests';

// Analysis helpers
function classifyPh(ph: number): NutrientLevel {
  if (ph < 6.0) return 'low';
  if (ph > 7.5) return 'high';
  return 'optimal';
}

function classifyNutrient(value: number, lowThreshold: number): NutrientLevel {
  if (value < lowThreshold) return 'low';
  if (value > lowThreshold * 1.4) return 'high';
  return 'optimal';
}

function computeHealth(ph: number, n: number, p: number, k: number, oc: number): HealthStatus {
  const issues = [
    ph < 6.0 || ph > 7.5,
    n < 280,
    p < 22,
    k < 140,
    oc < 0.5,
  ].filter(Boolean).length;
  if (issues === 0) return 'excellent';
  if (issues <= 2) return 'good';
  return 'needsImprovement';
}

function buildRecommendations(ph: number, n: number, p: number, k: number, oc: number): string[] {
  const recs: string[] = [];
  if (ph < 6.0) recs.push('🟠 Soil is acidic. Add lime (1-2 tons/hectare) to raise pH.');
  else if (ph > 7.5) recs.push('🟠 Soil is alkaline. Add gypsum or organic matter to lower pH.');
  else recs.push('✅ pH is optimal for most crops.');
  if (n < 280) recs.push('🔴 Nitrogen low — apply urea or DAP. Target 280+ mg/kg.');
  if (p < 22) recs.push('🔴 Phosphorus low — apply SSP or DAP. Target 22+ mg/kg.');
  if (k < 140) recs.push('🔴 Potassium low — apply MOP. Target 140+ mg/kg.');
  if (oc < 0.5) recs.push('🟡 Organic carbon low — add FYM 10-15 tons/hectare.');
  if (recs.length <= 1) recs.push('🌱 Soil is healthy! Maintain with regular organic manure application.');
  return recs;
}

function getHealthEmoji(status: HealthStatus): string {
  switch (status) {
    case 'excellent': return '🌟';
    case 'good': return '👍';
    case 'needsImprovement': return '⚠️';
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export const SoilTestingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tests, setTests] = useState<SoilTestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<SoilTestRecord | null>(null);

  // Form state
  const [fieldName, setFieldName] = useState('');
  const [ph, setPh] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');

  // Load saved tests
  React.useEffect(() => {
    const load = async () => {
      const saved = await storageService.getItem<SoilTestRecord[]>(STORAGE_KEY);
      if (saved) setTests(saved);
      setLoading(false);
    };
    load();
  }, []);

  const saveTests = useCallback(async (updated: SoilTestRecord[]) => {
    setTests(updated);
    await storageService.setItem(STORAGE_KEY, updated);
  }, []);

  const resetForm = () => {
    setFieldName('');
    setPh('');
    setNitrogen('');
    setPhosphorus('');
    setPotassium('');
    setOrganicCarbon('');
  };

  const handleSubmit = async () => {
    const phNum = parseFloat(ph);
    const nNum = parseFloat(nitrogen);
    const pNum = parseFloat(phosphorus);
    const kNum = parseFloat(potassium);
    const ocNum = parseFloat(organicCarbon);

    if (!fieldName.trim() || isNaN(phNum) || isNaN(nNum) || isNaN(pNum) || isNaN(kNum) || isNaN(ocNum)) return;
    if (phNum < 0 || phNum > 14) return;

    const record: SoilTestRecord = {
      id: `soil_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fieldName: fieldName.trim(),
      ph: phNum,
      nitrogen: nNum,
      phosphorus: pNum,
      potassium: kNum,
      organicCarbon: ocNum,
      createdAt: new Date().toISOString(),
    };

    const updated = [record, ...tests];
    await saveTests(updated);
    setShowForm(false);
    resetForm();
  };

  const deleteTest = async (id: string) => {
    const updated = tests.filter(t => t.id !== id);
    await saveTests(updated);
  };

  const clearAll = async () => {
    await saveTests([]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Soil Testing"
        subtitle="Track & analyze your soil health"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <LoadingSpinner fullScreen message="Loading soil tests..." />
      ) : tests.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <EmptyState
            icon="🌱"
            title="No soil tests yet"
            description="Add your first soil test to get personalized recommendations for your field"
          />
          <TouchableOpacity style={styles.addLargeButton} onPress={() => setShowForm(true)}>
            <Text style={styles.addLargeButtonText}>+ Add Soil Test</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={tests}
          keyExtractor={t => t.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const health = computeHealth(item.ph, item.nitrogen, item.phosphorus, item.potassium, item.organicCarbon);
            const recs = buildRecommendations(item.ph, item.nitrogen, item.phosphorus, item.potassium, item.organicCarbon);
            return (
              <TouchableOpacity style={styles.card} onPress={() => setSelectedTest(item)} activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardIcon}>🌱</Text>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardField}>{item.fieldName}</Text>
                      <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                  </View>
                  <Badge
                    label={`${getHealthEmoji(health)} ${health === 'excellent' ? 'Excellent' : health === 'good' ? 'Good' : 'Needs Work'}`}
                    variant={health === 'excellent' ? 'success' : health === 'good' ? 'info' : 'warning'}
                    size="sm"
                  />
                </View>

                {/* NPK Grid */}
                <View style={styles.npkGrid}>
                  <NPKTile label="pH" value={item.ph.toFixed(1)} level={classifyPh(item.ph)} />
                  <NPKTile label="N" value={`${item.nitrogen}`} level={classifyNutrient(item.nitrogen, 280)} />
                  <NPKTile label="P" value={`${item.phosphorus}`} level={classifyNutrient(item.phosphorus, 22)} />
                  <NPKTile label="K" value={`${item.potassium}`} level={classifyNutrient(item.potassium, 140)} />
                  <NPKTile
                    label="OC"
                    value={`${item.organicCarbon.toFixed(1)}%`}
                    level={item.organicCarbon >= 0.5 ? 'optimal' : 'low'}
                  />
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTest(item.id)}>
                  <Text style={styles.deleteText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
              <Text style={styles.clearText}>Clear All Tests</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* New Soil Test Form */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>🧪 New Soil Test</Text>
              <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formBody}>
              <InputField label="Field Name" value={fieldName} onChange={setFieldName} placeholder="e.g., North Field" />
              <View style={styles.formRow}>
                <InputField label="pH (0-14)" value={ph} onChange={setPh} placeholder="6.5" keyboardType="decimal-pad" half />
                <InputField label="Organic Carbon %" value={organicCarbon} onChange={setOrganicCarbon} placeholder="0.5" keyboardType="decimal-pad" half />
              </View>
              <View style={styles.formRow}>
                <InputField label="Nitrogen (mg/kg)" value={nitrogen} onChange={setNitrogen} placeholder="280" keyboardType="number-pad" half />
                <InputField label="Phosphorus (mg/kg)" value={phosphorus} onChange={setPhosphorus} placeholder="22" keyboardType="number-pad" half />
              </View>
              <View style={styles.formRow}>
                <InputField label="Potassium (mg/kg)" value={potassium} onChange={setPotassium} placeholder="140" keyboardType="number-pad" half />
                <View style={{ flex: 1 }} />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>💾 Save Soil Test</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={!!selectedTest} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            {selectedTest && (
              <>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>📊 Soil Report</Text>
                  <TouchableOpacity onPress={() => setSelectedTest(null)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.formBody}>
                  <View style={styles.detailFieldRow}>
                    <Text style={styles.detailFieldLabel}>Field</Text>
                    <Text style={styles.detailFieldValue}>{selectedTest.fieldName}</Text>
                  </View>
                  <View style={styles.detailFieldRow}>
                    <Text style={styles.detailFieldLabel}>Date</Text>
                    <Text style={styles.detailFieldValue}>{formatDate(selectedTest.createdAt)}</Text>
                  </View>

                  {/* NPK Results */}
                  <View style={styles.npkGrid}>
                    <NPKTileLarge label="pH" value={selectedTest.ph.toFixed(1)} level={classifyPh(selectedTest.ph)} />
                    <NPKTileLarge label="Nitrogen" value={`${selectedTest.nitrogen} mg/kg`} level={classifyNutrient(selectedTest.nitrogen, 280)} />
                    <NPKTileLarge label="Phosphorus" value={`${selectedTest.phosphorus} mg/kg`} level={classifyNutrient(selectedTest.phosphorus, 22)} />
                    <NPKTileLarge label="Potassium" value={`${selectedTest.potassium} mg/kg`} level={classifyNutrient(selectedTest.potassium, 140)} />
                    <NPKTileLarge label="Organic Carbon" value={`${selectedTest.organicCarbon.toFixed(2)}%`} level={selectedTest.organicCarbon >= 0.5 ? 'optimal' : 'low'} />
                  </View>

                  {/* Recommendations */}
                  <View style={styles.recsSection}>
                    <Text style={styles.recsTitle}>💡 Recommendations</Text>
                    {buildRecommendations(
                      selectedTest.ph, selectedTest.nitrogen,
                      selectedTest.phosphorus, selectedTest.potassium,
                      selectedTest.organicCarbon
                    ).map((rec, i) => (
                      <Text key={i} style={styles.recText}>{rec}</Text>
                    ))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ===== Helper Components =====

const NPKTile: React.FC<{ label: string; value: string; level: NutrientLevel }> = ({ label, value, level }) => {
  const bg = level === 'optimal' ? colors.primaryFaded : level === 'high' ? '#FEF3C7' : '#FEE2E2';
  const fg = level === 'optimal' ? colors.primary : level === 'high' ? colors.warning : colors.error;
  return (
    <View style={[styles.npkTile, { backgroundColor: bg }]}>
      <Text style={[styles.npkLabel, { color: fg }]}>{label}</Text>
      <Text style={[styles.npkValue, { color: fg }]}>{value}</Text>
    </View>
  );
};

const NPKTileLarge: React.FC<{ label: string; value: string; level: NutrientLevel }> = ({ label, value, level }) => {
  const bg = level === 'optimal' ? colors.primaryFaded : level === 'high' ? '#FEF3C7' : '#FEE2E2';
  const fg = level === 'optimal' ? colors.primary : level === 'high' ? colors.warning : colors.error;
  return (
    <View style={[styles.npkTileLarge, { backgroundColor: bg }]}>
      <Text style={[styles.npkLabel, { color: fg }]}>{label}</Text>
      <Text style={[styles.npkValueLarge, { color: fg }]}>{value}</Text>
      <Text style={[styles.npkStatus, { color: fg }]}>
        {level === 'optimal' ? '✅ Optimal' : level === 'high' ? '⬆️ High' : '⬇️ Low'}
      </Text>
    </View>
  );
};

const InputField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any; half?: boolean;
}> = ({ label, value, onChange, placeholder, keyboardType, half }) => (
  <View style={[half ? { flex: 1 } : { marginBottom: spacing.md }]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      keyboardType={keyboardType || 'default'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  addButtonText: { fontSize: typography.fontSize.sm, color: colors.textInverse, fontWeight: typography.fontWeight.semibold },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  addLargeButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md, marginTop: spacing.lg,
  },
  addLargeButtonText: { color: colors.white, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardIcon: { fontSize: 24, marginRight: spacing.md },
  cardInfo: { flex: 1 },
  cardField: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  cardDate: { fontSize: typography.fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  npkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  npkTile: {
    minWidth: '18%', flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm, alignItems: 'center',
  },
  npkLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, marginBottom: 2 },
  npkValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  npkTileLarge: { width: '48%', padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: spacing.sm },
  npkValueLarge: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginVertical: spacing.xs },
  npkStatus: { fontSize: typography.fontSize.xs },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteText: { fontSize: typography.fontSize.sm, color: colors.error },
  clearButton: { alignItems: 'center', padding: spacing.lg },
  clearText: { fontSize: typography.fontSize.sm, color: colors.error, fontWeight: typography.fontWeight.medium },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModal: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  formTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  formBody: { padding: spacing.xl },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, fontSize: typography.fontSize.md, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  formRow: { flexDirection: 'row', gap: spacing.md },
  saveButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md,
    alignItems: 'center', marginTop: spacing.md,
  },
  saveButtonText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
  // Detail
  detailFieldRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.sm },
  detailFieldLabel: { fontSize: typography.fontSize.md, color: colors.textSecondary },
  detailFieldValue: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
  recsSection: { backgroundColor: colors.primaryFaded, padding: spacing.lg, borderRadius: borderRadius.md, marginTop: spacing.md },
  recsTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary, marginBottom: spacing.md },
  recText: { fontSize: typography.fontSize.sm, color: colors.primaryDark, lineHeight: 22, marginBottom: spacing.xs },
});

export default SoilTestingScreen;
