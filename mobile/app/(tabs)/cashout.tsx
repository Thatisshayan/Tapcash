import { ScrollView, View, Text, StyleSheet } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { tapCashTheme } from "../../src/theme";
import { formatCoins, tapCashPayoutMethods, tapCashLedgerSummary } from "../../../shared/tapcash-content";

export default function CashoutScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="Cashout"
        title="Payouts stay visible before you tap."
        description="The mobile payout store mirrors the web hierarchy: threshold, timing, and audience fit."
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceValue}>{formatCoins(tapCashLedgerSummary.balanceCoins)}</Text>
          <Text style={styles.balanceSub}>{tapCashLedgerSummary.balanceCad}</Text>
        </View>

        <View style={styles.grid}>
          {tapCashPayoutMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <Text style={styles.methodAudience}>{method.audience}</Text>
              <Text style={styles.methodTitle}>{method.label}</Text>
              <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              <View style={styles.methodDivider} />
              <Text style={styles.methodMeta}>Minimum {formatCoins(method.minCoins)}</Text>
              <Text style={styles.methodMeta}>{method.eta}</Text>
            </View>
          ))}
        </View>
      </ScreenFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tapCashTheme.colors.background },
  content: { paddingBottom: 28 },
  balanceCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 18,
    gap: 8,
  },
  balanceLabel: { color: tapCashTheme.colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.6 },
  balanceValue: { color: tapCashTheme.colors.text, fontSize: 34, fontWeight: "900" },
  balanceSub: { color: tapCashTheme.colors.muted, fontSize: 13 },
  grid: { gap: 12 },
  methodCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 16,
    gap: 8,
  },
  methodAudience: { color: "#f5c842", fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.4 },
  methodTitle: { color: tapCashTheme.colors.text, fontSize: 20, fontWeight: "900" },
  methodSubtitle: { color: tapCashTheme.colors.muted, fontSize: 13, lineHeight: 18 },
  methodDivider: { height: 1, backgroundColor: tapCashTheme.colors.border, marginVertical: 4 },
  methodMeta: { color: tapCashTheme.colors.text, fontSize: 12 },
});
