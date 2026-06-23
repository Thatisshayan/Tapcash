import { useMemo, useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../src/theme";
import { GlassCard } from "../../src/components/GlassCard";
import { TapScoreRing } from "../../src/components/TapScoreRing";
import { useAuth } from "../../src/auth/AuthContext";
import { doc, onSnapshot, query, where, collection } from "firebase/firestore";
import { db } from "../../src/lib/firebase";

const SETTINGS = [
  { icon: "notifications-outline" as const, label: "Notification Preferences", action: "notifications" },
  { icon: "shield-checkmark-outline" as const, label: "Privacy Policy", action: "privacy" },
  { icon: "document-text-outline" as const, label: "Terms of Service", action: "terms" },
  { icon: "help-circle-outline" as const, label: "Contact Support", action: "contact" },
  { icon: "trash-outline" as const, label: "Delete My Account", action: "delete", danger: true },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, verified, loading, logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ createdAt?: Date; displayName?: string; pushToken?: string | null }>({});
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalCashedOut, setTotalCashedOut] = useState(0);
  const [hasPendingCashout, setHasPendingCashout] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          createdAt: data.createdAt?.toDate?.(),
          displayName: data.displayName,
          pushToken: data.pushToken,
        });
      }
    });

    const unsubLedger = onSnapshot(
      query(collection(db, "ledger_transactions"), where("userId", "==", user.uid)),
      (snapshot) => {
        let earned = 0;
        let cashedOut = 0;
        let hasPending = false;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "approved") {
            if (data.amountCoins > 0) {
              earned += Number(data.amountCoins ?? 0);
            } else if (data.amountCoins < 0) {
              cashedOut += Math.abs(Number(data.amountCoins ?? 0));
            }
          }
          if (data.status === "pending" && data.amountCoins < 0) {
            hasPending = true;
          }
        });

        setTotalEarned(earned);
        setTotalCashedOut(cashedOut);
        setHasPendingCashout(hasPending);
      }
    );

    return () => {
      unsubProfile();
      unsubLedger();
    };
  }, [user?.uid]);

  const statusLabel = useMemo(() => {
    if (loading) return "Checking session...";
    if (!user) return "No active session";
    if (verified) return "Verified account";
    return "Email still unverified";
  }, [loading, user, verified]);

  const handleRefresh = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await user?.reload();
      setMessage(user?.emailVerified ? "Verification confirmed." : "Still waiting on inbox verification.");
    } catch {
      setMessage("Could not refresh the session right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
  };

  const handleSettingPress = useCallback(async (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (action === "notifications") {
      Alert.alert(
        "Notification Preferences",
        "Push notifications are enabled when you grant permission during sign-in.",
        [{ text: "OK", style: "default" }]
      );
    } else if (action === "privacy") {
      await WebBrowser.openBrowserAsync("https://tapcash.online/privacy");
    } else if (action === "terms") {
      await WebBrowser.openBrowserAsync("https://tapcash.online/terms");
    } else if (action === "contact") {
      await WebBrowser.openBrowserAsync("https://tapcash.online/contact");
    } else if (action === "delete") {
      if (hasPendingCashout) {
        Alert.alert(
          "Cannot Delete",
          "You have a pending cashout. Please wait for it to be processed before deleting your account."
        );
        return;
      }
      
      Alert.alert(
        "Delete My Account",
        "This will permanently delete your account and all data. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setSubmitting(true);
              try {
                const idToken = await user?.getIdToken();
                if (!idToken) throw new Error("Not authenticated");

                const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/gdpr/delete`, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${idToken}`,
                  },
                });

                if (res.ok) {
                  await logout();
                } else {
                  const data = await res.json().catch(() => ({}));
                  Alert.alert("Error", data.error || "Failed to delete account");
                }
              } catch (e) {
                Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete account");
              } finally {
                setSubmitting(false);
              }
            },
          },
        ]
      );
    }
  }, [hasPendingCashout, logout, user]);

  const handleShareReferral = useCallback(async () => {
    if (!user?.uid) return;
    const referralLink = `https://tapcash.online/ref/${user.uid}`;
    await Share.share({
      message: `Join TapCash and earn real cash rewards! Sign up at ${referralLink} and start earning today.`,
    });
  }, [user?.uid]);

  const displayName = profile.displayName || user?.displayName || "User";
  const email = user?.email || "No email";
  const joinDate = profile.createdAt?.toLocaleDateString() || "Unknown";

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? "U"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>Gold Tier</Text>
        </View>
      </View>

      <GlassCard variant="elevated" style={styles.tapScoreCard}>
        <View style={styles.tapScoreHeader}>
          <TapScoreRing score={94} size={80} showLabel={false} />
          <View style={styles.tapScoreInfo}>
            <Text style={styles.tapScoreTitle}>Your TapScore™</Text>
            <View style={styles.checkList}>
              {["Fast Payout", "High Tracking", "No Purchase", "Easy to Complete"].map((item) => (
                <View key={item} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.green} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.tapScoreLabel}>Excellent</Text>
      </GlassCard>

      <GlassCard style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${(totalEarned / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${(totalCashedOut / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Cashed Out</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.referralCard}>
        <Text style={styles.referralLabel}>Refer Friends</Text>
        <Text style={styles.referralText}>Share your link and earn when friends sign up</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareReferral}>
          <Ionicons name="share-outline" size={18} color={theme.colors.bg} />
          <Text style={styles.shareBtnText}>Share Referral Link</Text>
        </TouchableOpacity>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>{statusLabel}</Text>
        <Text style={styles.cardBody}>
          {user ? [user.displayName, user.email].filter(Boolean).join(" · ") || "No email on file" : "No signed-in user"}
        </Text>
        <Text style={styles.cardBody}>
          {verified ? "Inbox verification complete." : "Email verification still required."}
        </Text>
        <Text style={styles.cardBody}>Member since {joinDate}</Text>
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
        <View style={styles.buttonStack}>
          <TouchableOpacity onPress={handleRefresh} style={styles.secondaryButton} disabled={submitting} activeOpacity={0.8}>
            {submitting ? <ActivityIndicator color={theme.colors.text} /> : <Text style={styles.secondaryButtonText}>Refresh status</Text>}
          </TouchableOpacity>
        </View>
      </GlassCard>

      <View style={styles.settingsList}>
        {SETTINGS.map((setting) => (
          <TouchableOpacity
            key={setting.label}
            style={[styles.settingsRow, setting.danger && styles.settingsRowDanger]}
            onPress={() => handleSettingPress(setting.action)}
            activeOpacity={0.8}
          >
            <Ionicons name={setting.icon} size={22} color={setting.danger ? "#ff3b30" : theme.colors.text} />
            <Text style={[styles.settingsLabel, setting.danger && styles.settingsLabelDanger]}>{setting.label}</Text>
            {!setting.danger && <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.settingsRow, styles.signOutRow]} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={22} color="#ff3b30" />
          <Text style={[styles.settingsLabel, styles.signOutText]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={18} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl, gap: theme.spacing.md },
  profileRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  avatar: { width: 64, height: 64, borderRadius: theme.radius.full, backgroundColor: theme.colors.green, alignItems: "center", justifyContent: "center" },
  avatarText: { color: theme.colors.bg, fontSize: theme.font.xl, fontWeight: "900" },
  profileInfo: { flex: 1 },
  profileName: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "900" },
  profileEmail: { color: theme.colors.muted, fontSize: theme.font.sm, marginTop: 2 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.gold, backgroundColor: "transparent" },
  tierText: { color: theme.colors.gold, fontSize: theme.font.xs, fontWeight: "800" },
  tapScoreCard: { padding: theme.spacing.md },
  tapScoreHeader: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  tapScoreInfo: { flex: 1 },
  tapScoreTitle: { color: theme.colors.text, fontSize: theme.font.lg, fontWeight: "800" },
  checkList: { marginTop: theme.spacing.sm, gap: theme.spacing.xs },
  checkItem: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  checkText: { color: theme.colors.muted, fontSize: theme.font.sm },
  tapScoreLabel: { color: theme.colors.green, fontSize: theme.font.xs, fontWeight: "800", marginTop: theme.spacing.sm, textTransform: "uppercase", letterSpacing: 1 },
  statsCard: { padding: theme.spacing.md },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { color: theme.colors.text, fontSize: theme.font.xl, fontWeight: "900" },
  statLabel: { color: theme.colors.muted, fontSize: theme.font.xs, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: theme.colors.border },
  referralCard: { padding: theme.spacing.md, gap: theme.spacing.sm },
  referralLabel: { color: theme.colors.text, fontSize: theme.font.md, fontWeight: "800" },
  referralText: { color: theme.colors.muted, fontSize: theme.font.sm },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, backgroundColor: theme.colors.green, borderRadius: theme.radius.md, padding: theme.spacing.sm, alignSelf: "flex-start" },
  shareBtnText: { color: theme.colors.bg, fontSize: theme.font.sm, fontWeight: "700" },
  card: { padding: theme.spacing.md },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "900" },
  cardBody: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginTop: theme.spacing.xs },
  messageText: { color: theme.colors.green, fontSize: 13, lineHeight: 19, marginTop: theme.spacing.sm },
  buttonStack: { gap: 10, marginTop: theme.spacing.md },
  secondaryButton: { minHeight: 50, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  secondaryButtonText: { color: theme.colors.text, fontSize: 14, fontWeight: "800" },
  settingsList: { gap: theme.spacing.sm },
  settingsRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md, backgroundColor: theme.colors.card, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md },
  settingsRowDanger: { borderColor: "rgba(255,59,48,0.2)" },
  settingsLabel: { flex: 1, color: theme.colors.text, fontSize: theme.font.md, fontWeight: "600" },
  settingsLabelDanger: { color: "#ff3b30" },
  signOutRow: { borderColor: "rgba(255,59,48,0.2)" },
  signOutText: { color: "#ff3b30" },
});