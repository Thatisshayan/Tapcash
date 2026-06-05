import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tapCashTheme } from "../../../src/theme";
import {
  formatCoins,
  formatCadFromCoins,
  tapCashOffers,
  tapCashLedgerSummary,
  TapCashOffer,
} from "../../../../shared/tapcash-content";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const offer = useMemo(() => {
    return tapCashOffers.find((o) => o.id === id) ?? tapCashOffers[0];
  }, [id]);

  const accent =
    offer.accent === "blue"
      ? tapCashTheme.colors.purple
      : offer.accent === "gold"
        ? tapCashTheme.colors.yellow
        : tapCashTheme.colors.cyan;

  const tapScore = Math.min(
    100,
    Math.round((offer.payoutCoins / offer.estimateMinutes) * 2)
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Offer details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.heroCard, { borderColor: accent + "30" }]}>
          <View style={[styles.accentGlow, { backgroundColor: accent + "12" }]} />
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: accent + "18" }]}>
              <Text style={[styles.categoryText, { color: accent }]}>
                {offer.category}
              </Text>
            </View>
            <Text style={styles.providerText}>{offer.provider}</Text>
          </View>
          <Text style={styles.heroTitle}>{offer.title}</Text>
          <Text style={styles.heroDesc}>{offer.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accent }]}>
                {formatCoins(offer.payoutCoins)}
              </Text>
              <Text style={styles.statLabel}>Payout</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{offer.estimateMinutes} min</Text>
              <Text style={styles.statLabel}>Est. time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      tapScore >= 70
                        ? tapCashTheme.colors.green
                        : tapScore >= 40
                          ? tapCashTheme.colors.yellow
                          : tapCashTheme.colors.muted,
                  },
                ]}
              >
                {tapScore}
              </Text>
              <Text style={styles.statLabel}>TapScore</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: accent }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepLabel}>Start the offer</Text>
                <Text style={styles.stepDesc}>
                  Tap the button below to open the offer in a secure web view.
                </Text>
              </View>
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: accent }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepLabel}>Complete the task</Text>
                <Text style={styles.stepDesc}>
                  Follow the instructions. Most offers take {offer.estimateMinutes} minutes.
                </Text>
              </View>
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: accent }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepLabel}>Get credited</Text>
                <Text style={styles.stepDesc}>
                  Coins appear in your balance once the provider confirms completion.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Your balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceValue}>
              {formatCoins(tapCashLedgerSummary.balanceCoins)}
            </Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>CAD equivalent</Text>
            <Text style={styles.balanceSub}>
              {formatCadFromCoins(tapCashLedgerSummary.balanceCoins)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={[styles.startBtn, { backgroundColor: accent }]}>
          <Text style={styles.startText}>{offer.cta}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tapCashTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tapCashTheme.spacing.lg,
    paddingBottom: tapCashTheme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: tapCashTheme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  headerTitle: {
    color: tapCashTheme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    paddingHorizontal: tapCashTheme.spacing.lg,
    gap: tapCashTheme.spacing.md,
  },
  heroCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: tapCashTheme.spacing.lg,
    gap: 12,
    overflow: "hidden",
  },
  accentGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: tapCashTheme.radius.xl,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  providerText: {
    color: tapCashTheme.colors.muted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: tapCashTheme.colors.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    zIndex: 1,
  },
  heroDesc: {
    color: tapCashTheme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
    zIndex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: tapCashTheme.radius.lg,
    padding: tapCashTheme.spacing.md,
    marginTop: 4,
    zIndex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: tapCashTheme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  statLabel: {
    color: tapCashTheme.colors.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: tapCashTheme.colors.border,
  },
  infoCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: tapCashTheme.spacing.lg,
    gap: tapCashTheme.spacing.md,
  },
  infoTitle: {
    color: tapCashTheme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  stepsList: {
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 10,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepLabel: {
    color: tapCashTheme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  stepDesc: {
    color: tapCashTheme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  stepDivider: {
    height: 1,
    backgroundColor: tapCashTheme.colors.border,
    marginLeft: 22,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: tapCashTheme.colors.muted,
    fontSize: 13,
  },
  balanceValue: {
    color: tapCashTheme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  balanceSub: {
    color: tapCashTheme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: tapCashTheme.spacing.lg,
    paddingTop: tapCashTheme.spacing.md,
  },
  startBtn: {
    minHeight: 54,
    borderRadius: tapCashTheme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  startText: {
    color: tapCashTheme.colors.background,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
