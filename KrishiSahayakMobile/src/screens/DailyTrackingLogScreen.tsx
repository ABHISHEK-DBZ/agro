// Daily Tracking Log — Log daily farm activities
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Modal, Switch,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState, Badge } from '../components/ui';
import storageService from '../services/storage';

interface DailyLogEntry {
  id: string;
  date: string;
  cropType: string;
  activities: { watering: boolean; fertilizer: string; pesticide: string; harvesting: boolean; planting: boolean; weeding: boolean; other: string };
  weather: { temperature: string; condition: string };
  health: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

const STORAGE_KEY = '@krishi_daily_logs';

export const DailyTrackingLogScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DailyLogEntry>({
    id: '', date: new Date().toISOString().slice(0, 10), cropType: '', activities: { watering: false, fertilizer: '', pesticide: '', harvesting: false, planting: false, weeding: false, other: '' },
    weather: { temperature: '25', condition: 'sunny' }, health: 'good', notes: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await storageService.getItem<DailyLogEntry[]>(STORAGE_KEY);
    if (data) setLogs(data);
  };

  const save = useCallback(async () => {
    const entry = { ...form, id: `log_${Date.now()}` };
    const updated = [entry, ...logs];
    setLogs(updated);
    await storageService.setItem(STORAGE_KEY, updated);
    setShowForm(false);
    setForm({ id: '', date: new Date().toISOString().slice(0, 10), cropType: '', activities: { watering: false, fertilizer: '', pesticide: '', harvesting: false, planting: false, weeding: false, other: '' }, weather: { temperature: '25', condition: 'sunny' }, health: 'good', notes: '' });
  }, [form, logs]);

  const healthColors: Record<string, string> = { excellent: '#059669', good: '#3B82F6', fair: '#D97706', poor: '#DC2626' };

  return (
    <View style={styles.container}>
      <Header title="Daily Tracking" subtitle="दैनिक ट्रैकिंग" onBack={() => navigation.goBack()}
        rightAction={<TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}><Text style={styles.addBtnText}>+ Add</Text></TouchableOpacity>}
      />
      <ScrollView contentContainerStyle={styles.list}>
        {logs.length === 0 ? (
          <EmptyState icon="📋" title="No entries yet" description="Start tracking your daily farming activities" />
        ) : logs.map(log => (
          <View key={log.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardDate}>📅 {new Date(log.date).toLocaleDateString('en-IN')}</Text>
              <Badge label={log.health} variant={log.health === 'excellent' || log.health === 'good' ? 'success' : log.health === 'fair' ? 'warning' : 'error'} size="sm" />
            </View>
            {log.cropType ? <Text style={styles.cardCrop}>🌾 {log.cropType}</Text> : null}
            <View style={styles.activities}>
              {log.activities.watering && <Badge label="💧 Watered" variant="info" size="sm" />}
              {log.activities.fertilizer ? <Badge label={`🧪 ${log.activities.fertilizer}`} variant="success" size="sm" /> : null}
              {log.activities.pesticide ? <Badge label={`🛡️ ${log.activities.pesticide}`} variant="warning" size="sm" /> : null}
              {log.activities.weeding && <Badge label="🌾 Weeded" variant="neutral" size="sm" />}
              {log.activities.harvesting && <Badge label="🌾 Harvesting" variant="premium" size="sm" />}
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.meta}>🌤️ {log.weather.condition}, {log.weather.temperature}°C</Text>
            </View>
            {log.notes ? <Text style={styles.notes}>{log.notes}</Text> : null}
          </View>
        ))}
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>📝 New Entry</Text><TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} value={form.date} onChangeText={v => setForm({...form, date: v})} placeholder="YYYY-MM-DD" />
              <Text style={styles.inputLabel}>Crop Type</Text>
              <TextInput style={styles.input} value={form.cropType} onChangeText={v => setForm({...form, cropType: v})} placeholder="e.g. Wheat, Rice" />
              <Text style={styles.inputLabel}>Activities</Text>
              <View style={styles.activityRow}>
                <View style={styles.toggleItem}><Text style={styles.toggleLabel}>💧 Watering</Text><Switch value={form.activities.watering} onValueChange={v => setForm({...form, activities: {...form.activities, watering: v}})} /></View>
                <View style={styles.toggleItem}><Text style={styles.toggleLabel}>🌾 Planting</Text><Switch value={form.activities.planting} onValueChange={v => setForm({...form, activities: {...form.activities, planting: v}})} /></View>
                <View style={styles.toggleItem}><Text style={styles.toggleLabel}>🌾 Weeding</Text><Switch value={form.activities.weeding} onValueChange={v => setForm({...form, activities: {...form.activities, weeding: v}})} /></View>
                <View style={styles.toggleItem}><Text style={styles.toggleLabel}>🌾 Harvesting</Text><Switch value={form.activities.harvesting} onValueChange={v => setForm({...form, activities: {...form.activities, harvesting: v}})} /></View>
              </View>
              <Text style={styles.inputLabel}>Fertilizer Used</Text>
              <TextInput style={styles.input} value={form.activities.fertilizer} onChangeText={v => setForm({...form, activities: {...form.activities, fertilizer: v}})} placeholder="e.g. Urea 25kg" />
              <Text style={styles.inputLabel}>Pesticide Used</Text>
              <TextInput style={styles.input} value={form.activities.pesticide} onChangeText={v => setForm({...form, activities: {...form.activities, pesticide: v}})} placeholder="e.g. Neem oil" />
              <Text style={styles.inputLabel}>Crop Health</Text>
              <View style={styles.healthRow}>
                {['excellent', 'good', 'fair', 'poor'].map(h => (
                  <TouchableOpacity key={h} style={[styles.healthChip, form.health === h && { backgroundColor: healthColors[h] + '20', borderColor: healthColors[h] }]} onPress={() => setForm({...form, health: h as any})}>
                    <Text style={[styles.healthText, form.health === h && { color: healthColors[h], fontWeight: typography.fontWeight.bold }]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Weather</Text>
              <View style={styles.weatherRow}>
                <TextInput style={[styles.input, { flex: 1 }]} value={form.weather.temperature} onChangeText={v => setForm({...form, weather: {...form.weather, temperature: v}})} placeholder="Temp °C" keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1 }]} value={form.weather.condition} onChangeText={v => setForm({...form, weather: {...form.weather, condition: v}})} placeholder="sunny/rainy/cloudy" />
              </View>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.input, styles.inputMultiline]} value={form.notes} onChangeText={v => setForm({...form, notes: v})} placeholder="Observations, concerns, plans..." multiline />
              <TouchableOpacity style={styles.submitBtn} onPress={save}><Text style={styles.submitText}>💾 Save Entry</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  addBtnText: { fontSize: typography.fontSize.sm, color: colors.textInverse, fontWeight: typography.fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardDate: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  cardCrop: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.sm },
  activities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  cardMeta: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  meta: { fontSize: typography.fontSize.xs, color: colors.textTertiary },
  notes: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 18, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModal: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  modalBody: { padding: spacing.xl },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  activityRow: { gap: spacing.sm, marginBottom: spacing.sm },
  toggleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: typography.fontSize.md, color: colors.textPrimary },
  healthRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  healthChip: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  healthText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textTransform: 'capitalize' },
  weatherRow: { flexDirection: 'row', gap: spacing.sm },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  submitText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
});

export default DailyTrackingLogScreen;
