import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../theme";
import { formatCadFromCoins } from "../lib/currency";
import type { ApiOfferDisplay } from "../lib/api";

type OfferCardProps = {
  offer: ApiOfferDisplay;
  index: number;
  onPress?: () => void;
};

export function OfferCard({ offer, onPress }: OfferCardProps) {
  const price = formatCadFromCoins(offer.payoutCoins);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.accentMark} />
      <Text style={styles.title} numberOfLines={1}>
        {offer.title}
      </Text>
      <Text style={styles.provider} numberOfLines={1}>
        {offer.provider}
      </Text>
      <View style={styles.row}>
        <Text style={styles.price}>${price}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{offer.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Aurora layout language: no bordered/filled card panel -- offers are
  // grouped with spacing, a soft drop shadow, and typography hierarchy only
  // (packages/tokens/tokens.json meta.antiPatterns: "no bounded card/box
  // chrome as the default layout language"). Previously this relied on
  // theme.colors.card / theme.colors.elevated, which don't exist on the
  // regenerated Aurora theme.ts and were rendering as transparent -- fixed
  // as part of this reskin rather than left as a silent pre-existing bug.
  card: {
    width: 220,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  accentMark: {
    width: 28,
    height: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.md,
    fontWeight: "800",
  },
  provider: {
    color: theme.colors.muted,
    fontSize: theme.font.xs,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  price: {
    color: theme.colors.accent,
    fontSize: theme.font.lg,
    fontWeight: "900",
    fontFamily: "JetBrainsMono-Regular",
  },
  tag: {
    backgroundColor: "rgba(245,243,239,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  tagText: {
    color: theme.colors.muted,
    fontSize: theme.font.xs,
    fontWeight: "600",
  },
});
