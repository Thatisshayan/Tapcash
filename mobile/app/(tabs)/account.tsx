import { useMemo, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../src/theme";
import { GlassCard } from "../../src/components/GlassCard";
import { TapScoreRing } from "../../src/components/TapScoreRing";
import { useAuth } from "../../src/auth/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../src/lib/firebase";

const SETTINGS = [
  { icon: "card-outline" as const, label: "Payout Settings" },
  { icon: "notifications-outline" as const, label: "Notification Preferences" },
  { icon: "shield-checkmark-outline" as const, label: "Security & Privacy" },
  { icon: "help-circle-outline" as const, label: "Help & Support" },
  { icon: "document-text-outline" as const, label: "Terms of Service" },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, verified, loading, logout, resendVerificationEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ createdAt?: Date; displayName?: string }>({});

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          createdAt: data.createdAt?.toDate?.(),
          displayName: data.displayName,
        });
      }
    });
    return unsub;
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

  const handleResend = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage("Verification email resent.");
    } catch {
      setMessage("Could not resend the verification email.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
  };

  const displayName = profile.displayName || user?.displayName || "User";
  const email = user?.email || "No email";
  const joinDate = profile.createdAt?.toLocaleDateString() || "Unknown";

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header */}
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

      {/* TapScore Card */}
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

      {/* Session controls */}
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
          <TouchableOpacity onPress={handleResend} style={styles.secondaryButton} disabled={submitting} activeOpacity={0.8}>
            {submitting ? <ActivityIndicator color={theme.colors.text} /> : <Text style={styles.secondaryButtonText}>Resend verification</Text>}
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Settings */}
      <View style={styles.settingsList}>
        {SETTINGS.map((setting) => (
          <TouchableOpacity key={setting.label} style={styles.settingsRow} activeOpacity={0.8} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Ionicons name={setting.icon} size={22} color={theme.colors.text} />
            <Text style={styles.settingsLabel}>{setting.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
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
  card: { padding: theme.spacing.md },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "900" },
  cardBody: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginTop: theme.spacing.xs },
  messageText: { color: theme.colors.green, fontSize: 13, lineHeight: 19, marginTop: theme.spacing.sm },
  buttonStack: { gap: 10, marginTop: theme.spacing.md },
  secondaryButton: { minHeight: 50, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  secondaryButtonText: { color: theme.colors.text, fontSize: 14, fontWeight: "800" },
  settingsList: { gap: theme.spacing.sm },
  settingsRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md, backgroundColor: theme.colors.card, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md },
  settingsLabel: { flex: 1, color: theme.colors.text, fontSize: theme.font.md, fontWeight: "600" },
  signOutRow: { borderColor: "rgba(255,59,48,0.2)" },
  signOutText: { color: "#ff3b30" },
});
