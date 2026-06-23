import { useCallback, useEffect, useState, useRef } from "react";
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

function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.skeleton}>
      <Animated.View
        style={[
          styles.skeletonInner,
          { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }) },
        ]}
      />
    </View>
  );
}

export default function EarnScreen() {
  const insets = useSafeAreaInsets();
  const { user, notificationPermissionDenied, enableNotifications } = useAuth();
  const [offers, setOffers] = useState<ApiOfferDisplay[]>([]);
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOffers = async () => {
    if (!user?.uid) return;
    setFetchError(null);
    try {
      const items = await loadOffers(user.uid);
      setOffers(items);
    } catch (e) {
      console.warn("Failed to load offers:", e);
      setFetchError("Couldn't load offers. Pull to refresh.");
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

  const handleNotificationBannerPress = async () => {
    await Linking.openSettings();
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

      {notificationPermissionDenied && (
        <TouchableOpacity style={styles.notifBanner} onPress={handleNotificationBannerPress} activeOpacity={0.8}>
          <Text style={styles.notifBannerText}>Enable notifications to know when your coins land</Text>
        </TouchableOpacity>
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

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : fetchError ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>{fetchError}</Text>
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
  notifBanner: {
    backgroundColor: "rgba(0, 255, 133, 0.1)",
    borderColor: "rgba(0, 255, 133, 0.3)",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  notifBannerText: {
    color: theme.colors.green,
    fontSize: theme.font.sm,
    fontWeight: "600",
    textAlign: "center",
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
  skeleton: {
    height: 140,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  skeletonInner: {
    flex: 1,
    backgroundColor: theme.colors.elevated,
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
