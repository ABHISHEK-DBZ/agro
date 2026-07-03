// Grievances Screen — File & track complaints
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Modal, FlatList, Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState, Badge } from '../components/ui';
import grievanceService, { Grievance, GrievanceCategory } from '../services/grievanceService';

const CATEGORIES: { value: GrievanceCategory; icon: string }[] = [
  { value: 'Crop Disease', icon: '🦠' }, { value: 'Market Price', icon: '💰' },
  { value: 'Government Scheme', icon: '🏛️' }, { value: 'Weather Information', icon: '🌤️' },
  { value: 'Irrigation', icon: '💧' }, { value: 'Pest Control', icon: '🐛' },
  { value: 'Seed Quality', icon: '🌱' }, { value: 'App Issue', icon: '📱' },
  { value: 'Other', icon: '📝' },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  'Pending': { label: 'Pending', color: '#D97706', bg: '#FEF3C7', icon: '⏳' },
  'In Progress': { label: 'In Progress', color: '#3B82F6', bg: '#DBEAFE', icon: '🔄' },
  'Resolved': { label: 'Resolved', color: '#059669', bg: '#D1FAE5', icon: '✅' },
  'Reopened': { label: 'Reopened', color: '#DC2626', bg: '#FEE2E2', icon: '🔄' },
};

export const GrievancesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<GrievanceCategory | 'All'>('All');
  const [form, setForm] = useState({ category: 'Other' as GrievanceCategory, description: '', name: '', phone: '', village: '', district: '', state: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await grievanceService.getGrievances('user1');
    setGrievances(data);
    setLoading(false);
  };

  const submit = async () => {
    if (!form.description.trim()) return;
    await grievanceService.submitGrievance({ userId: 'user1', ...form, email: '', location: { village: form.village, district: form.district, state: form.state } });
    setShowForm(false);
    setForm({ category: 'Other', description: '', name: '', phone: '', village: '', district: '', state: '' });
    await load();
  };

  const filtered = filter === 'All' ? grievances : grievances.filter(g => g.category === filter);

  return (
    <View style={styles.container}>
      <Header title="Grievances" subtitle="शिकायत प्रबंधन" onBack={() => navigation.goBack()}
        rightAction={<TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}><Text style={styles.addBtnText}>+ New</Text></TouchableOpacity>}
      />

      {/* Category Filter */}
      <View style={styles.filterRow}>
        <FlatList horizontal data={[{ value: 'All', icon: '📋' }, ...CATEGORIES]} keyExtractor={c => c.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.chip, filter === item.value && styles.chipActive]} onPress={() => setFilter(item.value as any)}>
              <Text style={styles.chipIcon}>{item.icon}</Text>
              <Text style={[styles.chipText, filter === item.value && styles.chipTextActive]}>{item.value === 'All' ? 'All' : item.value}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? null : (
        <FlatList data={filtered} keyExtractor={g => g.id} contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="📭" title="No complaints" description="Tap + New to file a complaint" />}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status];
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardId}>#{item.complaintId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                      <Text style={styles.statusIcon}>{meta.icon}</Text>
                      <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>
                  <Badge label={item.category} variant="neutral" size="sm" />
                </View>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>📅 {new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
                  {item.location.district ? <Text style={styles.metaText}>📍 {item.location.district}, {item.location.state}</Text> : null}
                </View>
                {item.adminResponse ? (
                  <View style={styles.responseBox}>
                    <Text style={styles.responseLabel}>Admin Response:</Text>
                    <Text style={styles.responseText}>{item.adminResponse}</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}

      {/* New Complaint Form */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📝 New Complaint</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Enter your name" />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} placeholder="Phone number" keyboardType="phone-pad" />

              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c.value} style={[styles.catChip, form.category === c.value && styles.catChipActive]} onPress={() => setForm({ ...form, category: c.value })}>
                    <Text style={styles.catChipIcon}>{c.icon}</Text>
                    <Text style={[styles.catChipText, form.category === c.value && styles.catChipTextActive]}>{c.value}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput style={[styles.input, styles.inputMultiline]} value={form.description} onChangeText={v => setForm({ ...form, description: v })} placeholder="Describe your complaint in detail..." multiline numberOfLines={4} />

              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.locationRow}>
                <TextInput style={[styles.input, { flex: 1 }]} value={form.village} onChangeText={v => setForm({ ...form, village: v })} placeholder="Village" />
                <TextInput style={[styles.input, { flex: 1 }]} value={form.district} onChangeText={v => setForm({ ...form, district: v })} placeholder="District" />
              </View>
              <TextInput style={styles.input} value={form.state} onChangeText={v => setForm({ ...form, state: v })} placeholder="State" />

              <TouchableOpacity style={styles.submitBtn} onPress={submit}>
                <Text style={styles.submitText}>📮 Submit Complaint</Text>
              </TouchableOpacity>
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
  filterRow: { paddingVertical: spacing.sm, paddingLeft: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: 4 },
  chipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  chipIcon: { fontSize: 12 },
  chipText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardId: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, fontFamily: 'monospace' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, gap: 4 },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
  cardDesc: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  cardMeta: { flexDirection: 'row', gap: spacing.md },
  metaText: { fontSize: typography.fontSize.xs, color: colors.textTertiary },
  responseBox: { backgroundColor: colors.primaryFaded, padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.sm },
  responseLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.primary, marginBottom: spacing.xs },
  responseText: { fontSize: typography.fontSize.sm, color: colors.primaryDark },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModal: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  modalBody: { padding: spacing.xl },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  catScroll: { marginBottom: spacing.sm },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 4 },
  catChipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  catChipIcon: { fontSize: 14 },
  catChipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  catChipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  locationRow: { flexDirection: 'row', gap: spacing.sm },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.lg },
  submitText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
});

export default GrievancesScreen;
