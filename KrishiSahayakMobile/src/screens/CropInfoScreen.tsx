// Crop Information Screen
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { CropCard } from '../components/CropCard';
import { LoadingSpinner, ErrorView, EmptyState } from '../components/ui';
import { cropService } from '../services/crops';
import { Crop } from '../types';

interface CropInfoScreenProps {
  navigation: any;
}

export const CropInfoScreen: React.FC<CropInfoScreenProps> = ({ navigation }) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const data = await cropService.getAllCrops();
      setCrops(data);
    } catch (err) {
      console.error('[CropInfo] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(c => {
    if (selectedSeason && c.season !== selectedSeason) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.en.toLowerCase().includes(q) ||
        c.name.hi.includes(q) ||
        c.id.includes(q)
      );
    }
    return true;
  });

  const seasons = cropService.getSeasons();

  if (selectedCrop) {
    return (
      <View style={styles.container}>
        <Header
          title={selectedCrop.name.en}
          subtitle={selectedCrop.name.hi}
          onBack={() => setSelectedCrop(null)}
        />
        <FlatList
          data={[selectedCrop]}
          renderItem={({ item }) => <CropCard crop={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Crop Information"
        subtitle="Indian crops guide"
        onBack={() => navigation.goBack()}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Season Filter */}
      <View style={styles.seasonRow}>
        <TouchableOpacity
          style={[styles.seasonChip, !selectedSeason && styles.seasonChipActive]}
          onPress={() => setSelectedSeason(null)}
        >
          <Text style={[styles.seasonText, !selectedSeason && styles.seasonTextActive]}>All</Text>
        </TouchableOpacity>
        {seasons.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.seasonChip, selectedSeason === s.id && styles.seasonChipActive]}
            onPress={() => setSelectedSeason(s.id)}
          >
            <View>
              <Text style={[styles.seasonText, selectedSeason === s.id && styles.seasonTextActive]}>
                {s.name.en.split(' ')[0]}
              </Text>
              <Text style={[styles.seasonSubtext, selectedSeason === s.id && styles.seasonTextActive]}>
                {s.name.hi}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingSpinner fullScreen message="Loading crop data..." />
      ) : (
        <FlatList
          data={filteredCrops}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cropCard}
              onPress={() => setSelectedCrop(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cropCardContent}>
                <View style={styles.cropIconContainer}>
                  <Text style={styles.cropIcon}>
                    {item.id === 'wheat' ? '🌾' :
                     item.id === 'rice' ? '🍚' :
                     item.id === 'cotton' ? '🌿' :
                     item.id === 'sugarcane' ? '🎋' :
                     item.id === 'onion' ? '🧅' : '🌱'}
                  </Text>
                </View>
                <View style={styles.cropInfo}>
                  <Text style={styles.cropName}>{item.name.en}</Text>
                  <Text style={styles.cropNameHi}>{item.name.hi}</Text>
                  <View style={styles.cropMeta}>
                    <Text style={styles.cropSeason}>{item.season}</Text>
                    <Text style={styles.cropDuration}>{item.duration}</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="🌾"
              title="No crops found"
              description="Try adjusting your search or filter"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  seasonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  seasonChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seasonChipActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  seasonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  seasonSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },
  seasonTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.sm,
  },
  cropCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cropCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cropIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  cropIcon: {
    fontSize: 28,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  cropNameHi: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cropMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cropSeason: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  cropDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  arrow: {
    fontSize: typography.fontSize.xl,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
  detailContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
});

export default CropInfoScreen;
