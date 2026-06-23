import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { theme } from "../../src/theme";
import { OfferCard } from "../../src/components/OfferCard";
import { loadOffers, recordClick, type ApiOfferDisplay } from "../../src/lib/api";
import { useAuth } from "../../src/auth/AuthContext";

const FILTERS = ["All", "High Paying", "Fast Payout", "No Purchase", "Easy"];

export default function EarnScreen() {
  const insets = useSafeAreaInsets();
  const { user, notificationPermissionDenied } = useAuth();
  const [offers, setOffers] = useState<ApiOfferDisplay[]>([]);
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const opacity = useState(new Animated.Value(1))[0];

  const fetchOffers = async () => {
    if (!user?.uid) return;
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    try {
      const items = await loadOffers(user.uid);
      setOffers(items);
    } catch (e) {
      console.warn("Failed to load offers:", e);
    } finally {
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
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

  const handleEnableNotifications = async () => {
    await Linking.openSettings();
  };

  if (loading) {
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
              <View
                key={f}
                style={[
                  styles.filterPill,
                  isActive ? styles.filterPillActive : styles.filterPillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive ? styles.filterTextActive : styles.filterTextInactive,
                  ]}
                >
                  {f}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <Animated.View style={[styles.skeletonList, { opacity }]}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <Animated.View style={styles.skeletonAccent} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonProvider} />
                <View style={styles.skeletonRow}>
                  <View style={styles.skeletonPrice} />
                  <View style={styles.skeletonTag} />
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.green} />
      }
    >
      <Text style={styles.headerTitle}>Top Offers</Text>

      {notificationPermissionDenied && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Enable notifications to know when your coins land
          </Text>
          <TouchableOpacity onPress={handleEnableNotifications} style={styles.permissionBtn}>
            <Text style={styles.permissionBtnText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {filteredOffers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No offers available right now. Pull to refresh.</Text>
        </View>
      ) : (
        <Animated.View style={[styles.list, { opacity }]}>
          {filteredOffers.map((offer, idx) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={idx}
              onPress={() => handleOfferPress(offer)}
            />
          ))}
        </Animated.View>
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
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 177, 0, 0.15)",
    borderColor: "rgba(255, 177, 0, 0.3)",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  permissionText: {
    color: theme.colors.text,
    fontSize: theme.font.sm,
    flex: 1,
  },
  permissionBtn: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  permissionBtnText: {
    color: theme.colors.bg,
    fontSize: theme.font.sm,
    fontWeight: "700",
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
  emptyState: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: theme.font.sm,
    textAlign: "center",
  },
  skeletonList: {
    gap: theme.spacing.md,
  },
  skeletonCard: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonAccent: {
    height: 3,
    backgroundColor: theme.colors.green,
    opacity: 0.3,
  },
  skeletonContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: theme.colors.elevated,
    borderRadius: 4,
    width: "80%",
  },
  skeletonProvider: {
    height: 12,
    backgroundColor: theme.colors.elevated,
    borderRadius: 4,
    width: "60%",
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  skeletonPrice: {
    height: 16,
    backgroundColor: theme.colors.elevated,
    borderRadius: 4,
    width: 60,
  },
  skeletonTag: {
    height: 20,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.xs,
    width: 80,
  },
});