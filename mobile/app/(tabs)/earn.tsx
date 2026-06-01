import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { loadOffers } from "../../src/lib/api";
import { tapCashTheme } from "../../src/theme";
import { formatCoins, tapCashOffers } from "../../../shared/tapcash-content";

export default function EarnScreen() {
  const [offers, setOffers] = useState(tapCashOffers);

  useEffect(() => {
    let mounted = true;
    loadOffers().then((items) => {
      if (mounted && Array.isArray(items) && items.length > 0) {
        setOffers(
          items.slice(0, 4).map((offer: any) => ({
            id: offer.id,
            title: offer.title,
            provider: offer.provider,
            category: offer.category ?? "Offer",
            payoutCoins: offer.payoutCoins ?? offer.payout ?? 0,
            estimateMinutes: offer.estimateMinutes ?? 10,
            description: offer.description ?? "",
            accent: offer.accent ?? "teal",
            cta: offer.cta ?? "Open",
          }))
        );
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="Earn"
        title="Best-fit offers first."
        description="The mobile flow surfaces the same offer hierarchy as web, but tuned for thumb reach."
      >
        <View style={styles.stack}>
          {offers.map((offer) => {
            return (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerBadge}>{offer.provider} · {offer.category}</Text>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerDesc}>{offer.description}</Text>
                  </View>
                  <View style={styles.offerPayout}>
                    <Text style={styles.offerPayoutLabel}>Payout</Text>
                    <Text style={styles.offerPayoutValue}>{formatCoins(offer.payoutCoins)}</Text>
                  </View>
                </View>
                <View style={styles.offerBottom}>
                  <Text style={styles.offerMeta}>{offer.estimateMinutes} min session</Text>
                  <Text style={styles.offerCta}>{offer.cta}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScreenFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tapCashTheme.colors.background },
  content: { paddingBottom: 28 },
  stack: { gap: 12 },
  offerCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 16,
    gap: 14,
  },
  offerTop: { flexDirection: "row", gap: 12 },
  offerBadge: { color: tapCashTheme.colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.4 },
  offerTitle: { color: tapCashTheme.colors.text, fontSize: 20, fontWeight: "900", marginTop: 6 },
  offerDesc: { color: tapCashTheme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  offerPayout: {
    minWidth: 104,
    borderRadius: tapCashTheme.radius.lg,
    backgroundColor: tapCashTheme.colors.surfaceAlt,
    padding: 12,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  offerPayoutLabel: { color: tapCashTheme.colors.muted, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  offerPayoutValue: { color: tapCashTheme.colors.text, fontSize: 18, fontWeight: "900", marginTop: 6 },
  offerBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  offerMeta: { color: tapCashTheme.colors.muted, fontSize: 12 },
  offerCta: { color: tapCashTheme.colors.accent, fontSize: 12, fontWeight: "800" },
});
