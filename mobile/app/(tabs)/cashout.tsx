import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { theme } from "../../src/theme";
import { GlassCard } from "../../src/components/GlassCard";
import { formatCoins, tapCashPayoutMethods, tapCashLedgerSummary } from "../../../shared/tapcash-content";

const methods = [
  { id: "paypal", icon: "P", label: "PayPal", sub: "Instant" },
  { id: "interac", icon: "B", label: "Interac e-Transfer", sub: "Canada \ud83c\udf41 · 1-2 hours" },
  { id: "amazon", icon: "A", label: "Amazon Gift Card", sub: "Instant" },
  { id: "crypto", icon: "₿", label: "Crypto", sub: "~15 min" },
  { id: "bank", icon: "\ud83c\udfe6", label: "Bank Transfer", sub: "1-5 days" },
];

const recent = [
  { name: "Emma W.", amount: "125.00", method: "PayPal", time: "Just now" },
  { name: "Liam T.", amount: "45.50", method: "Interac", time: "2 min ago" },
  { name: "Olivia R.", amount: "200.00", method: "Crypto", time: "15 min ago" },
  { name: "Noah S.", amount: "12.00", method: "Amazon", time: "1 hr ago" },
];

export default function CashoutScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("interac");
  const [amount, setAmount] = useState("");

  const handleMethodPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleCashout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
    >
      {/* Balance Card */}
      <GlassCard>
        <Text style={styles.balanceLabel}>YOUR BALANCE</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>$12.50</Text>
          <Text style={styles.balanceToday}>+$4.20 today</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "62%" }]} />
        </View>
        <Text style={styles.balanceMeta}>Min. $20 to withdraw · $12.50 / $20</Text>
      </GlassCard>

      {/* Withdraw to */}
      <Text style={styles.sectionTitle}>Withdraw to</Text>
      {methods.map((m) => {
        const isSelected = m.id === selected;
        return (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.methodRow,
              { borderColor: isSelected ? theme.colors.green : theme.colors.border },
            ]}
            onPress={() => handleMethodPress(m.id)}
            activeOpacity={0.8}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>{m.icon}</Text>
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodLabel}>{m.label}</Text>
              <Text style={styles.methodSub}>{m.sub}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Amount input */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountPrefix}>$</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={theme.colors.dim}
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.minNotice}>Min. $20.00 required</Text>

      {/* Cash out now */}
      <TouchableOpacity style={styles.cashoutBtn} onPress={handleCashout} activeOpacity={0.8}>
        <Text style={styles.cashoutBtnText}>Cash Out Now</Text>
      </TouchableOpacity>

      {/* Recent payouts */}
      <Text style={styles.sectionTitle}>Recent Payouts</Text>
      {recent.map((r, idx) => (
        <GlassCard key={idx} style={styles.payoutCard}>
          <View style={styles.payoutRow}>
            <View style={styles.payoutIcon}>
              <Text style={styles.payoutIconText}>{r.method[0]}</Text>
            </View>
            <View style={styles.payoutInfo}>
              <Text style={styles.payoutName}>{r.name} cashed out</Text>
              <Text style={styles.payoutMeta}>
                via {r.method} · {r.time}
              </Text>
            </View>
            <Text style={styles.payoutAmount}>${r.amount}</Text>
          </View>
        </GlassCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl, gap: theme.spacing.md },
  balanceLabel: { color: theme.colors.muted, fontSize: theme.font.xs, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: theme.spacing.sm },
  balanceRow: { flexDirection: "row", alignItems: "baseline", gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  balanceAmount: { color: theme.colors.text, fontSize: theme.font.xxl, fontWeight: "900" },
  balanceToday: { color: theme.colors.green, fontSize: theme.font.sm, fontWeight: "600" },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: theme.spacing.xs },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: theme.colors.green },
  balanceMeta: { color: theme.colors.muted, fontSize: theme.font.xs },
  sectionTitle: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "900", marginTop: theme.spacing.sm },
  methodRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, backgroundColor: theme.colors.card, borderRadius: theme.radius.md, borderWidth: 1, padding: theme.spacing.md },
  methodIcon: { width: 36, height: 36, borderRadius: theme.radius.full, backgroundColor: theme.colors.elevated, alignItems: "center", justifyContent: "center" },
  methodIconText: { color: theme.colors.text, fontWeight: "700", fontSize: theme.font.md },
  methodInfo: { flex: 1 },
  methodLabel: { color: theme.colors.text, fontSize: theme.font.md, fontWeight: "700" },
  methodSub: { color: theme.colors.muted, fontSize: theme.font.sm, marginTop: 2 },
  amountContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: theme.spacing.xs, marginTop: theme.spacing.md },
  amountPrefix: { color: theme.colors.green, fontSize: theme.font.xl, fontWeight: "900", fontFamily: "JetBrainsMono-Regular" },
  amountInput: { color: theme.colors.green, fontSize: theme.font.hero, fontWeight: "900", fontFamily: "JetBrainsMono-Regular", minWidth: 120, textAlign: "center" },
  minNotice: { color: theme.colors.muted, fontSize: theme.font.xs, textAlign: "center", marginTop: theme.spacing.xs },
  cashoutBtn: { width: "100%", height: 54, borderRadius: 14, backgroundColor: theme.colors.green, alignItems: "center", justifyContent: "center", marginTop: theme.spacing.md },
  cashoutBtnText: { color: theme.colors.bg, fontSize: theme.font.md, fontWeight: "800" },
  payoutCard: { padding: theme.spacing.md },
  payoutRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  payoutIcon: { width: 32, height: 32, borderRadius: theme.radius.full, backgroundColor: theme.colors.purple, alignItems: "center", justifyContent: "center" },
  payoutIconText: { color: theme.colors.text, fontWeight: "bold", fontSize: theme.font.sm },
  payoutInfo: { flex: 1 },
  payoutName: { color: theme.colors.text, fontSize: theme.font.md, fontWeight: "600" },
  payoutMeta: { color: theme.colors.muted, fontSize: theme.font.xs, marginTop: 2 },
  payoutAmount: { color: theme.colors.green, fontSize: theme.font.md, fontWeight: "900", fontFamily: "JetBrainsMono-Regular" },
});
