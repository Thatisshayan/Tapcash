import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../theme";
import type { ApiOfferDisplay } from "../lib/api";

type OfferCardProps = {
  offer: ApiOfferDisplay;
  index: number;
  onPress?: () => void;
};

export function OfferCard({ offer, index, onPress }: OfferCardProps) {
  const price = (offer.payoutCoins / 100).toFixed(2);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={[styles.accentBar, { backgroundColor: theme.colors.green }]} />
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
  card: {
    width: 220,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginRight: theme.spacing.md,
  },
  accentBar: {
    height: 3,
    width: "100%",
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.md,
    fontWeight: "800",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  provider: {
    color: theme.colors.muted,
    fontSize: theme.font.xs,
    paddingHorizontal: theme.spacing.md,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  price: {
    color: theme.colors.green,
    fontSize: theme.font.lg,
    fontWeight: "900",
    fontFamily: "JetBrainsMono-Regular",
  },
  tag: {
    backgroundColor: theme.colors.elevated,
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
