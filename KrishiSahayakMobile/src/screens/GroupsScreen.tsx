// Groups Screen — Farmer groups with search, filter, join/leave
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState, Badge } from '../components/ui';
import communityService, { FarmerGroup } from '../services/communityService';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'crop-specific', label: 'Crops', icon: '🌾' },
  { value: 'location-based', label: 'Location', icon: '📍' },
  { value: 'equipment-sharing', label: 'Equipment', icon: '🚜' },
  { value: 'market-intelligence', label: 'Market', icon: '💰' },
  { value: 'general', label: 'General', icon: '💡' },
];

export const GroupsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [groups, setGroups] = useState<FarmerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'crop-specific', privacy: 'public' as 'public' | 'private', tags: '' });
  const currentUserId = 'user1';

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await communityService.getGroups();
    setGroups(data);
    setLoading(false);
  };

  const handleJoin = async (id: string) => {
    await communityService.joinGroup(id, currentUserId);
    await load();
  };

  const handleLeave = async (id: string) => {
    await communityService.leaveGroup(id, currentUserId);
    await load();
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.description.trim()) return;
    await communityService.createGroup({
      ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdBy: currentUserId, createdByName: 'You',
    });
    setShowCreate(false);
    setForm({ name: '', description: '', category: 'crop-specific', privacy: 'public', tags: '' });
    await load();
  };

  const filtered = groups.filter(g => {
    if (filterCat !== 'all' && g.category !== filterCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const isMember = (g: FarmerGroup) => g.members.includes(currentUserId);

  return (
    <View style={styles.container}>
      <Header title="Farmer Groups" subtitle="किसान समूह" onBack={() => navigation.goBack()}
        rightAction={<TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}><Text style={styles.addBtnText}>+ Create</Text></TouchableOpacity>}
      />

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Search groups..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={setSearch} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <FlatList horizontal data={CATEGORIES} keyExtractor={c => c.value} showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.chip, filterCat === item.value && styles.chipActive]} onPress={() => setFilterCat(item.value)}>
              <Text style={styles.chipIcon}>{item.icon}</Text>
              <Text style={[styles.chipText, filterCat === item.value && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList data={filtered} keyExtractor={g => g.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="👥" title="No groups found" description="Try a different search or create a new group" />}
        renderItem={({ item }) => {
          const member = isMember(item);
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })} activeOpacity={0.7}>
              <View style={styles.cardTop}>
                <View style={styles.cardBanner}>
                  <Text style={styles.cardBannerIcon}>👥</Text>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                </View>
                <Badge label={item.privacy === 'private' ? '🔒 Private' : '🌍 Public'} variant={item.privacy === 'private' ? 'warning' : 'info'} size="sm" />
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.cardTags}>
                {item.tags.slice(0, 3).map((t, i) => <Badge key={i} label={`#${t}`} variant="neutral" size="sm" />)}
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.cardStats}>
                  <Text style={styles.stat}>👤 {item.members.length}</Text>
                  <Text style={styles.stat}>📝 {item.posts}</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, member && styles.actionBtnActive]} onPress={() => member ? handleLeave(item.id) : handleJoin(item.id)}>
                  <Text style={[styles.actionText, member && styles.actionTextActive]}>{member ? 'Leave' : 'Join'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Create Group</Text><TouchableOpacity onPress={() => setShowCreate(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Group Name *</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({...form, name: v})} placeholder="e.g. Wheat Farmers" />
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={v => setForm({...form, description: v})} placeholder="What is this group about?" multiline />
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                  <TouchableOpacity key={c.value} style={[styles.catChip, form.category === c.value && styles.catChipActive]} onPress={() => setForm({...form, category: c.value})}>
                    <Text style={styles.catChipIcon}>{c.icon}</Text><Text style={[styles.catChipText, form.category === c.value && styles.catChipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput style={styles.input} value={form.tags} onChangeText={v => setForm({...form, tags: v})} placeholder="wheat, punjab, rabi" />
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}><Text style={styles.submitText}>Create Group</Text></TouchableOpacity>
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
  searchRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.white },
  searchInput: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 40, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  filterRow: { paddingVertical: spacing.sm, paddingLeft: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: 4 },
  chipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  chipIcon: { fontSize: 12 },
  chipText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardBanner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardBannerIcon: { fontSize: 16 },
  cardCategory: { fontSize: typography.fontSize.xs, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: typography.fontWeight.semibold },
  cardName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  cardDesc: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  cardStats: { flexDirection: 'row', gap: spacing.md },
  stat: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  actionBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  actionBtnActive: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  actionText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.white },
  actionTextActive: { color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModal: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  modalBody: { padding: spacing.xl },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 4 },
  catChipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  catChipIcon: { fontSize: 14 },
  catChipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  catChipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  submitText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
});

export default GroupsScreen;
