// Group Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { LoadingSpinner, Badge } from '../components/ui';
import communityService, { FarmerGroup } from '../services/communityService';

export const GroupDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const [group, setGroup] = useState<FarmerGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const { groupId } = route.params || {};

  useEffect(() => {
    const load = async () => {
      const groups = await communityService.getGroups();
      setGroup(groups.find(g => g.id === groupId) || null);
      setLoading(false);
    };
    load();
  }, [groupId]);

  if (loading) return <View style={styles.container}><Header title="Group" onBack={() => navigation.goBack()} /><LoadingSpinner fullScreen /></View>;
  if (!group) return <View style={styles.container}><Header title="Not Found" onBack={() => navigation.goBack()} /><Text style={styles.error}>Group not found</Text></View>;

  return (
    <View style={styles.container}>
      <Header title={group.name} subtitle={`${group.members.length} members`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>👥</Text>
          <Badge label={group.privacy === 'private' ? '🔒 Private' : '🌍 Public'} variant={group.privacy === 'private' ? 'warning' : 'info'} size="sm" />
        </View>
        <Text style={styles.desc}>{group.description}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statNum}>{group.members.length}</Text><Text style={styles.statLabel}>Members</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>{group.posts}</Text><Text style={styles.statLabel}>Posts</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>{group.tags.length}</Text><Text style={styles.statLabel}>Tags</Text></View>
        </View>
        <View style={styles.tagsRow}>{group.tags.map((t, i) => <Badge key={i} label={`#${t}`} variant="neutral" size="sm" />)}</View>
        <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Messages', { userId: group.createdBy, userName: group.createdByName })}>
          <Text style={styles.chatBtnText}>💬 Chat with Members</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  error: { textAlign: 'center', marginTop: spacing.xxl, fontSize: typography.fontSize.lg, color: colors.error },
  content: { padding: spacing.lg, paddingBottom: spacing.huge },
  banner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  bannerIcon: { fontSize: 48 },
  desc: { fontSize: typography.fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', ...shadows.sm },
  statNum: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.primary },
  statLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xl },
  chatBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center' },
  chatBtnText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
});

export default GroupDetailScreen;
