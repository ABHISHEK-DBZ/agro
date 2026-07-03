// Loan Calculator Screen — EMI calculator with bilingual support
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';

const LOAN_TYPES: Record<string, { name: string; rate: string; limit: string; icon: string }> = {
  'kisan-credit': { name: 'Kisan Credit Card', rate: '7%', limit: '₹3L max', icon: '💳' },
  crop: { name: 'Crop Loan', rate: '7-9%', limit: '₹5L max', icon: '🌾' },
  equipment: { name: 'Equipment Loan', rate: '9-11%', limit: '₹10L max', icon: '🚜' },
  land: { name: 'Land Purchase', rate: '10-12%', limit: '₹50L max', icon: '🏠' },
};

export const LoanCalculatorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('7');
  const [tenure, setTenure] = useState('12');
  const [loanType, setLoanType] = useState('kisan-credit');

  const amt = parseFloat(amount) || 0;
  const r = parseFloat(rate) || 0;
  const n = parseInt(tenure) || 1;
  const monthlyRate = r / 12 / 100;
  const emi = monthlyRate && n ? (amt * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) : 0;
  const totalPay = emi * n;
  const totalInterest = totalPay - amt;

  const info = LOAN_TYPES[loanType];

  return (
    <View style={styles.container}>
      <Header title="Loan Calculator" subtitle="कृषि ऋण कैलकुलेटर" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Loan Type */}
        <View style={styles.card}>
          <Text style={styles.label}>Loan Type / ऋण प्रकार</Text>
          <View style={styles.chipRow}>
            {Object.entries(LOAN_TYPES).map(([key, val]) => (
              <TouchableOpacity key={key} style={[styles.chip, loanType === key && styles.chipActive]} onPress={() => setLoanType(key)}>
                <Text style={styles.chipIcon}>{val.icon}</Text>
                <Text style={[styles.chipText, loanType === key && styles.chipTextActive]}>{val.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.card}>
          <Text style={styles.label}>Loan Amount / ऋण राशि (₹)</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="100000" />
          <View style={styles.rangeRow}>
            <Text style={styles.rangeLabel}>₹10K</Text>
            <Text style={styles.rangeLabel}>₹50L</Text>
          </View>
        </View>

        {/* Rate */}
        <View style={styles.card}>
          <Text style={styles.label}>Interest Rate / ब्याज दर (%)</Text>
          <TextInput style={styles.input} value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="7" />
        </View>

        {/* Tenure */}
        <View style={styles.card}>
          <Text style={styles.label}>Tenure / अवधि (months)</Text>
          <TextInput style={styles.input} value={tenure} onChangeText={setTenure} keyboardType="numeric" placeholder="12" />
          <View style={styles.rangeRow}>
            <Text style={styles.rangeLabel}>6 months</Text>
            <Text style={styles.rangeLabel}>20 years</Text>
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>💰</Text>
          <Text style={styles.resultLabel}>Monthly EMI / मासिक EMI</Text>
          <Text style={styles.resultValue}>₹{emi ? Math.round(emi).toLocaleString('en-IN') : '0'}</Text>
          <Text style={styles.resultSub}>per month / प्रति माह</Text>
        </View>

        <View style={styles.breakdownRow}>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakLabel}>Principal / मूल राशि</Text>
            <Text style={styles.breakValue}>₹{amt.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakLabel}>Interest / ब्याज</Text>
            <Text style={[styles.breakValue, { color: colors.warning }]}>₹{Math.round(totalInterest).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Payment / कुल भुगतान</Text>
          <Text style={styles.totalValue}>₹{Math.round(totalPay).toLocaleString('en-IN')}</Text>
        </View>

        {/* Loan Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{info.icon} {info.name}</Text>
          <Text style={styles.infoText}>• Interest: {info.rate} | Limit: {info.limit}</Text>
          <Text style={styles.infoText}>• Govt subsidies available</Text>
          <Text style={styles.infoText}>• Minimal paperwork</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.md, ...shadows.sm },
  label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, gap: 4 },
  chipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: typography.fontSize.xl, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, textAlign: 'center', fontWeight: typography.fontWeight.bold },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  rangeLabel: { fontSize: typography.fontSize.xs, color: colors.textTertiary },
  resultCard: { backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: 'center', marginBottom: spacing.md, ...shadows.md },
  resultEmoji: { fontSize: 32, marginBottom: spacing.sm },
  resultLabel: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xs },
  resultValue: { fontSize: typography.fontSize.display, fontWeight: typography.fontWeight.bold, color: colors.white },
  resultSub: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs },
  breakdownRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  breakdownCard: { flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', ...shadows.sm },
  breakLabel: { fontSize: typography.fontSize.xs, color: colors.textTertiary, marginBottom: spacing.xs },
  breakValue: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  totalCard: { backgroundColor: colors.primaryFaded, borderRadius: borderRadius.lg, padding: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  totalLabel: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.primary },
  totalValue: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.primaryDark },
  infoCard: { backgroundColor: '#FEF3C7', borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.lg },
  infoTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: '#92400E', marginBottom: spacing.sm },
  infoText: { fontSize: typography.fontSize.sm, color: '#92400E', lineHeight: 22 },
});

export default LoanCalculatorScreen;
