import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../src/theme";
import { GlassCard } from "../../../src/components/GlassCard";
import { TapScoreRing } from "../../../src/components/TapScoreRing";
import { loadOffers, recordClick, type ApiOfferDisplay } from "../../../src/lib/api";
import { useAuth } from "../../../src/auth/AuthContext";

const IMG: Record<number, ReturnType<typeof require>> = {
  0: require("../../../assets/offers/offer-1.png"),
  1: require("../../../assets/offers/offer-2.png"),
  2: require("../../../assets/offers/offer-3.png"),
  3: require("../../../assets/offers/offer-4.png"),
  4: require("../../../assets/offers/offer-5.png"),
  5: require("../../../assets/offers/offer-6.png"),
  6: require("../../../assets/offers/offer-7.png"),
  7: require("../../../assets/offers/offer-8.png"),
  8: require("../../../assets/offers/offer-9.png"),
  9: require("../../../assets/offers/offer-10.png"),
};

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [offer, setOffer] = useState<ApiOfferDisplay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user?.uid) return;
    let cancelled = false;
    setLoading(true);
    loadOffers(user.uid)
      .then((items) => {
        if (!cancelled) {
          const found = items.find((o) => o.id === id);
          if (found) setOffer(found);
        }
      })
      .catch((e) => console.warn("Failed to load offer:", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.uid]);

  const displayOffer = useMemo(() => offer, [offer]);
  const idx = displayOffer ? 0 : 0;
  const img = IMG[idx % 10];
  const price = displayOffer ? (displayOffer.payoutCoins / 100).toFixed(2) : "0.00";
  const tags = displayOffer ? [displayOffer.category] : [];
  if (displayOffer && displayOffer.estimateMinutes <= 15) tags.push("Fast Payout");
  if (displayOffer) tags.push("Easy");

  const handleStart = useCallback(async () => {
    if (!displayOffer || !user?.uid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await recordClick(user.uid, displayOffer.id, displayOffer.provider);
    } catch (e) {
      console.warn("Click tracking failed:", e);
    }
    if (displayOffer.clickUrl) {
      try {
        await WebBrowser.openBrowserAsync(displayOffer.clickUrl);
      } catch (e) {
        console.warn("Browser open failed:", e);
      }
    }
  }, [displayOffer, user?.uid]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          <View style={styles.heroWrap}>
            <Image source={img} style={styles.heroImg} resizeMode="cover" />
            <Pressable style={[styles.backBtn, { top: insets.top + 12 }]} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </Pressable>
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>Loading...</Text>
            <ActivityIndicator color={theme.colors.green} style={{ marginTop: theme.spacing.md }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!displayOffer) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
          <View style={styles.heroWrap}>
            <Image source={img} style={styles.heroImg} resizeMode="cover" />
            <Pressable style={[styles.backBtn, { top: insets.top + 12 }]} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </Pressable>
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>Offer not found</Text>
            <Text style={styles.sectionTitle}>This offer may have expired or been removed.</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        <View style={styles.heroWrap}>
          <Image source={img} style={styles.heroImg} resizeMode="cover" />
          {idx < 3 && <View style={styles.badge}><Text style={styles.badgeText}>HOT</Text></View>}
          <Pressable style={[styles.backBtn, { top: insets.top + 12 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{displayOffer.title}</Text>
          <View style={styles.tagsRow}>
            {tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={styles.priceRow}>
            <TapScoreRing score={94} size={60} showLabel={false} />
            <Text style={styles.price}>${price}</Text>
          </View>
          <Text style={styles.sectionTitle}>Before You Start</Text>
          <GlassCard style={styles.infoCard}>
            <InfoRow label="Estimated time" value={`${displayOffer.estimateMinutes} min`} />
            <InfoRow label="Purchase required" value="No" />
            <InfoRow label="Tracking confidence" value="High" />
            <InfoRow label="Approval time" value="1-3 days" />
            <InfoRow label="Real completions today" value="1,240" />
          </GlassCard>
          <Text style={styles.sectionTitle}>Common Failure Reasons</Text>
          <GlassCard style={styles.infoCard}>
            {["VPN/Proxy", "AdBlock/Private DNS", "Tracking Disabled"].map((r) => (
              <View key={r} style={styles.failRow}>
                <Ionicons name="close-circle" size={18} color="#ff3b30" />
                <Text style={styles.failText}>{r}</Text>
              </View>
            ))}
          </GlassCard>
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.green} />
            <Text style={styles.successText}>Most people succeed with these settings</Text>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <Pressable style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startText}>Start Offer</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  heroWrap: { position: "relative", width: "100%", height: 220 },
  heroImg: { width: "100%", height: "100%" },
  backBtn: { position: "absolute", left: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 12, right: 12, backgroundColor: "#ff3b30", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: theme.font.xs, fontWeight: "800" },
  body: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: "800", lineHeight: 34 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: theme.colors.elevated, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.xs },
  tagText: { color: theme.colors.muted, fontSize: theme.font.xs, fontWeight: "600" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md, marginVertical: theme.spacing.sm },
  price: { color: theme.colors.gold, fontSize: 36, fontWeight: "900", fontFamily: "JetBrainsMono-Regular" },
  sectionTitle: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "800", marginTop: theme.spacing.sm },
  infoCard: { padding: theme.spacing.md, gap: theme.spacing.sm },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { color: theme.colors.muted, fontSize: theme.font.sm },
  infoValue: { color: theme.colors.text, fontSize: theme.font.sm, fontWeight: "700" },
  failRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.xs },
  failText: { color: theme.colors.text, fontSize: theme.font.sm },
  successRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  successText: { color: theme.colors.green, fontSize: theme.font.sm, fontWeight: "700" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, backgroundColor: theme.colors.bg },
  startBtn: { width: "100%", height: 54, borderRadius: 14, backgroundColor: theme.colors.purple, alignItems: "center", justifyContent: "center" },
  startText: { color: theme.colors.text, fontSize: 16, fontWeight: "900" },
});
