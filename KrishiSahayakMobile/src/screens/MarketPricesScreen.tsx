// Enhanced Market Prices Screen — with Price Alerts & Realtime Monitoring
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { MarketPriceCard } from '../components/MarketPriceCard';
import { LoadingSpinner, ErrorView, EmptyState, Badge } from '../components/ui';
import { marketService } from '../services/market';
import marketAlertService, {
  PriceAlertThreshold,
  PriceAlertEvent,
} from '../services/marketAlertService';
import { MarketPrice } from '../types';

interface EnhancedMarketPricesScreenProps {
  navigation: any;
}

type TabType = 'prices' | 'alerts';

export const EnhancedMarketPricesScreen: React.FC<EnhancedMarketPricesScreenProps> = ({ navigation }) => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('prices');

  // Price alert state
  const [thresholds, setThresholds] = useState<PriceAlertThreshold[]>([]);
  const [alertHistory, setAlertHistory] = useState<PriceAlertEvent[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlertCommodity, setNewAlertCommodity] = useState('');
  const [newAlertType, setNewAlertType] = useState<'above' | 'below'>('above');
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [showAlertDetail, setShowAlertDetail] = useState<PriceAlertEvent | null>(null);

  const commodities = marketService.getCommodities();

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      const data = await marketService.getPrices({ limit: 50 });
      setPrices(data);
      setFilteredPrices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load market prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    
    const initAlerts = async () => {
      await marketAlertService.initialize();
      setThresholds(marketAlertService.getThresholds());
      setAlertHistory(marketAlertService.getAlertHistory());

      // Start background monitoring (checks every 10 min)
      marketAlertService.startMonitoring();

      // Subscribe to new alerts with cleanup
      unsub = marketAlertService.subscribe((events) => {
        setAlertHistory(prev => [...events, ...prev].slice(0, 100));
      });
    };
    
    initAlerts();
    
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Filter logic
  useEffect(() => {
    let result = prices;
    if (selectedCommodity) {
      result = result.filter(p => p.commodity.toLowerCase() === selectedCommodity.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.commodity.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
      );
    }
    setFilteredPrices(result);
  }, [searchQuery, selectedCommodity, prices]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrices();
    setRefreshing(false);
  };

  // Alert handlers
  const handleAddAlert = async () => {
    if (!newAlertCommodity || !newAlertPrice) return;
    const price = parseInt(newAlertPrice, 10);
    if (isNaN(price) || price <= 0) return;

    await marketAlertService.addThreshold(newAlertCommodity, newAlertType, price);
    setThresholds(marketAlertService.getThresholds());
    setShowAddAlert(false);
    setNewAlertCommodity('');
    setNewAlertType('above');
    setNewAlertPrice('');
  };

  const handleRemoveAlert = async (id: string) => {
    await marketAlertService.removeThreshold(id);
    setThresholds(marketAlertService.getThresholds());
  };

  const handleToggleAlert = async (id: string) => {
    await marketAlertService.toggleThreshold(id);
    setThresholds(marketAlertService.getThresholds());
  };

  const handleAcknowledge = async (id: string) => {
    await marketAlertService.acknowledgeAlert(id);
    setAlertHistory(prev =>
      prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)
    );
  };

  const renderItem = ({ item }: { item: MarketPrice }) => (
    <MarketPriceCard item={item} />
  );

  // Alert History Tab
  const renderAlertsTab = () => (
    <ScrollView contentContainerStyle={styles.alertsContent}>
      {/* Alert Thresholds */}
      <View style={styles.alertsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔔 Price Alert Thresholds</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddAlert(true)}
          >
            <Text style={styles.addButtonText}>+ Add Alert</Text>
          </TouchableOpacity>
        </View>

        {thresholds.length === 0 ? (
          <View style={styles.emptyThresholds}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No price alerts set</Text>
            <Text style={styles.emptyDesc}>
              Add alerts to get notified when commodity prices cross your thresholds
            </Text>
          </View>
        ) : (
          thresholds.map((threshold) => (
            <View key={threshold.id} style={styles.thresholdCard}>
              <View style={styles.thresholdInfo}>
                <View style={styles.thresholdHeader}>
                  <Text style={styles.thresholdCommodity}>{threshold.commodity}</Text>
                  <Badge
                    label={threshold.type === 'above' ? 'Price Above' : 'Price Below'}
                    variant={threshold.type === 'above' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
                <Text style={styles.thresholdPrice}>
                  {threshold.type === 'above' ? '≥' : '≤'} ₹{threshold.price.toLocaleString()}/quintal
                </Text>
              </View>
              <View style={styles.thresholdActions}>
                <Switch
                  value={threshold.enabled}
                  onValueChange={() => handleToggleAlert(threshold.id)}
                  trackColor={{ false: colors.border, true: colors.primaryFaded }}
                  thumbColor={threshold.enabled ? colors.primary : colors.textTertiary}
                />
                <TouchableOpacity onPress={() => handleRemoveAlert(threshold.id)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Alert History */}
      <View style={styles.alertsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Alert History</Text>
          {alertHistory.length > 0 && (              <TouchableOpacity onPress={() => {
              marketAlertService.clearAlertHistory();
              setAlertHistory([]);
            }}>
              <Text style={styles.clearAllButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {alertHistory.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No alerts yet"
            description="Alerts will appear here when price thresholds are triggered"
          />
        ) : (
          alertHistory.slice(0, 20).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[styles.alertEvent, !event.acknowledged && styles.alertEventUnread]}
              onPress={() => setShowAlertDetail(event)}
            >
              <View style={styles.alertEventHeader}>
                <Text style={styles.alertEventIcon}>
                  {event.type === 'above' ? '📈' : '📉'}
                </Text>
                <View style={styles.alertEventInfo}>
                  <Text style={styles.alertEventTitle}>
                    {event.commodity} — ₹{event.currentPrice.toLocaleString()}
                  </Text>
                  <Text style={styles.alertEventMarket}>{event.market}</Text>
                </View>
                {!event.acknowledged && (
                  <TouchableOpacity onPress={() => handleAcknowledge(event.id)}>
                    <Badge label="New" variant="error" size="sm" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.alertEventDesc}>
                {event.type === 'above' ? 'Rose above' : 'Dropped below'} threshold of ₹{event.thresholdPrice.toLocaleString()}
              </Text>
              <Text style={styles.alertEventTime}>
                {new Date(event.timestamp).toLocaleString('en-IN')}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recommended Thresholds */}
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>💡 Suggested Thresholds</Text>
        <Text style={styles.sectionDesc}>
          Common price thresholds used by farmers for popular commodities
        </Text>
        {marketAlertService.getRecommendedThresholds().slice(0, 5).map((rec, i) => (
          <TouchableOpacity
            key={i}
            style={styles.suggestedItem}
            onPress={() => {
              const existing = thresholds.find(t =>
                t.commodity.toLowerCase() === rec.commodity.toLowerCase()
              );
              if (existing) return;
              marketAlertService.addThreshold(rec.commodity, 'above', rec.highThreshold);
              marketAlertService.addThreshold(rec.commodity, 'below', rec.lowThreshold);
              setThresholds(marketAlertService.getThresholds());
            }}
          >
            <View style={styles.suggestedInfo}>
              <Text style={styles.suggestedCommodity}>{rec.commodity}</Text>
              <Text style={styles.suggestedPrices}>
                Current: ₹{rec.currentPrice} | High: ₹{rec.highThreshold} | Low: ₹{rec.lowThreshold}
              </Text>
            </View>
            <Text style={styles.suggestedAdd}>+ Add Both</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Alert Modal */}
      <Modal visible={showAddAlert} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Price Alert</Text>
              <TouchableOpacity onPress={() => setShowAddAlert(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Commodity</Text>
              <View style={styles.commodityPicker}>
                <FlatList
                  horizontal
                  data={commodities}
                  keyExtractor={(item) => item}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.commodityChip,
                        newAlertCommodity === item && styles.commodityChipSelected,
                      ]}
                      onPress={() => setNewAlertCommodity(item)}
                    >
                      <Text style={[
                        styles.commodityChipText,
                        newAlertCommodity === item && styles.commodityChipTextSelected,
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              <Text style={styles.inputLabel}>Alert Type</Text>
              <View style={styles.alertTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.alertTypeButton,
                    newAlertType === 'above' && styles.alertTypeSelectedA,
                  ]}
                  onPress={() => setNewAlertType('above')}
                >
                  <Text style={[
                    styles.alertTypeText,
                    newAlertType === 'above' && styles.alertTypeTextSelected,
                  ]}>
                    📈 Price Above
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.alertTypeButton,
                    newAlertType === 'below' && styles.alertTypeSelectedB,
                  ]}
                  onPress={() => setNewAlertType('below')}
                >
                  <Text style={[
                    styles.alertTypeText,
                    newAlertType === 'below' && styles.alertTypeTextSelected,
                  ]}>
                    📉 Price Below
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Price (₹ per quintal)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="e.g. 3000"
                placeholderTextColor={colors.textTertiary}
                value={newAlertPrice}
                onChangeText={setNewAlertPrice}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!newAlertCommodity || !newAlertPrice) && styles.saveButtonDisabled,
                ]}
                onPress={handleAddAlert}
                disabled={!newAlertCommodity || !newAlertPrice}
              >
                <Text style={styles.saveButtonText}>Save Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Detail Modal */}
      <Modal visible={!!showAlertDetail} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Alert Details</Text>
              <TouchableOpacity onPress={() => setShowAlertDetail(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {showAlertDetail && (
              <View style={styles.detailBody}>
                <Text style={styles.detailEmoji}>
                  {showAlertDetail.type === 'above' ? '📈' : '📉'}
                </Text>
                <Text style={styles.detailCommodity}>{showAlertDetail.commodity}</Text>
                <Text style={styles.detailMarket}>📍 {showAlertDetail.market}</Text>

                <View style={styles.detailPrices}>
                  <View style={styles.detailPriceItem}>
                    <Text style={styles.detailPriceLabel}>Current Price</Text>
                    <Text style={styles.detailPriceValue}>
                      ₹{showAlertDetail.currentPrice.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.detailPriceItem}>
                    <Text style={styles.detailPriceLabel}>Threshold</Text>
                    <Text style={styles.detailPriceThreshold}>
                      {showAlertDetail.type === 'above' ? '≥' : '≤'} ₹{showAlertDetail.thresholdPrice.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailTime}>
                  Triggered: {new Date(showAlertDetail.timestamp).toLocaleString('en-IN')}
                </Text>

                {!showAlertDetail.acknowledged && (
                  <TouchableOpacity
                    style={styles.acknowledgeButton}
                    onPress={() => {
                      handleAcknowledge(showAlertDetail.id);
                      setShowAlertDetail(null);
                    }}
                  >
                    <Text style={styles.acknowledgeButtonText}>✓ Acknowledge</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Market Prices"
        subtitle={activeTab === 'prices' ? 'Realtime mandi rates' : `Active: ${thresholds.filter(t => t.enabled).length} alerts`}
        onBack={() => navigation.goBack()}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prices' && styles.tabActive]}
          onPress={() => setActiveTab('prices')}
        >
          <Text style={[styles.tabIcon]}>
            {activeTab === 'prices' ? '📊' : '📊'}
          </Text>
          <Text style={[styles.tabText, activeTab === 'prices' && styles.tabTextActive]}>
            Prices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.tabActive]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={styles.tabIcon}>🔔</Text>
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>
            Alerts
          </Text>
          {thresholds.filter(t => t.enabled).length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {thresholds.filter(t => t.enabled).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'prices' ? (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search commodity, market, or state..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Commodity Filter Chips */}
          <View style={styles.filterRow}>
            <FlatList
              horizontal
              data={['All', ...commodities.slice(0, 10)]}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    ((selectedCommodity === item) || (!selectedCommodity && item === 'All')) ? styles.chipSelected : undefined,
                  ]}
                  onPress={() => setSelectedCommodity(item === 'All' ? null : item)}
                >
                  <Text style={[
                    styles.chipText,
                    ((selectedCommodity === item) || (!selectedCommodity && item === 'All')) ? styles.chipTextSelected : undefined,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Results Count */}
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsCount}>
              {filteredPrices.length} commodities found
            </Text>
            {selectedCommodity && (
              <TouchableOpacity onPress={() => setSelectedCommodity(null)}>
                <Text style={styles.clearFilter}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && !refreshing ? (
            <LoadingSpinner fullScreen message="Fetching market prices..." />
          ) : error ? (
            <ErrorView message={error} onRetry={onRefresh} />
          ) : (
            <FlatList
              data={filteredPrices}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
              ListEmptyComponent={
                <EmptyState
                  icon="📭"
                  title="No prices found"
                  description="Try adjusting your search or filter"
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        renderAlertsTab()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  tabBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },

  // Search
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
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.fontSize.md, color: colors.textPrimary },
  clearButton: { fontSize: typography.fontSize.md, color: colors.textTertiary, padding: spacing.xs },
  filterRow: {
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  chipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  chipTextSelected: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resultsCount: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  clearFilter: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.medium },
  listContent: { padding: spacing.lg, paddingBottom: spacing.huge },

  // Alerts Content
  alertsContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  alertsSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },

  // Empty
  emptyThresholds: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Threshold Cards
  thresholdCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  thresholdInfo: { flex: 1 },
  thresholdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  thresholdCommodity: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  thresholdPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  thresholdActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: { fontSize: 18, padding: spacing.xs },

  // Alert Events
  alertEvent: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  alertEventUnread: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  alertEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  alertEventIcon: { fontSize: 20 },
  alertEventInfo: { flex: 1 },
  alertEventTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  alertEventMarket: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  alertEventDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  alertEventTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  clearAllButton: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  addButton: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // Suggested
  suggestedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  suggestedInfo: { flex: 1 },
  suggestedCommodity: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  suggestedPrices: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  suggestedAdd: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: typography.fontSize.xl,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  commodityPicker: {
    marginBottom: spacing.sm,
  },
  commodityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commodityChipSelected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  commodityChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  commodityChipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  alertTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  alertTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  alertTypeSelectedA: {
    backgroundColor: '#D1FAE5',
    borderColor: colors.success,
  },
  alertTypeSelectedB: {
    backgroundColor: '#FEF3C7',
    borderColor: colors.warning,
  },
  alertTypeText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  alertTypeTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  priceInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },

  // Detail Modal
  detailModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xxxl,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  detailBody: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  detailEmoji: { fontSize: 48 },
  detailCommodity: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  detailMarket: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  detailPrices: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingVertical: spacing.lg,
  },
  detailPriceItem: {
    alignItems: 'center',
  },
  detailPriceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  detailPriceValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  detailPriceThreshold: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
  },
  detailTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  acknowledgeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  acknowledgeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

export default EnhancedMarketPricesScreen;
