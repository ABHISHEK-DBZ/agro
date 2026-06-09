import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon, Plus, AlertCircle, Sun, CloudRain, Sprout,
  ChevronLeft, ChevronRight, Trash2, Edit3, Check, X, Filter,
  Wheat, Flower2, Carrot, Coffee, Apple, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader, SectionTitle, Button, Badge, EmptyState, Modal, FormField, Input, Select, Textarea } from '../components/ui';
import toast from 'react-hot-toast';

type Season = 'kharif' | 'rabi' | 'zaid' | 'annual';
type Activity = 'sowing' | 'irrigation' | 'fertilization' | 'pest-control' | 'weeding' | 'harvesting' | 'other';
type Status = 'pending' | 'completed' | 'missed';

interface CropEvent {
  id: string;
  crop: string;
  activity: Activity;
  date: string; // ISO YYYY-MM-DD
  season: Season;
  status: Status;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = (uid: string) => `cropCalendar_${uid}`;

const CROP_OPTIONS = [
  { value: 'rice', label: 'Rice / चावल / तांदूळ', Icon: Sprout },
  { value: 'wheat', label: 'Wheat / गेहूं / गहू', Icon: Wheat },
  { value: 'maize', label: 'Maize / मक्का / मका', Icon: Wheat },
  { value: 'cotton', label: 'Cotton / कपास / कापूस', Icon: Flower2 },
  { value: 'sugarcane', label: 'Sugarcane / गन्ना / ऊस', Icon: Leaf },
  { value: 'soybean', label: 'Soybean / सोयाबीन / सोयाबीन', Icon: Leaf },
  { value: 'mustard', label: 'Mustard / सरसों / मोहरी', Icon: Flower2 },
  { value: 'potato', label: 'Potato / आलू / बटाटा', Icon: Apple },
  { value: 'onion', label: 'Onion / प्याज / कांदा', Icon: Carrot },
  { value: 'tomato', label: 'Tomato / टमाटर / टोमॅटो', Icon: Apple },
  { value: 'chickpea', label: 'Chickpea / चना / हरभरा', Icon: Coffee },
  { value: 'pigeonpea', label: 'Pigeon Pea / अरहर / तूर', Icon: Coffee },
  { value: 'groundnut', label: 'Groundnut / मूंगफली / भुईमूग', Icon: Coffee },
  { value: 'bajra', label: 'Pearl Millet / बाजरा / बाजरी', Icon: Wheat },
  { value: 'jowar', label: 'Sorghum / ज्वार / ज्वारी', Icon: Wheat },
  { value: 'turmeric', label: 'Turmeric / हल्दी / हळद', Icon: Leaf },
  { value: 'ginger', label: 'Ginger / अदरक / आले', Icon: Leaf },
  { value: 'chilli', label: 'Chilli / मिर्च / मिरची', Icon: Flower2 },
  { value: 'other', label: 'Other / अन्य / इतर', Icon: Sprout },
];

const ACTIVITY_OPTIONS: { value: Activity; label: string; emoji: string }[] = [
  { value: 'sowing', label: 'Sowing / बुवाई', emoji: '🌱' },
  { value: 'irrigation', label: 'Irrigation / सिंचाई', emoji: '💧' },
  { value: 'fertilization', label: 'Fertilization / खाद', emoji: '🧪' },
  { value: 'pest-control', label: 'Pest Control / कीट नियंत्रण', emoji: '🛡️' },
  { value: 'weeding', label: 'Weeding / निराई', emoji: '🌾' },
  { value: 'harvesting', label: 'Harvesting / कटाई', emoji: '🌾' },
  { value: 'other', label: 'Other / अन्य', emoji: '📝' },
];

const SEASON_META: Record<Season, { label: string; shortLabel: string; Icon: any; tone: 'sky' | 'harvest' | 'leaf' | 'soil' }> = {
  kharif: { label: 'Kharif (Monsoon) / खरीफ (जून-नवं)', shortLabel: 'Kharif', Icon: CloudRain, tone: 'sky' },
  rabi: { label: 'Rabi (Winter) / रबी (नवं-अप्रै)', shortLabel: 'Rabi', Icon: Sun, tone: 'harvest' },
  zaid: { label: 'Zaid (Summer) / जायद (मार्च-जून)', shortLabel: 'Zaid', Icon: Sprout, tone: 'leaf' },
  annual: { label: 'Annual / वार्षिक', shortLabel: 'Annual', Icon: CalendarIcon, tone: 'soil' },
};

const CropCalendar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const userKey = user?.uid || 'guest';

