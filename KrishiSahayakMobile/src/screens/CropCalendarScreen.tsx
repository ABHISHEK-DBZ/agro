// Crop Calendar Screen — Plan & track farming activities with local storage
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Switch,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { LoadingSpinner, EmptyState, Badge } from '../components/ui';
import storageService from '../services/storage';

// Types
type Season = 'kharif' | 'rabi' | 'zaid' | 'annual';
type Activity = 'sowing' | 'irrigation' | 'fertilization' | 'pest-control' | 'weeding' | 'harvesting' | 'other';
type Status = 'pending' | 'completed' | 'missed';

interface CropEvent {
  id: string;
  crop: string;
  activity: Activity;
  date: string;
  season: Season;
  status: Status;
  notes: string;
  createdAt: number;
}

const STORAGE_KEY = '@krishi_crop_calendar';

const CROP_OPTIONS = [
  { value: 'rice', label: 'Rice (चावल)', icon: '🌾' },
  { value: 'wheat', label: 'Wheat (गेहूं)', icon: '🌾' },
  { value: 'maize', label: 'Maize (मक्का)', icon: '🌽' },
  { value: 'cotton', label: 'Cotton (कपास)', icon: '🌿' },
  { value: 'sugarcane', label: 'Sugarcane (गन्ना)', icon: '🎋' },
  { value: 'soybean', label: 'Soybean (सोयाबीन)', icon: '🌱' },
  { value: 'mustard', label: 'Mustard (सरसों)', icon: '🌼' },
  { value: 'potato', label: 'Potato (आलू)', icon: '🥔' },
  { value: 'onion', label: 'Onion (प्याज)', icon: '🧅' },
  { value: 'tomato', label: 'Tomato (टमाटर)', icon: '🍅' },
  { value: 'chickpea', label: 'Chickpea (चना)', icon: '🫘' },
  { value: 'groundnut', label: 'Groundnut (मूंगफली)', icon: '🥜' },
  { value: 'bajra', label: 'Bajra (बाजरा)', icon: '🌾' },
  { value: 'other', label: 'Other (अन्य)', icon: '🌿' },
];

const ACTIVITY_OPTIONS: { value: Activity; label: string; icon: string }[] = [
  { value: 'sowing', label: '🌱 Sowing / बुवाई', icon: '🌱' },
  { value: 'irrigation', label: '💧 Irrigation / सिंचाई', icon: '💧' },
  { value: 'fertilization', label: '🧪 Fertilization / खाद', icon: '🧪' },
  { value: 'pest-control', label: '🛡️ Pest Control / कीट', icon: '🛡️' },
  { value: 'weeding', label: '🌾 Weeding / निराई', icon: '🌾' },
  { value: 'harvesting', label: '🌾 Harvesting / कटाई', icon: '🌾' },
  { value: 'other', label: '📝 Other / अन्य', icon: '📝' },
];

