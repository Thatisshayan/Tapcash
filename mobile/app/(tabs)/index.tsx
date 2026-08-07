import { useEffect, useState, useRef } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../../src/theme";
import { OfferCard } from "../../src/components/OfferCard";
import { useAuth } from "../../src/auth/AuthContext";
import { subscribeToBalance } from "../../src/lib/firestore";
import { loadOffers, type ApiOfferDisplay } from "../../src/lib/api";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const h = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const { user } = useAuth();
  const [balance, setBalance] = useState({ balanceCoins: 0, pendingCoins: 0 });
  const [offers, setOffers] = useState<ApiOfferDisplay[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const prevBalanceRef = useRef(0);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingBalance(false);
      setLoadingOffers(false);
      return;
    }

    const unsubBalance = subscribeToBalance(user.uid, (state) => {
      const newBalance = state.balanceCoins;
      if (prevBalanceRef.current !== 0 && newBalance > prevBalanceRef.current) {
        Animated.sequence([
          Animated.timing(balanceAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(balanceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      prevBalanceRef.current = newBalance;
      setBalance(state);
      setLoadingBalance(false);
    });

    let cancelled = false;
    setLoadingOffers(true);
    loadOffers(user.uid)
      .then((items) => {
        if (!cancelled) setOffers(items);
      })
      .catch((e) => {
        if (!cancelled) console.warn("Failed to load offers:", e);
      })
      .finally(() => {
        if (!cancelled) setLoadingOffers(false);
      });

    return () => {
      unsubBalance();
      cancelled = true;
    };
  }, [user?.uid]);

  const balanceCad = (balance.balanceCoins / 1000).toFixed(2);
  const minW = 20;
  const prog = Math.min((balance.balanceCoins / (minW * 1000)) * 100, 100);
  const initial = (user?.displayName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top + 12 }]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.logoText}>
          TAP<Text style={{ color: theme.colors.accent }}>CASH</Text>
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={h} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
      </View>

      {/* Aurora "stat cluster" -- huge tabular balance + borderless progress,
          no card panel around it (was GlassCard, which also silently rendered
          transparent since surface/surfaceAlt don't exist on the regenerated
          theme -- see PR notes). */}
      <View style={styles.balBlock}>
        <View style={styles.balHead}>
          <Text style={styles.balLabel}>YOUR BALANCE</Text>
          <Ionicons name="wallet-outline" size={18} color={theme.colors.accent} />
        </View>
        {loadingBalance ? (
          <Text style={styles.balAmt}>---</Text>
        ) : (
          <Animated.Text style={[styles.balAmt, { transform: [{ scale: balanceAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}>
            ${balanceCad}
          </Animated.Text>
        )}
        <Text style={styles.balToday}>
          {balance.pendingCoins > 0 ? `+$${(balance.pendingCoins / 1000).toFixed(2)} pending` : "No pending earnings"}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${prog}%` as any }]} />
        </View>
        <Text style={styles.balMeta}>Min. $20 to withdraw · ${balanceCad} / $20.00</Text>
      </View>

      {/*
        Removed from this pass, both hard anti-patterns per REDESIGN_SPEC.md /
        packages/tokens/tokens.json meta.antiPatterns -- see
        docs/governance/DEFERRED_WORK.md for the follow-on:
        - A permanent "LIVE PAYOUT" row that always showed the placeholder
          copy "Real-time payouts loading" / "$0.00" / "via Network · Just
          now" -- never real data, a fake live-activity row.
        - A CashPath tracker hardcoded to `ACTIVE = 2` for every user --
          this screen has no real per-user step data source to replace it
          with honestly; removing rather than reskinning a fake state.
        - Hardcoded "50K+ Users / $2.5M+ Paid / 98% Verified" stats with no
          backing API -- fabricated statistics, same class of bug the
          landing page already had removed for the same reason.
      */}

      <View style={styles.secHead}>
        <Text style={styles.secTitle}>Top Offers</Text>
        <TouchableOpacity onPress={h}>
          <Text style={styles.secLink}>View all →</Text>
        </TouchableOpacity>
      </View>
      {loadingOffers ? (
        <View style={styles.loadingRow}>
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offScroll}>
          {offers.slice(0, 3).map((o, i) => (
            <OfferCard key={o.id} offer={o} index={i} />
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl, gap: theme.spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.xs },
  logoText: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "800", letterSpacing: -0.2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  avatar: { width: 36, height: 36, borderRadius: theme.radius.full, backgroundColor: theme.colors.accentDeep, alignItems: "center", justifyContent: "center" },
  avatarText: { color: theme.colors.text, fontWeight: "800", fontSize: theme.font.sm },
  balBlock: { paddingVertical: theme.spacing.sm },
  balHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm },
  balLabel: { color: theme.colors.muted, fontSize: theme.font.xs, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  balAmt: { color: theme.colors.text, fontSize: 44, fontWeight: "800", fontVariant: ["tabular-nums"], marginBottom: theme.spacing.xs },
  balToday: { color: theme.colors.accentBright, fontSize: theme.font.sm, fontWeight: "600", marginBottom: theme.spacing.md },
  track: { height: 4, borderRadius: 2, backgroundColor: theme.colors.line, overflow: "hidden", marginBottom: theme.spacing.xs },
  fill: { height: "100%", borderRadius: 2, backgroundColor: theme.colors.accent },
  balMeta: { color: theme.colors.dim, fontSize: theme.font.xs },
  secHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm },
  secTitle: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "700" },
  secLink: { color: theme.colors.accentBright, fontSize: theme.font.md, fontWeight: "600" },
  offScroll: { marginBottom: theme.spacing.md },
  loadingRow: { paddingVertical: theme.spacing.md, alignItems: "center" },
  loadingText: { color: theme.colors.muted, fontSize: theme.font.sm },
});