  // Load events from localStorage
  const [events, setEvents] = useState<CropEvent[]>(() => {
    if (!user) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY(userKey));
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read crop calendar from storage', e);
    }
    return [];
  });

  // Persist on changes
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(STORAGE_KEY(userKey), JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save crop calendar', e);
    }
  }, [events, userKey, user]);

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterSeason, setFilterSeason] = useState<'all' | Season>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');

  // Editor modal state
  const [editing, setEditing] = useState<CropEvent | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Calendar navigation
  const [calDate, setCalDate] = useState(new Date());

  // Form state
  const [form, setForm] = useState<Omit<CropEvent, 'id' | 'createdAt'>>({
    crop: 'rice',
    activity: 'sowing',
    date: new Date().toISOString().slice(0, 10),
    season: 'kharif',
    status: 'pending',
    notes: '',
  });

  const openNew = () => {
    setForm({
      crop: 'rice',
      activity: 'sowing',
      date: new Date().toISOString().slice(0, 10),
      season: 'kharif',
      status: 'pending',
      notes: '',
    });
    setEditing(null);
    setIsNew(true);
  };

  const openEdit = (e: CropEvent) => {
    setForm({
      crop: e.crop,
      activity: e.activity,
      date: e.date,
      season: e.season,
      status: e.status,
      notes: e.notes || '',
    });
    setEditing(e);
    setIsNew(false);
  };

  const closeModal = () => {
    setEditing(null);
    setIsNew(false);
  };

  const save = () => {
    if (!form.crop || !form.date) {
      toast.error('Please fill in crop and date');
      return;
    }
    if (isNew) {
      const newEvent: CropEvent = {
        ...form,
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      setEvents((prev) => [newEvent, ...prev]);
      toast.success('Activity added');
    } else if (editing) {
      setEvents((prev) => prev.map((e) => (e.id === editing.id ? { ...editing, ...form } : e)));
      toast.success('Activity updated');
    }
    closeModal();
  };

  const remove = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success('Activity removed');
  };

  const toggleStatus = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next: Status = e.status === 'pending' ? 'completed' : e.status === 'completed' ? 'missed' : 'pending';
        return { ...e, status: next };
      }),
    );
  };

  // Filter
  const filtered = useMemo(() => {
    let list = events;
    if (filterSeason !== 'all') list = list.filter((e) => e.season === filterSeason);
    if (filterStatus !== 'all') list = list.filter((e) => e.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.crop.toLowerCase().includes(q) ||
          (e.notes || '').toLowerCase().includes(q) ||
          e.activity.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, filterSeason, filterStatus, search]);

  // Stats
  const stats = useMemo(() => {
    const total = events.length;
    const completed = events.filter((e) => e.status === 'completed').length;
    const pending = events.filter((e) => e.status === 'pending').length;
    const missed = events.filter((e) => e.status === 'missed').length;
    return { total, completed, pending, missed };
  }, [events]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay(); // 0=Sun
    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = startWeekday; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), inMonth: false });
    }
    for (let i = 1; i <= last.getDate(); i++) {
      days.push({ date: new Date(year, month, i), inMonth: true });
    }
    while (days.length % 7 !== 0) {
      const lastDay = days[days.length - 1].date;
      days.push({ date: new Date(lastDay.getTime() + 24 * 60 * 60 * 1000), inMonth: false });
    }
    return days;
  }, [calDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CropEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const locale = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
  const monthName = calDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 7); // Sunday
    return Array.from({ length: 7 }).map((_, i) =>
      new Date(base.getTime() + i * 86400000).toLocaleDateString(locale, { weekday: 'short' }),
    );
  }, [locale]);

  // Build crop icon map
  const cropIcon = (value: string) => CROP_OPTIONS.find((c) => c.value === value)?.Icon || Sprout;
  const cropLabel = (value: string) => CROP_OPTIONS.find((c) => c.value === value)?.label || value;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-app py-5 md:py-8">
        <PageHeader
          eyebrow={t('nav.tools', 'Farm Tools')}
          title={t('cropCalendar.title', 'Crop Calendar')}
          description={t('cropCalendar.subtitle', 'Plan sowing, irrigation, fertilization, and harvesting activities for your crops.')}
          actions={
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>
              {t('cropCalendar.addActivity', 'Add Activity')}
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="card card-padded">
            <div className="text-xs text-muted">Total</div>
            <div className="text-2xl font-semibold text-strong mt-1">{stats.total}</div>
          </div>
          <div className="card card-padded">
            <div className="text-xs text-muted">Completed</div>
            <div className="text-2xl font-semibold text-leaf-700 mt-1">{stats.completed}</div>
          </div>
          <div className="card card-padded">
            <div className="text-xs text-muted">Pending</div>
            <div className="text-2xl font-semibold text-harvest-700 mt-1">{stats.pending}</div>
          </div>
          <div className="card card-padded">
            <div className="text-xs text-muted">Missed</div>
            <div className="text-2xl font-semibold text-danger-600 mt-1">{stats.missed}</div>
          </div>
        </div>

        {/* View toggle + filters */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="flex p-0.5 bg-sunken rounded-md">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-xs font-medium ${view === 'list' ? 'bg-surface shadow-sm' : 'text-ink-600'}`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded text-xs font-medium ${view === 'calendar' ? 'bg-surface shadow-sm' : 'text-ink-600'}`}
            >
              Calendar
            </button>
          </div>

          <select
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value as any)}
            className="input py-1.5 text-sm"
          >
            <option value="all">All seasons</option>
            {Object.entries(SEASON_META).map(([k, v]) => (
              <option key={k} value={k}>{v.shortLabel}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="input py-1.5 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops, notes..."
            className="input py-1.5 text-sm flex-1 min-w-[12rem]"
          />
        </div>

        {/* List view */}
        {view === 'list' && (
          <div className="mt-5 space-y-2">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="w-12 h-12 text-ink-300" />}
                title={t('cropCalendar.empty', 'No activities yet')}
                description={t('cropCalendar.emptyDesc', 'Click "Add Activity" to plan your first crop activity.')}
              />
            ) : (
              filtered.map((e) => {
                const season = SEASON_META[e.season];
                const Icon = cropIcon(e.crop);
                const statusClass =
                  e.status === 'completed'
                    ? 'border-leaf-200 bg-leaf-50/40'
                    : e.status === 'missed'
                    ? 'border-danger-200 bg-[#fef2f2]/40'
                    : 'border-harvest-200 bg-harvest-50/30';
                const statusLabel =
                  e.status === 'completed' ? '✓ Completed' : e.status === 'missed' ? '✕ Missed' : '⏳ Pending';
                const statusTone: any = e.status === 'completed' ? 'leaf' : e.status === 'missed' ? 'danger' : 'harvest';
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`card card-padded border ${statusClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-leaf-50 text-leaf-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-strong truncate">{cropLabel(e.crop)}</div>
                            <div className="text-xs text-muted mt-0.5">
                              {ACTIVITY_OPTIONS.find((a) => a.value === e.activity)?.label || e.activity}
                            </div>
                          </div>
                          <Badge tone={statusTone}>{statusLabel}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-ink-600">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{new Date(e.date).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-ink-300">•</span>
                          <Badge tone={season.tone}>{season.shortLabel}</Badge>
                        </div>
                        {e.notes && (
                          <p className="text-xs text-ink-700 mt-2 leading-relaxed">{e.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleStatus(e.id)}
                          className="p-1.5 rounded hover:bg-sunken text-leaf-700"
                          aria-label="Toggle status"
                          title="Cycle status"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          className="p-1.5 rounded hover:bg-sunken text-ink-600"
                          aria-label="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(e.id)}
                          className="p-1.5 rounded hover:bg-[#fef2f2] text-danger-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Calendar view */}
        {view === 'calendar' && (
          <div className="mt-5 card card-padded">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-strong">{monthName}</h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded-md hover:bg-sunken"
                  onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCalDate(new Date())}
                  className="px-2.5 py-1 rounded-md hover:bg-sunken text-xs font-medium"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-md hover:bg-sunken"
                  onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
              {weekdayLabels.map((w) => <div key={w}>{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, inMonth }, i) => {
                const key = date.toISOString().slice(0, 10);
                const dayEvents = eventsByDate[key] || [];
                const isToday = key === new Date().toISOString().slice(0, 10);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      if (dayEvents.length > 0) {
                        // jump to list and filter by this date
                        setView('list');
                        setSearch(key);
                      } else {
                        setForm((f) => ({ ...f, date: key }));
                        openNew();
                      }
                    }}
                    className={`text-left min-h-[5rem] p-1.5 rounded-md border transition-colors ${
                      inMonth ? 'bg-surface' : 'bg-sunken/40 text-ink-400'
                    } ${isToday ? 'border-leaf-500 ring-1 ring-leaf-200' : 'border-subtle'} hover:border-leaf-300`}
                  >
                    <div className={`text-xs font-semibold ${isToday ? 'text-leaf-700' : 'text-ink-700'}`}>
                      {date.getDate()}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((e) => {
                        const Icon = cropIcon(e.crop);
                        return (
                          <div
                            key={e.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate ${
                              e.status === 'completed'
                                ? 'bg-leaf-50 text-leaf-700'
                                : e.status === 'missed'
                                ? 'bg-[#fef2f2] text-danger-600'
                                : 'bg-harvest-50 text-harvest-700'
                            }`}
                          >
                            <Icon className="w-2.5 h-2.5 inline-block mr-0.5" />
                            {ACTIVITY_OPTIONS.find((a) => a.value === e.activity)?.label.split(' ')[0] || 'Activity'}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-ink-500">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-6 card p-4 bg-leaf-50/40 border-leaf-100">
          <h3 className="text-sm font-semibold text-leaf-800 mb-2">💡 Seasonal Tips</h3>
          <ul className="text-xs text-ink-700 space-y-1.5 leading-relaxed">
            <li>• <strong>Kharif (Jun-Nov):</strong> Rice, Maize, Cotton, Soybean, Bajra — sow with first monsoon showers.</li>
            <li>• <strong>Rabi (Nov-Apr):</strong> Wheat, Mustard, Chickpea, Potato — sow after Diwali with residual soil moisture.</li>
            <li>• <strong>Zaid (Mar-Jun):</strong> Watermelon, Cucumber, Okra — short-duration crops, need regular irrigation.</li>
          </ul>
        </div>
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={isNew || !!editing}
        onClose={closeModal}
        title={isNew ? 'Add Activity' : 'Edit Activity'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={save}>{isNew ? 'Add' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="Crop" required>
            <Select value={form.crop} onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}>
              {CROP_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Activity" required>
              <Select value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value as Activity }))}>
                {ACTIVITY_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.emoji} {a.label}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Date" required>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Season">
              <Select value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value as Season }))}>
                {Object.entries(SEASON_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}>
                <option value="pending">⏳ Pending</option>
                <option value="completed">✓ Completed</option>
                <option value="missed">✕ Missed</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Notes (optional)">
            <Textarea
              value={form.notes || ''}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Add any additional details..."
              rows={3}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
};

export default CropCalendar;
