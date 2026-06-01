import { useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { tapCashTheme } from "../../src/theme";
import { useAuth } from "../../src/auth/AuthContext";

export default function AccountScreen() {
  const { user, verified, loading, logout, resendVerificationEmail, refreshSession } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      const refreshedUser = await refreshSession();
      setMessage(refreshedUser?.emailVerified ? "Verification confirmed." : "Still waiting on inbox verification.");
    } catch (authError) {
      console.error("Mobile account refresh error:", authError);
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
    } catch (authError) {
      console.error("Mobile account resend error:", authError);
      setMessage("Could not resend the verification email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="Account"
        title="Your TapCash session."
        description="The mobile account tab now reflects the same verified-inbox rules as the web app."
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{statusLabel}</Text>
          <Text style={styles.cardBody}>
            {user
              ? [user.displayName, user.email].filter(Boolean).join(" · ") || "No email on file"
              : "No signed-in user"}
          </Text>
          <Text style={styles.cardBody}>
            {verified ? "Inbox verification complete." : "Email verification still required."}
          </Text>
          {message ? <Text style={styles.messageText}>{message}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session controls</Text>
          <View style={styles.buttonStack}>
            <Pressable onPress={handleRefresh} style={styles.secondaryButton} disabled={submitting}>
              {submitting ? <ActivityIndicator color={tapCashTheme.colors.text} /> : <Text style={styles.secondaryButtonText}>Refresh status</Text>}
            </Pressable>
            <Pressable onPress={handleResend} style={styles.secondaryButton} disabled={submitting}>
              {submitting ? <ActivityIndicator color={tapCashTheme.colors.text} /> : <Text style={styles.secondaryButtonText}>Resend verification</Text>}
            </Pressable>
            <Pressable onPress={logout} style={styles.primaryButton} disabled={submitting}>
              {submitting ? <ActivityIndicator color={tapCashTheme.colors.background} /> : <Text style={styles.primaryButtonText}>Sign out</Text>}
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform rules</Text>
          <Text style={styles.cardBody}>Verified inbox before the tabs unlock.</Text>
          <Text style={styles.cardBody}>Real sessions instead of placeholder auth.</Text>
          <Text style={styles.cardBody}>Same Firebase project as the web app.</Text>
        </View>
      </ScreenFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tapCashTheme.colors.background },
  content: { paddingBottom: 28 },
  card: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 18,
    gap: 10,
  },
  cardTitle: { color: tapCashTheme.colors.text, fontSize: 18, fontWeight: "900" },
  cardBody: { color: tapCashTheme.colors.muted, fontSize: 14, lineHeight: 20 },
  messageText: { color: tapCashTheme.colors.accent, fontSize: 13, lineHeight: 19 },
  buttonStack: { gap: 10 },
  primaryButton: {
    minHeight: 50,
    borderRadius: tapCashTheme.radius.lg,
    backgroundColor: tapCashTheme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: tapCashTheme.colors.background,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: tapCashTheme.radius.lg,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    backgroundColor: tapCashTheme.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: tapCashTheme.colors.text, fontSize: 14, fontWeight: "800" },
});
