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
import * as WebBrowser from "expo-web-browser";
import { theme } from "../../src/theme";
import { OfferCard } from "../../src/components/OfferCard";
import { loadOffers, recordClick, type ApiOfferDisplay } from "../../src/lib/api";
import { useAuth } from "../../src/auth/AuthContext";

const FILTERS = ["All", "High Paying", "Fast Payout", "No Purchase", "Easy"];

export default function EarnScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [offers, setOffers] = useState<ApiOfferDisplay[]>([]);
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    if (!user?.uid) return;
    try {
      const items = await loadOffers(user.uid);
      setOffers(items);
    } catch (e) {
      console.warn("Failed to load offers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user?.uid]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const handleOfferPress = useCallback(
    async (offer: ApiOfferDisplay) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (user?.uid && offer.clickUrl) {
        try {
          await recordClick(user.uid, offer.id, offer.provider);
        } catch (e) {
          console.warn("Click tracking failed:", e);
        }
        try {
          await WebBrowser.openBrowserAsync(offer.clickUrl);
        } catch (e) {
          console.warn("Browser open failed:", e);
        }
      }
    },
    [user?.uid]
  );

  const filteredOffers = offers.filter((offer) => {
    if (filter === "All") return true;
    if (filter === "High Paying") return offer.payoutCoins >= 500;
    if (filter === "Fast Payout") return true;
    if (filter === "No Purchase") return true;
    if (filter === "Easy") return true;
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

      {loading ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      ) : filteredOffers.length === 0 ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>No offers available right now.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredOffers.map((offer, idx) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={idx}
              onPress={() => handleOfferPress(offer)}
            />
          ))}
        </View>
      )}
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
  loadingWrap: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: theme.font.sm,
  },
});