const SEASON_META: Record<Season, { label: string; shortLabel: string; icon: string; color: string }> = {
  kharif: { label: 'Kharif (Monsoon) खरीफ', shortLabel: 'Kharif', icon: '🌧️', color: '#3B82F6' },
  rabi: { label: 'Rabi (Winter) रबी', shortLabel: 'Rabi', icon: '☀️', color: '#D97706' },
  zaid: { label: 'Zaid (Summer) ज़ायद', shortLabel: 'Zaid', icon: '🌻', color: '#059669' },
  annual: { label: 'Annual वार्षिक', shortLabel: 'Annual', icon: '📅', color: '#7C3AED' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CropCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [events, setEvents] = useState<CropEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterSeason, setFilterSeason] = useState<'all' | Season>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCrop, setFormCrop] = useState('wheat');
  const [formActivity, setFormActivity] = useState<Activity>('sowing');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formSeason, setFormSeason] = useState<Season>('kharif');
  const [formStatus, setFormStatus] = useState<Status>('pending');
  const [formNotes, setFormNotes] = useState('');

  // Calendar
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Load
  React.useEffect(() => {
    const load = async () => {
      const saved = await storageService.getItem<CropEvent[]>(STORAGE_KEY);
      if (saved) setEvents(saved);
      setLoading(false);
    };
    load();
  }, []);

  const saveEvents = useCallback(async (updated: CropEvent[]) => {
    setEvents(updated);
    await storageService.setItem(STORAGE_KEY, updated);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormCrop('wheat');
    setFormActivity('sowing');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormSeason('kharif');
    setFormStatus('pending');
    setFormNotes('');
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (e: CropEvent) => {
    setEditingId(e.id);
    setFormCrop(e.crop);
    setFormActivity(e.activity);
    setFormDate(e.date);
    setFormSeason(e.season);
    setFormStatus(e.status);
    setFormNotes(e.notes);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formCrop || !formDate) return;
    if (editingId) {
      const updated = events.map(e =>
        e.id === editingId
          ? { ...e, crop: formCrop, activity: formActivity, date: formDate, season: formSeason, status: formStatus, notes: formNotes }
          : e
      );
      await saveEvents(updated);
    } else {
      const newEvent: CropEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        crop: formCrop,
        activity: formActivity,
        date: formDate,
        season: formSeason,
        status: formStatus,
        notes: formNotes,
        createdAt: Date.now(),
      };
      await saveEvents([newEvent, ...events]);
    }
    setShowForm(false);
    resetForm();
  };

  const deleteEvent = async (id: string) => {
    await saveEvents(events.filter(e => e.id !== id));
  };

  const toggleStatus = async (id: string) => {
    const updated = events.map(e => {
      if (e.id !== id) return e;
      const next: Status = e.status === 'pending' ? 'completed' : e.status === 'completed' ? 'missed' : 'pending';
      return { ...e, status: next };
    });
    await saveEvents(updated);
  };

  // Stats
  const stats = useMemo(() => ({
    total: events.length,
    completed: events.filter(e => e.status === 'completed').length,
    pending: events.filter(e => e.status === 'pending').length,
    missed: events.filter(e => e.status === 'missed').length,
  }), [events]);

  // Filter
  const filtered = useMemo(() => {
    let list = events;
    if (filterSeason !== 'all') list = list.filter(e => e.season === filterSeason);
    if (filterStatus !== 'all') list = list.filter(e => e.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.crop.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q) ||
        e.activity.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, filterSeason, filterStatus, search]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1);
    const last = new Date(calYear, calMonth + 1, 0);
    const startWeekday = first.getDay();
    const days: { date: string; inMonth: boolean }[] = [];
    for (let i = startWeekday; i > 0; i--) {
      const d = new Date(calYear, calMonth, 1 - i);
      days.push({ date: d.toISOString().slice(0, 10), inMonth: false });
    }
    for (let i = 1; i <= last.getDate(); i++) {
      const d = new Date(calYear, calMonth, i);
      days.push({ date: d.toISOString().slice(0, 10), inMonth: true });
    }
    while (days.length % 7 !== 0) {
      const lastDay = new Date(days[days.length - 1].date);
      lastDay.setDate(lastDay.getDate() + 1);
      days.push({ date: lastDay.toISOString().slice(0, 10), inMonth: false });
    }
    return days;
  }, [calMonth, calYear]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CropEvent[]> = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.container}>
      <Header
        title="Crop Calendar"
        subtitle="Plan & track farming activities"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={openNew}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statNum}>{stats.total}</Text><Text style={styles.statLabel}>Total</Text></View>
            <View style={[styles.stat, { backgroundColor: colors.primaryFaded }]}><Text style={[styles.statNum, { color: colors.primary }]}>{stats.completed}</Text><Text style={styles.statLabel}>Done</Text></View>
            <View style={[styles.stat, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.statNum, { color: colors.warning }]}>{stats.pending}</Text><Text style={styles.statLabel}>Pending</Text></View>
            <View style={[styles.stat, { backgroundColor: '#FEE2E2' }]}><Text style={[styles.statNum, { color: colors.error }]}>{stats.missed}</Text><Text style={styles.statLabel}>Missed</Text></View>
          </View>

          {/* View Toggle & Filters */}
          <View style={styles.filterRow}>
            <View style={styles.viewToggle}>
              <TouchableOpacity style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]} onPress={() => setViewMode('list')}>
                <Text style={[styles.viewBtnText, viewMode === 'list' && styles.viewBtnTextActive]}>📋 List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.viewBtn, viewMode === 'calendar' && styles.viewBtnActive]} onPress={() => setViewMode('calendar')}>
                <Text style={[styles.viewBtnText, viewMode === 'calendar' && styles.viewBtnTextActive]}>📅 Calendar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {(['all', 'kharif', 'rabi', 'zaid', 'annual'] as const).map(s => (
                <TouchableOpacity key={s} style={[styles.filterChip, filterSeason === s && styles.filterChipActive]} onPress={() => setFilterSeason(s)}>
                  <Text style={[styles.filterChipText, filterSeason === s && styles.filterChipTextActive]}>
                    {s === 'all' ? 'All' : SEASON_META[s].shortLabel}
                  </Text>
                </TouchableOpacity>
              ))}
              {(['all', 'pending', 'completed', 'missed'] as const).map(s => (
                <TouchableOpacity key={s} style={[styles.filterChip, filterStatus === s && styles.filterChipActive]} onPress={() => setFilterStatus(s)}>
                  <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search crops, activities..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />

          {viewMode === 'list' ? (
            <FlatList
              data={filtered}
              keyExtractor={e => e.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState icon="📅" title="No activities" description={events.length === 0 ? 'Tap + Add to plan your first crop activity' : 'Try adjusting filters'} />
              }
              renderItem={({ item }) => {
                const cropInfo = CROP_OPTIONS.find(c => c.value === item.crop);
                const actInfo = ACTIVITY_OPTIONS.find(a => a.value === item.activity);
                const seasonInfo = SEASON_META[item.season];
                const statusBg = item.status === 'completed' ? colors.primaryFaded : item.status === 'missed' ? '#FEE2E2' : '#FEF3C7';
                const statusFg = item.status === 'completed' ? colors.primary : item.status === 'missed' ? colors.error : colors.warning;
                return (
                  <TouchableOpacity style={styles.eventCard} onPress={() => openEdit(item)} activeOpacity={0.7}>
                    <View style={styles.eventTop}>
                      <View style={styles.eventLeft}>
                        <Text style={styles.eventCropIcon}>{cropInfo?.icon || '🌿'}</Text>
                        <View>
                          <Text style={styles.eventCrop}>{cropInfo?.label || item.crop}</Text>
                          <Text style={styles.eventActivity}>{actInfo?.label || item.activity}</Text>
                        </View>
                      </View>
                      <Badge label={item.status} variant={item.status === 'completed' ? 'success' : item.status === 'missed' ? 'error' : 'warning'} size="sm" />
                    </View>
                    <View style={styles.eventMeta}>
                      <Text style={styles.eventDate}>📅 {new Date(item.date).toLocaleDateString('en-IN')}</Text>
                      <Text style={[styles.eventSeason, { color: seasonInfo.color }]}>{seasonInfo.icon} {seasonInfo.shortLabel}</Text>
                    </View>
                    {item.notes ? <Text style={styles.eventNotes}>{item.notes}</Text> : null}
                    <View style={styles.eventActions}>
                      <TouchableOpacity onPress={() => toggleStatus(item.id)} style={styles.eventActionBtn}>
                        <Text style={styles.eventActionText}>
                          {item.status === 'completed' ? '↩️ Undo' : item.status === 'missed' ? '🔄 Reset' : '✅ Done'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteEvent(item.id)}>
                        <Text style={styles.eventDelete}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.calContainer} showsVerticalScrollIndicator={false}>
              {/* Calendar Header */}
              <View style={styles.calHeader}>
                <TouchableOpacity onPress={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}>
                  <Text style={styles.calNav}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.calTitle}>{MONTHS[calMonth]} {calYear}</Text>
                <TouchableOpacity onPress={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}>
                  <Text style={styles.calNav}>▶</Text>
                </TouchableOpacity>
              </View>

              {/* Day labels */}
              <View style={styles.calWeekdays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <Text key={d} style={styles.calWeekday}>{d.slice(0, 2)}</Text>
                ))}
              </View>

              {/* Days grid */}
              <View style={styles.calGrid}>
                {calendarDays.map(({ date, inMonth }, i) => {
                  const dayEvents = eventsByDate[date] || [];
                  const isToday = date === todayStr;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.calDay,
                        !inMonth && styles.calDayDisabled,
                        isToday && styles.calDayToday,
                      ]}
                      onPress={() => {
                        setFormDate(date);
                        openNew();
                      }}
                    >
                      <Text style={[styles.calDayNum, isToday && styles.calDayNumToday]}>
                        {new Date(date).getDate()}
                      </Text>
                      {dayEvents.slice(0, 2).map(e => (
                        <View key={e.id} style={[styles.calDot, {
                          backgroundColor: e.status === 'completed' ? colors.primary : e.status === 'missed' ? colors.error : colors.warning
                        }]} />
                      ))}
                      {dayEvents.length > 2 && <Text style={styles.calMore}>+{dayEvents.length - 2}</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                <Text style={styles.legendTitle}>Legend: </Text>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><Text style={styles.legendText}>Done</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.warning }]} /><Text style={styles.legendText}>Pending</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.error }]} /><Text style={styles.legendText}>Missed</Text></View>
              </View>
            </ScrollView>
          )}
        </>
      )}

      {/* Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Activity' : 'New Activity'}</Text>
              <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formBody}>
              <Text style={styles.inputLabel}>🌾 Crop</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                {CROP_OPTIONS.map(c => (
                  <TouchableOpacity key={c.value} style={[styles.pickerChip, formCrop === c.value && styles.pickerChipActive]} onPress={() => setFormCrop(c.value)}>
                    <Text style={[styles.pickerChipIcon]}>{c.icon}</Text>
                    <Text style={[styles.pickerChipText, formCrop === c.value && styles.pickerChipTextActive]}>{c.label.split(' (')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>📋 Activity</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                {ACTIVITY_OPTIONS.map(a => (
                  <TouchableOpacity key={a.value} style={[styles.pickerChip, formActivity === a.value && styles.pickerChipActive]} onPress={() => setFormActivity(a.value)}>
                    <Text style={styles.pickerChipIcon}>{a.icon.split(' ')[0]}</Text>
                    <Text style={[styles.pickerChipText, formActivity === a.value && styles.pickerChipTextActive]}>{a.label.split(' /')[0].replace(/[^\w\s]/g, '').trim()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>📅 Date</Text>
              <TextInput style={styles.input} value={formDate} onChangeText={setFormDate} placeholder="YYYY-MM-DD" />

              <Text style={styles.inputLabel}>🌤️ Season</Text>
              <View style={styles.seasonRow}>
                {(Object.entries(SEASON_META) as [Season, typeof SEASON_META['kharif']][]).map(([key, val]) => (
                  <TouchableOpacity key={key} style={[styles.seasonChip, formSeason === key && { borderColor: val.color, backgroundColor: val.color + '20' }]} onPress={() => setFormSeason(key)}>
                    <Text style={styles.seasonChipIcon}>{val.icon}</Text>
                    <Text style={[styles.seasonChipText, formSeason === key && { color: val.color }]}>{val.shortLabel}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>📝 Notes (optional)</Text>
              <TextInput style={[styles.input, styles.inputMultiline]} value={formNotes} onChangeText={setFormNotes} placeholder="Add notes..." multiline numberOfLines={3} />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingId ? '💾 Update' : '💾 Save Activity'}</Text>
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
  statsRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  stat: { flex: 1, backgroundColor: colors.white, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', ...shadows.sm },
  statNum: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  statLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  filterRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: borderRadius.md, padding: 2, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start' },
  viewBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.sm },
  viewBtnActive: { backgroundColor: colors.white, ...shadows.sm },
  viewBtnText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  viewBtnTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  filterBar: { paddingLeft: spacing.lg, marginBottom: spacing.sm },
  filterScroll: { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  filterChipText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  filterChipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  searchInput: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 40, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  eventCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  eventLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  eventCropIcon: { fontSize: 24 },
  eventCrop: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  eventActivity: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  eventMeta: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  eventDate: { fontSize: typography.fontSize.xs, color: colors.textTertiary },
  eventSeason: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  eventNotes: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 18 },
  eventActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm },
  eventActionBtn: {},
  eventActionText: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.medium },
  eventDelete: { fontSize: 18, padding: spacing.xs },
  // Calendar
  calContainer: { padding: spacing.lg, paddingBottom: spacing.huge },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  calNav: { fontSize: typography.fontSize.xl, color: colors.primary, padding: spacing.md },
  calTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  calWeekdays: { flexDirection: 'row', marginBottom: spacing.xs },
  calWeekday: { flex: 1, textAlign: 'center', fontSize: typography.fontSize.xs, color: colors.textTertiary, fontWeight: typography.fontWeight.semibold },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calDay: { width: '14.28%', minHeight: 60, padding: spacing.xs, borderWidth: 0.5, borderColor: colors.borderLight, justifyContent: 'flex-start', alignItems: 'center' },
  calDayDisabled: { opacity: 0.3 },
  calDayToday: { backgroundColor: colors.primaryFaded, borderColor: colors.primary, borderWidth: 1.5 },
  calDayNum: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textPrimary },
  calDayNumToday: { color: colors.primary, fontWeight: typography.fontWeight.bold },
  calDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  calMore: { fontSize: 8, color: colors.textTertiary, marginTop: 1 },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm, flexWrap: 'wrap' },
  legendTitle: { fontSize: typography.fontSize.xs, color: colors.textTertiary },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModal: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  formTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  formBody: { padding: spacing.xl },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  pickerScroll: { marginBottom: spacing.sm },
  pickerChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickerChipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  pickerChipIcon: { fontSize: 16 },
  pickerChipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  pickerChipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  seasonRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  seasonChip: { flex: 1, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  seasonChipIcon: { fontSize: 20, marginBottom: 2 },
  seasonChipText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  saveButton: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  saveButtonText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
});

export default CropCalendarScreen;
