// Analytics Screen — Farm analytics with stats
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import storageService from '../services/storage';
import communityService from '../services/communityService';

export const AnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalGroups: 0, totalPolls: 0, totalNotifs: 0, totalLogs: 0,
    activeAlerts: 0, healthyLogs: 0,
  });

  useEffect(() => {
    const load = async () => {
      const groups = await communityService.getGroups();
      const polls = await communityService.getPolls();
      const notifs = await communityService.getNotifications('user1');
      const logs = await storageService.getItem<any[]>('@krishi_daily_logs') || [];
      setStats({
        totalGroups: groups.length,
        totalPolls: polls.length,
        totalNotifs: notifs.filter(n => !n.read).length,
        totalLogs: logs.length,
        activeAlerts: notifs.filter(n => n.type === 'alert' && !n.read).length,
        healthyLogs: logs.filter((l: any) => l.health === 'excellent' || l.health === 'good').length,
      });
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Analytics" subtitle="Farm insights & statistics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>📊 Overview</Text>
        <View style={styles.grid}>
          <StatCard icon="👥" value={stats.totalGroups} label="Groups" color={colors.primary} />
          <StatCard icon="📊" value={stats.totalPolls} label="Active Polls" color={colors.info} />
          <StatCard icon="🔔" value={stats.totalNotifs} label="Unread" color={colors.warning} />
          <StatCard icon="📋" value={stats.totalLogs} label="Daily Logs" color={colors.success} />
        </View>
        <Text style={styles.sectionTitle}>🌾 Farm Health</Text>
        <View style={styles.grid}>
          <StatCard icon="✅" value={stats.healthyLogs} label="Healthy Days" color={colors.success} />
          <StatCard icon="⚠️" value={stats.activeAlerts} label="Active Alerts" color={colors.error} />
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightEmoji}>💡</Text>
          <Text style={styles.insightTitle}>Smart Insight</Text>
          <Text style={styles.insightText}>
            {stats.healthyLogs > stats.totalLogs / 2
              ? 'Your crops are generally healthy! Keep up the good farming practices.'
              : 'Consider reviewing your crop management routine. More consistent tracking can help identify issues early.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const StatCard: React.FC<{ icon: string; value: number; label: string; color: string }> = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { width: '48%', backgroundColor: colors.white, padding: spacing.xl, borderRadius: borderRadius.lg, borderLeftWidth: 4, ...shadows.sm },
  statIcon: { fontSize: 28, marginBottom: spacing.sm },
  statValue: { fontSize: typography.fontSize.display, fontWeight: typography.fontWeight.bold },
  statLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  insightCard: { backgroundColor: colors.primaryFaded, borderRadius: borderRadius.lg, padding: spacing.xl, marginTop: spacing.lg },
  insightEmoji: { fontSize: 32, marginBottom: spacing.sm },
  insightTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary, marginBottom: spacing.xs },
  insightText: { fontSize: typography.fontSize.md, color: colors.primaryDark, lineHeight: 22 },
});

export default AnalyticsScreen;
