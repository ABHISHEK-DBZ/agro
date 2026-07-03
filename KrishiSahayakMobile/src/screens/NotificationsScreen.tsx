// Notifications Screen — In-app notification center
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState, Badge } from '../components/ui';
import communityService, { Notification } from '../services/communityService';

const NOTIF_ICONS: Record<string, string> = {
  reply: '💬', like: '❤️', group_invite: '👥', alert: '⚠️', system: '🔔',
};

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await communityService.getNotifications('user1');
    setNotifs(data);
  };

  const markRead = async (id: string) => {
    await communityService.markNotificationRead(id);
    await load();
  };

  const markAllRead = async () => {
    await communityService.markAllNotificationsRead('user1');
    await load();
  };

  const filtered = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <Header title="Notifications" subtitle={`${unreadCount} unread`} onBack={() => navigation.goBack()}
        rightAction={unreadCount > 0 ? <TouchableOpacity onPress={markAllRead}><Text style={styles.markAllText}>✓ Mark All Read</Text></TouchableOpacity> : undefined}
      />
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'all' && styles.filterActive]} onPress={() => setFilter('all')}><Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All ({notifs.length})</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'unread' && styles.filterActive]} onPress={() => setFilter('unread')}><Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>Unread ({unreadCount})</Text></TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={n => n.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="🔔" title="All caught up!" description={filter === 'unread' ? 'No unread notifications' : 'Notifications will appear here'} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, !item.read && styles.cardUnread]} onPress={() => !item.read && markRead(item.id)}>
            <View style={styles.cardRow}>
              <View style={styles.iconCircle}><Text style={styles.icon}>{NOTIF_ICONS[item.type] || '🔔'}</Text></View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>{item.title}</Text>
                <Text style={styles.cardMsg}>{item.message}</Text>
                <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleString('en-IN')}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.cardFooter}>
              <Badge label={item.type} variant={item.type === 'alert' ? 'error' : item.type === 'system' ? 'info' : 'neutral'} size="sm" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  markAllText: { fontSize: typography.fontSize.sm, color: colors.textInverse, fontWeight: typography.fontWeight.medium },
  filterRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  filterBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background },
  filterActive: { backgroundColor: colors.primaryFaded },
  filterText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  filterTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary, backgroundColor: '#F0FDF4' },
  cardRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryFaded, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 18 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.medium, color: colors.textPrimary },
  cardTitleUnread: { fontWeight: typography.fontWeight.bold },
  cardMsg: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  cardTime: { fontSize: typography.fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
  cardFooter: { flexDirection: 'row', marginTop: spacing.sm },
});

export default NotificationsScreen;
