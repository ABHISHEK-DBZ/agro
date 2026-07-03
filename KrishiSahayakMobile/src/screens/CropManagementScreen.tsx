// Crop Management Guide — Detailed crop info by season
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState, Badge } from '../components/ui';

interface CropEntry {
  id: string; name: string; nameHi: string; season: string; icon: string;
  sowing: string; harvest: string; water: string; soil: string; climate: string;
  yield_: string; price: string; tips: string[];
}

const CROPS: CropEntry[] = [
  { id: 'wheat', name: 'Wheat', nameHi: 'गेहूं', season: 'Rabi', icon: '🌾', sowing: 'Oct-Dec', harvest: 'Apr-May', water: '450-650mm (Medium)', soil: 'Loamy, well-drained', climate: 'Cool, dry (10-25°C)', yield_: '25-30 qt/hectare', price: '₹2,100-2,300/qt', tips: ['Use HD 2967 or PBW 343 varieties', 'Apply DAP 50kg & Urea 65kg/acre', '4-6 irrigations needed', 'Crop rotation with legumes recommended'] },
  { id: 'rice', name: 'Rice', nameHi: 'धान', season: 'Kharif', icon: '🌾', sowing: 'Jun-Jul', harvest: 'Oct-Nov', water: '1000-1200mm (High)', soil: 'Clay, waterlogged', climate: 'Hot, humid (20-35°C)', yield_: '35-40 qt/hectare', price: '₹3,000-3,500/qt', tips: ['Use Pusa 44 or PB 1121 varieties', '3-5cm standing water needed', 'Nursery transplanting recommended', 'Apply Zinc sulfate 25kg/hectare'] },
  { id: 'cotton', name: 'Cotton', nameHi: 'कपास', season: 'Kharif', icon: '🌿', sowing: 'May-Jun', harvest: 'Oct-Nov', water: '500-800mm (Medium)', soil: 'Black cotton soil', climate: 'Warm, moderate rain (25-35°C)', yield_: '15-20 qt/hectare', price: '₹5,500-6,000/qt', tips: ['Bt cotton varieties recommended', 'NPK 80:40:40 kg/hectare', 'Monitor for bollworm regularly', 'Pick cotton when bolls fully open'] },
  { id: 'sugarcane', name: 'Sugarcane', nameHi: 'गन्ना', season: 'Annual', icon: '🎋', sowing: 'Feb-Mar, Oct', harvest: 'Dec-Jan', water: '1500-2500mm (Very High)', soil: 'Rich loamy', climate: 'Hot, humid (25-35°C)', yield_: '700-900 qt/hectare', price: '₹320-350/qt', tips: ['Use CO 0238 or CO 86032 varieties', 'Heavy irrigation every 10-12 days', 'Earth up after 4 months', 'Harvest when brix is >18%'] },
  { id: 'tomato', name: 'Tomato', nameHi: 'टमाटर', season: 'Rabi', icon: '🍅', sowing: 'Sep-Nov', harvest: 'Jan-Mar', water: '400-600mm (Medium)', soil: 'Sandy loam, well-drained', climate: 'Warm (20-30°C)', yield_: '250-300 qt/hectare', price: '₹15-25/kg', tips: ['Use Arka Rakshak or Arka Vikas', 'Drip irrigation recommended', 'Staking improves yield', 'Spray neem oil 5ml/L for pests'] },
  { id: 'potato', name: 'Potato', nameHi: 'आलू', season: 'Rabi', icon: '🥔', sowing: 'Oct-Nov', harvest: 'Feb-Mar', water: '400-600mm (Medium)', soil: 'Sandy loam', climate: 'Cool, dry (15-25°C)', yield_: '200-250 qt/hectare', price: '₹1,000-1,500/qt', tips: ['Use Kufri Pukhraj or Kufri Jyoti', 'Seed treatment with Mancozeb', 'Apply MOP 100kg/hectare', 'Harvest when leaves turn yellow'] },
  { id: 'onion', name: 'Onion', nameHi: 'प्याज', season: 'Kharif', icon: '🧅', sowing: 'May-Jun', harvest: 'Sep-Oct', water: '600-700mm (Medium)', soil: 'Sandy loam', climate: 'Warm, dry (20-30°C)', yield_: '200-250 qt/hectare', price: '₹15-20/kg', tips: ['Use Agrifound Light Red variety', 'Raise nursery first, then transplant', 'Stop irrigation 15 days before harvest', 'Cure bulbs for 7-10 days after harvest'] },
  { id: 'soybean', name: 'Soybean', nameHi: 'सोयाबीन', season: 'Kharif', icon: '🌱', sowing: 'Jun-Jul', harvest: 'Oct-Nov', water: '500-700mm (Medium)', soil: 'Well-drained loamy', climate: 'Warm, humid (25-30°C)', yield_: '15-20 qt/hectare', price: '₹4,000-4,800/qt', tips: ['Use JS 335 or NRC 37 varieties', 'Biofertilizer seed treatment', 'Rhizobium culture recommended', 'Harvest when pods turn brown'] },
];

const SEASONS = ['All', 'Kharif', 'Rabi', 'Annual'] as const;

export const CropManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('All');

  const filtered = useMemo(() => {
    let list = CROPS;
    if (seasonFilter !== 'All') list = list.filter(c => c.season === seasonFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.nameHi.includes(q));
    }
    return list;
  }, [search, seasonFilter]);

  return (
    <View style={styles.container}>
      <Header title="Crop Management" subtitle="फसल प्रबंधन" onBack={() => navigation.goBack()} />
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Search crops..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={setSearch} />
      </View>
      <View style={styles.filterRow}>
        <FlatList horizontal data={SEASONS} keyExtractor={s => s} showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.chip, seasonFilter === item && styles.chipActive]} onPress={() => setSeasonFilter(item)}>
              <Text style={[styles.chipText, seasonFilter === item && styles.chipTextActive]}>{item === 'All' ? 'All' : item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList data={filtered} keyExtractor={c => c.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="🌾" title="No crops found" description="Try adjusting your search" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.cardName}>{item.name} ({item.nameHi})</Text>
                  <Badge label={item.season} variant={item.season === 'Kharif' ? 'success' : item.season === 'Rabi' ? 'info' : 'warning'} size="sm" />
                </View>
              </View>
            </View>
            <View style={styles.infoGrid}>
              <InfoItem label="Sowing" value={item.sowing} />
              <InfoItem label="Harvest" value={item.harvest} />
              <InfoItem label="Water" value={item.water} />
              <InfoItem label="Soil" value={item.soil} />
              <InfoItem label="Climate" value={item.climate} />
              <InfoItem label="Yield" value={item.yield_} />
              <InfoItem label="Price" value={item.price} />
            </View>
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Tips</Text>
              {item.tips.map((tip, i) => <Text key={i} style={styles.tipText}>• {tip}</Text>)}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.white },
  searchInput: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 40, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  filterRow: { paddingVertical: spacing.sm, paddingLeft: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  chipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { marginBottom: spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcon: { fontSize: 32 },
  cardName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  infoItem: { width: '47%', marginBottom: spacing.sm },
  infoLabel: { fontSize: typography.fontSize.xs, color: colors.textTertiary, marginBottom: 2 },
  infoValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textPrimary },
  tipsSection: { backgroundColor: colors.primaryFaded, borderRadius: borderRadius.md, padding: spacing.lg, marginTop: spacing.md },
  tipsTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.primary, marginBottom: spacing.sm },
  tipText: { fontSize: typography.fontSize.sm, color: colors.primaryDark, lineHeight: 20, marginBottom: spacing.xs },
});

export default CropManagementScreen;
