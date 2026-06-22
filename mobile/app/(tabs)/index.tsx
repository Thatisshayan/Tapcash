import { useCallback } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../../src/theme";
import { GlassCard } from "../../src/components/GlassCard";
import { PulsingDot } from "../../src/components/PulsingDot";
import { OfferCard } from "../../src/components/OfferCard";
import { tapCashOffers } from "../../../shared/tapcash-content";

const CASHPATH = ["Choose", "Tracking", "Pending", "Approved", "Cashed Out"];
const ACTIVE = 2;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const h = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const bal = 12.5, minW = 20, prog = Math.min((bal / minW) * 100, 100);

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top + 12 }]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.logoText}>TapCash</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={h} style={styles.iconBtn}><Ionicons name="notifications-outline" size={22} color={theme.colors.text} /></TouchableOpacity>
          <View style={styles.avatar}><Text style={styles.avatarText}>U</Text></View>
        </View>
      </View>

      <GlassCard>
        <View style={styles.balHead}>
          <Text style={styles.balLabel}>YOUR BALANCE</Text>
          <Ionicons name="wallet-outline" size={20} color={theme.colors.green} />
        </View>
        <View style={styles.balRow}>
          <Text style={styles.balAmt}>$12.50</Text>
          <Text style={styles.balToday}>+$4.20 today</Text>
        </View>
        <View style={styles.track}><View style={[styles.fill, { width: prog + "%" }]} /></View>
        <Text style={styles.balMeta}>Min. $20 to withdraw · $12.50 / $20</Text>
      </GlassCard>

      <GlassCard>
        <View style={styles.liveHead}>
          <Text style={styles.liveLabel}>LIVE PAYOUT</Text>
          <PulsingDot size={8} />
        </View>
        <View style={styles.liveRow}>
          <View style={styles.liveIcon}><Text style={styles.liveIconText}>P</Text></View>
          <View style={styles.liveInfo}>
            <Text style={styles.liveName}>Emma W. cashed out</Text>
            <Text style={styles.liveAmt}>$125.00</Text>
            <Text style={styles.liveMeta}>via PayPal · Just now</Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.pathRow}>{CASHPATH.map((s, i) => {
        const c = i < ACTIVE, a = i === ACTIVE;
        return <View key={s} style={styles.pathItem}>{i > 0 && <View style={[styles.pathLine, { backgroundColor: c || a ? theme.colors.green : theme.colors.border }]} />}<View style={[styles.pathDot, { backgroundColor: c || a ? theme.colors.green : "transparent", borderColor: c || a ? theme.colors.green : theme.colors.muted }]} /><Text style={[styles.pathText, { color: c || a ? theme.colors.green : theme.colors.muted }]}>{s}</Text></View>;
      })}</View>

      <View style={styles.secHead}>
        <Text style={styles.secTitle}>Top Offers</Text>
        <TouchableOpacity onPress={h}><Text style={styles.secLink}>View all →</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offScroll}>
        {tapCashOffers.slice(0, 3).map((o, i) => <OfferCard key={o.id} offer={o} index={i} />)}
      </ScrollView>

      <View style={styles.statRow}>{[{l:"Users",v:"50K+"},{l:"Paid",v:"$2.5M+"},{l:"Verified",v:"98%"}].map(s => <GlassCard key={s.l} style={styles.statCard}><Text style={styles.statLabel}>{s.l}</Text><Text style={styles.statValue}>{s.v}</Text></GlassCard>)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl, gap: theme.spacing.md },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm },
  logoText: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  iconBtn: { width: 36, height: 36, borderRadius: theme.radius.full, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center" },
  avatar: { width: 36, height: 36, borderRadius: theme.radius.full, backgroundColor: theme.colors.purple, alignItems: "center", justifyContent: "center" },
  avatarText: { color: theme.colors.text, fontWeight: "bold", fontSize: theme.font.sm },
  balHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm },
  balLabel: { color: theme.colors.muted, fontSize: theme.font.xs, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" },
  balRow: { flexDirection: "row", alignItems: "baseline", gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  balAmt: { color: theme.colors.text, fontSize: theme.font.xxl, fontWeight: "900" },
  balToday: { color: theme.colors.green, fontSize: theme.font.sm, fontWeight: "600" },
  track: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: theme.spacing.xs },
  fill: { height: "100%", borderRadius: 2, backgroundColor: theme.colors.green },
  balMeta: { color: theme.colors.muted, fontSize: theme.font.xs },
  liveHead: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
  liveLabel: { color: theme.colors.text, fontSize: theme.font.xs, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" },
  liveRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  liveIcon: { width: 32, height: 32, borderRadius: theme.radius.full, backgroundColor: theme.colors.purple, alignItems: "center", justifyContent: "center" },
  liveIconText: { color: theme.colors.text, fontWeight: "bold", fontSize: theme.font.sm },
  liveInfo: { flex: 1 },
  liveName: { color: theme.colors.text, fontSize: theme.font.md, fontWeight: "600" },
  liveAmt: { color: theme.colors.green, fontSize: theme.font.lg, fontWeight: "900" },
  liveMeta: { color: theme.colors.muted, fontSize: theme.font.xs },
  pathRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: theme.spacing.md },
  pathItem: { flex: 1, alignItems: "center", position: "relative" },
  pathLine: { position: "absolute", top: 8, left: "-50%", width: "100%", height: 2, zIndex: 0 },
  pathDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, zIndex: 1, marginBottom: theme.spacing.xs },
  pathText: { fontSize: theme.font.xs, fontWeight: "600", textAlign: "center" },
  secHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm },
  secTitle: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "bold" },
  secLink: { color: theme.colors.green, fontSize: theme.font.md, fontWeight: "600" },
  offScroll: { marginBottom: theme.spacing.md },
  statRow: { flexDirection: "row", gap: theme.spacing.sm },
  statCard: { flex: 1, padding: theme.spacing.md, alignItems: "center", justifyContent: "center" },
  statLabel: { color: theme.colors.muted, fontSize: theme.font.xs, fontWeight: "600", textTransform: "uppercase", marginBottom: theme.spacing.xs },
  statValue: { color: theme.colors.text, fontSize: theme.font.xl, fontWeight: "900" },
});
