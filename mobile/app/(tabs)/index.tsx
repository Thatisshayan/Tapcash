import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { loadActivity, loadLeaderboard, loadOffers } from "../../src/lib/api";
import { subscribeToBalance, type BalanceState } from "../../src/lib/firestore";
import { tapCashTheme } from "../../src/theme";
import { formatCadFromCoins, formatCoins, tapCashLedgerSummary, tapCashOffers } from "../../../shared/tapcash-content";
import { useAuth } from "../../src/auth/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    offers: 0,
    leaderboard: 0,
    activity: 0,
  });
  const [balance, setBalance] = useState<BalanceState>({ balanceCoins: tapCashLedgerSummary.balanceCoins, pendingCoins: tapCashLedgerSummary.pendingCoins });

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [offers, leaderboard, activity] = await Promise.all([loadOffers(), loadLeaderboard(), loadActivity()]);
      if (mounted) {
        setStats({ offers: offers.length, leaderboard: leaderboard.length, activity: activity.length });
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToBalance(user.uid, (state) => {
      setBalance(state);
    });

    return unsubscribe;
  }, [user?.uid]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="TapCash mobile"
        title="A cleaner rewards shell on iPhone."
        description="The app reuses the same payout clarity and live-proof content model as the web surface."
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Ledger balance</Text>
          <Text style={styles.heroValue}>{formatCoins(balance.balanceCoins)}</Text>
          <Text style={styles.heroSub}>{formatCadFromCoins(balance.balanceCoins)} available</Text>
          {balance.pendingCoins > 0 && (
            <Text style={styles.pendingText}>{formatCoins(balance.pendingCoins)} pending</Text>
          )}
        </View>

        <View style={styles.metricGrid}>
          {[
            { label: "Offers", value: stats.offers || tapCashOffers.length },
            { label: "Leaderboard", value: stats.leaderboard || 4 },
            { label: "Activity", value: stats.activity || 4 },
          ].map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.surface}>
          <Text style={styles.surfaceLabel}>What is active</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>Live proof and payout clarity stay visible.</Text>
            <Text style={styles.listItem}>The same content language drives web and iOS.</Text>
            <Text style={styles.listItem}>Auth and provider calls remain server-controlled.</Text>
          </View>
        </View>
      </ScreenFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tapCashTheme.colors.background },
  content: { paddingBottom: 28 },
  heroCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 18,
    gap: 6,
  },
  heroLabel: { color: tapCashTheme.colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.8 },
  heroValue: { color: tapCashTheme.colors.text, fontSize: 34, fontWeight: "900" },
  heroSub: { color: tapCashTheme.colors.muted, fontSize: 13 },
  pendingText: { color: tapCashTheme.colors.accent, fontSize: 13, fontWeight: "600" },
  metricGrid: { flexDirection: "row", gap: 10 },
  metricCard: {
    flex: 1,
    borderRadius: tapCashTheme.radius.lg,
    backgroundColor: tapCashTheme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 14,
    gap: 6,
  },
  metricLabel: { color: tapCashTheme.colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.5 },
  metricValue: { color: tapCashTheme.colors.text, fontSize: 28, fontWeight: "900" },
  surface: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 18,
    gap: 10,
  },
  surfaceLabel: { color: "#f5c842", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.8 },
  list: { gap: 10 },
  listItem: { color: tapCashTheme.colors.text, fontSize: 14, lineHeight: 20 },
});