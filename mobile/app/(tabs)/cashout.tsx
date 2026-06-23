import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { theme } from "../../src/theme";
import { GlassCard } from "../../src/components/GlassCard";
import { useAuth } from "../../src/auth/AuthContext";
import { subscribeToBalance } from "../../src/lib/firestore";
import { requestPayout, type ApiOfferDisplay } from "../../src/lib/api";

const methods = [
  { id: "paypal", icon: "P", label: "PayPal", sub: "Instant", keyboard: "email-address" as const, placeholder: "paypal@example.com" },
  { id: "interac", icon: "B", label: "Interac e-Transfer", sub: "Canada 🌿 · 1-2 hours", keyboard: "email-address" as const, placeholder: "email@example.com" },
  { id: "amazon", icon: "A", label: "Amazon Gift Card", sub: "Instant", keyboard: "email-address" as const, placeholder: "email@example.com" },
  { id: "crypto", icon: "₿", label: "Crypto", sub: "~15 min", keyboard: "default" as const, placeholder: "Wallet address" },
  { id: "bank", icon: "🏦", label: "Bank Transfer", sub: "1-5 days", keyboard: "default" as const, placeholder: "Account number" },
];

const MIN_COINS = 2000;

export default function CashoutScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selected, setSelected] = useState("interac");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState({ balanceCoins: 0, pendingCoins: 0 });
  const [loadingBalance, setLoadingBalance] = useState(true);

  const selectedMethod = methods.find((m) => m.id === selected) ?? methods[0];

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToBalance(user.uid, (state) => {
      setBalance(state);
      setLoadingBalance(false);
    });
    return unsub;
  }, [user?.uid]);

  const handleMethodPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    setDestination("");
    setSecurityQuestion("");
    setSecurityAnswer("");
  };

  const handleCashout = async () => {
    if (!amount.trim() || !destination.trim()) {
      Alert.alert("Missing info", "Enter an amount and destination.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid amount", "Enter a valid cash-out amount.");
      return;
    }

    const amountCoins = Math.round(amountNum * 1000);
    if (amountCoins < MIN_COINS) {
      Alert.alert("Minimum not met", `You need at least ${MIN_COINS / 1000} coins ($${MIN_COINS / 1000}) to cash out.`);
      return;
    }

    if (amountCoins > balance.balanceCoins) {
      Alert.alert("Insufficient balance", "You don't have enough coins for this cashout.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      const result = await requestPayout(amountCoins, selected, destination.trim().toLowerCase());
      if (result.success) {
        Alert.alert("Request submitted!", "Your cashout is under review.");
        setAmount("");
        setDestination("");
        setSecurityQuestion("");
        setSecurityAnswer("");
      } else {
        Alert.alert("Error", result.error || "Failed to submit cashout request.");
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to submit cashout request.");
    } finally {
      setSubmitting(false);
    }
  };

  const balanceCad = (balance.balanceCoins / 1000).toFixed(2);
  const minW = 20;
  const prog = Math.min((balance.balanceCoins / (minW * 1000)) * 100, 100);
  const canCashout = balance.balanceCoins >= MIN_COINS && !submitting;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
    >
      {/* Balance Card */}
      <GlassCard>
        <Text style={styles.balanceLabel}>YOUR BALANCE</Text>
        <View style={styles.balanceRow}>
          {loadingBalance ? (
            <Text style={styles.balanceAmount}>---</Text>
          ) : (
            <Text style={styles.balanceAmount}>${balanceCad}</Text>
          )}
          <Text style={styles.balanceToday}>
            {balance.pendingCoins > 0 ? `+$${(balance.pendingCoins / 1000).toFixed(2)} pending` : "+$0.00 today"}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${prog}%` as any }]} />
        </View>
        <Text style={styles.balanceMeta}>Min. $2.00 to withdraw · ${balanceCad} / $20.00</Text>
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
            <View style={[styles.methodIcon, { backgroundColor: theme.colors.elevated }]}>
              <Text style={[styles.methodIconText, { color: theme.colors.text }]}>{m.icon}</Text>
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
      <Text style={styles.minNotice}>Min. $2.00 required</Text>

      {/* Destination input */}
      <Text style={styles.sectionTitle}>Destination</Text>
      <TextInput
        style={styles.destinationInput}
        value={destination}
        onChangeText={setDestination}
        placeholder={selectedMethod.placeholder}
        placeholderTextColor={theme.colors.dim}
        keyboardType={selectedMethod.keyboard}
        autoCapitalize="none"
      />

      {/* Interac security fields */}
      {selected === "interac" && (
        <View style={styles.interacFields}>
          <Text style={styles.interacLabel}>Security Question</Text>
          <TextInput
            style={styles.interacInput}
            value={securityQuestion}
            onChangeText={setSecurityQuestion}
            placeholder="e.g., What is your pet's name?"
            placeholderTextColor={theme.colors.dim}
          />
          <Text style={styles.interacLabel}>Security Answer</Text>
          <TextInput
            style={styles.interacInput}
            value={securityAnswer}
            onChangeText={setSecurityAnswer}
            placeholder="Your answer"
            placeholderTextColor={theme.colors.dim}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Cash out now */}
      <TouchableOpacity
        style={[styles.cashoutBtn, !canCashout && styles.cashoutBtnDisabled]}
        onPress={handleCashout}
        activeOpacity={0.8}
        disabled={!canCashout}
      >
        {submitting ? (
          <ActivityIndicator color={theme.colors.bg} />
        ) : (
          <Text style={styles.cashoutBtnText}>
            {balance.balanceCoins < MIN_COINS ? `Earn $${MIN_COINS / 1000} to unlock` : "Cash Out Now"}
          </Text>
        )}
      </TouchableOpacity>
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
  methodIcon: { width: 36, height: 36, borderRadius: theme.radius.full, alignItems: "center", justifyContent: "center" },
  methodIconText: { fontWeight: "700", fontSize: theme.font.md },
  methodInfo: { flex: 1 },
  methodLabel: { color: theme.colors.text, fontSize: theme.font.md, fontWeight: "700" },
  methodSub: { color: theme.colors.muted, fontSize: theme.font.sm, marginTop: 2 },
  amountContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: theme.spacing.xs, marginTop: theme.spacing.md },
  amountPrefix: { color: theme.colors.green, fontSize: theme.font.xl, fontWeight: "900", fontFamily: "JetBrainsMono-Regular" },
  amountInput: { color: theme.colors.green, fontSize: theme.font.hero, fontWeight: "900", fontFamily: "JetBrainsMono-Regular", minWidth: 120, textAlign: "center" },
  minNotice: { color: theme.colors.muted, fontSize: theme.font.xs, textAlign: "center", marginTop: theme.spacing.xs },
  destinationInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.font.md,
  },
  interacFields: { gap: theme.spacing.sm },
  interacLabel: { color: theme.colors.muted, fontSize: theme.font.xs, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginTop: theme.spacing.sm },
  interacInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.font.md,
  },
  cashoutBtn: { width: "100%", height: 54, borderRadius: 14, backgroundColor: theme.colors.green, alignItems: "center", justifyContent: "center", marginTop: theme.spacing.md },
  cashoutBtnDisabled: { backgroundColor: theme.colors.muted },
  cashoutBtnText: { color: theme.colors.bg, fontSize: theme.font.md, fontWeight: "800" },
});
