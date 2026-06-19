import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { theme } from "../../src/theme";
import { OfferCard } from "../../src/components/OfferCard";
import { loadOffers } from "../../src/lib/api";
import { TapCashOffer, tapCashOffers } from "../../../shared/tapcash-content";

const FILTERS = ["All", "High Paying", "Fast Payout", "No Purchase", "Easy"];

export default function EarnScreen() {
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState<TapCashOffer[]>(tapCashOffers);
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = async () => {
    const items = await loadOffers();
    if (Array.isArray(items) && items.length > 0) {
      setOffers(items as TapCashOffer[]);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const filteredOffers = offers.filter((offer) => {
    if (filter === "All") return true;
    if (filter === "High Paying") return offer.payoutCoins >= 500;
    if (filter === "Fast Payout") return offer.estimateMinutes <= 15;
    if (filter === "No Purchase") return true; // Placeholder
    if (filter === "Easy") return offer.estimateMinutes <= 10;
    return true;
  });

  const handleFilterPress = (f: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(f);
  };

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.green} />
      }
    >
      <Text style={styles.headerTitle}>Top Offers</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => {
          const isActive = f === filter;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                isActive ? styles.filterPillActive : styles.filterPillInactive,
              ]}
              onPress={() => handleFilterPress(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {filteredOffers.map((offer, idx) => (
          <OfferCard key={offer.id} offer={offer} index={idx} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: "900",
  },
  filterRow: {
    maxHeight: 40,
  },
  filterContent: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  filterPillActive: {
    backgroundColor: theme.colors.green,
  },
  filterPillInactive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  filterText: {
    fontSize: theme.font.sm,
    fontWeight: "700",
  },
  filterTextActive: {
    color: theme.colors.bg,
  },
  filterTextInactive: {
    color: "rgba(255,255,255,0.5)",
  },
  list: {
    gap: theme.spacing.md,
  },
});
