// Polls Screen — Community polls with voting
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { EmptyState, Badge } from '../components/ui';
import communityService, { Poll } from '../services/communityService';

export const PollsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ question: '', options: ['', ''], category: 'crops', expiryDays: 7 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await communityService.getPolls();
    setPolls(data);
    setLoading(false);
  };

  const vote = async (pollId: string, optionId: string) => {
    try {
      await communityService.voteOnPoll(pollId, optionId, 'user1');
      await load();
    } catch (e: any) {
      alert(e.message || 'Error voting');
    }
  };

  const createPoll = async () => {
    if (!form.question.trim() || form.options.filter(o => o.trim()).length < 2) return;
    const expires = new Date();
    expires.setDate(expires.getDate() + form.expiryDays);
    await communityService.createPoll({
      question: form.question,
      options: form.options.filter(o => o.trim()).map((text, i) => ({ id: `opt_${Date.now()}_${i}`, text, votes: 0, voters: [] })),
      createdBy: 'user1', createdByName: 'You', category: form.category, expiresAt: expires,
    });
    setShowCreate(false);
    setForm({ question: '', options: ['', ''], category: 'crops', expiryDays: 7 });
    await load();
  };

  const hasVoted = (poll: Poll) => poll.options.some(o => o.voters.includes('user1'));

  return (
    <View style={styles.container}>
      <Header title="Polls" subtitle="Community voting" onBack={() => navigation.goBack()}
        rightAction={<TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}><Text style={styles.addBtnText}>+ Create</Text></TouchableOpacity>}
      />
      <FlatList data={polls} keyExtractor={p => p.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="📊" title="No polls yet" description="Create the first poll for the community!" />}
        renderItem={({ item }) => {
          const voted = hasVoted(item);
          const total = item.totalVotes || item.options.reduce((s, o) => s + o.votes, 0);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.question}>{item.question}</Text>
                <Badge label={item.category} variant="info" size="sm" />
              </View>
              <View style={styles.optionsList}>
                {item.options.map(opt => {
                  const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                  const isChosen = opt.voters.includes('user1');
                  return (
                    <TouchableOpacity key={opt.id} style={[styles.option, isChosen && styles.optionChosen]}
                      onPress={() => !voted && vote(item.id, opt.id)} disabled={voted}>
                      {voted && <View style={[styles.optionBar, { width: `${pct}%` }]} />}
                      <View style={styles.optionContent}>
                        <Text style={[styles.optionText, isChosen && styles.optionTextChosen]}>{opt.text}</Text>
                        {voted && <Text style={styles.optionPct}>{pct}% ({opt.votes})</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>🗳️ {total} votes</Text>
                <Text style={styles.footerText}>👤 {item.createdByName}</Text>
                <Text style={styles.footerText}>📅 {new Date(item.expiresAt).toLocaleDateString()}</Text>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Create Poll</Text><TouchableOpacity onPress={() => setShowCreate(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Question *</Text>
              <TextInput style={styles.input} value={form.question} onChangeText={v => setForm({...form, question: v})} placeholder="Ask the community..." />
              <Text style={styles.inputLabel}>Options * (min 2)</Text>
              {form.options.map((opt, i) => (
                <View key={i} style={styles.optRow}>
                  <TextInput style={[styles.input, { flex: 1 }]} value={opt} onChangeText={v => { const o = [...form.options]; o[i] = v; setForm({...form, options: o}); }} placeholder={`Option ${i + 1}`} />
                  {form.options.length > 2 && <TouchableOpacity onPress={() => setForm({...form, options: form.options.filter((_, j) => j !== i)})}><Text style={styles.removeOpt}>✕</Text></TouchableOpacity>}
                </View>
              ))}
              <TouchableOpacity onPress={() => setForm({...form, options: [...form.options, '']})}><Text style={styles.addOpt}>+ Add Option</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={createPoll}><Text style={styles.submitText}>📊 Create Poll</Text></TouchableOpacity>
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
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  question: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  optionsList: { gap: spacing.sm, marginBottom: spacing.md },
  option: { borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', position: 'relative' },
  optionChosen: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
  optionBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.primaryFaded, opacity: 0.5 },
  optionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  optionText: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontWeight: typography.fontWeight.medium },
  optionTextChosen: { fontWeight: typography.fontWeight.bold, color: colors.primary },
  optionPct: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.bold },
  cardFooter: { flexDirection: 'row', gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  footerText: { fontSize: typography.fontSize.xs, color: colors.textTertiary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formModal: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  modalBody: { padding: spacing.xl },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSize.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  removeOpt: { fontSize: typography.fontSize.lg, color: colors.error, padding: spacing.sm },
  addOpt: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.md },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.lg },
  submitText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
});

export default PollsScreen;
