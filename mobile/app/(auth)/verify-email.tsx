import { useEffect, useMemo, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../src/theme";
import { useAuth } from "../../src/auth/AuthContext";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { user, verified, resendVerificationEmail, refreshSession, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const email = useMemo(() => {
    const paramEmail = Array.isArray(params.email) ? params.email[0] : params.email;
    return paramEmail ?? user?.email ?? "your email";
  }, [params.email, user?.email]);

  useEffect(() => {
    if (verified) {
      router.replace("/(tabs)");
    }
  }, [router, verified]);

  const handleResend = async () => {
    setSending(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage("Verification email resent. Check inbox and spam.");
    } catch (authError: unknown) {
      console.error("Mobile resend verification error:", authError);
      setMessage("We could not resend the verification email right now.");
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const refreshedUser = await refreshSession();
      if (refreshedUser?.emailVerified) {
        router.replace("/(tabs)");
        return;
      }
      setMessage("Your inbox still looks unverified. Try the link in your email again.");
    } catch (authError: unknown) {
      console.error("Mobile verification refresh error:", authError);
      setMessage("We could not refresh your verification status.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Verify inbox</Text>
        <Text style={styles.title}>One more step unlocks the app.</Text>
        <Text style={styles.description}>This mirrors the web gate. Verify your email, then the dashboard tabs open.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Check {email}</Text>
        <Text style={styles.cardBody}>
          TapCash sent a verification link to that inbox. Once you complete the email step, come back here and refresh the session.
        </Text>
      </View>

      <View style={[styles.section, styles.sectionDivider]}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.cardBody}>{user?.emailVerified ? "Email already verified." : "Email still unverified."}</Text>
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
        <View style={styles.buttonStack}>
          <Pressable onPress={handleResend} style={styles.primaryButton} disabled={sending}>
            {sending ? <ActivityIndicator color={theme.colors.bg} /> : <Text style={styles.primaryButtonText}>Resend email</Text>}
          </Pressable>
          <Pressable onPress={handleCheck} style={styles.secondaryButton} disabled={checking}>
            {checking ? <ActivityIndicator color={theme.colors.text} /> : <Text style={styles.secondaryButtonText}>I verified it</Text>}
          </Pressable>
          <Pressable onPress={logout} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      <Link href="/(auth)/signin" asChild>
        <Pressable style={styles.linkSection}>
          <Text style={styles.linkTitle}>Need to switch accounts?</Text>
          <Text style={styles.linkBody}>Go back to sign in and use a different email.</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, gap: 28 },
  header: { gap: 10 },
  eyebrow: { color: theme.colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: "900", lineHeight: 36 },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  section: { gap: 10 },
  sectionDivider: { borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 18 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "900" },
  cardBody: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  messageText: { color: theme.colors.accent, fontSize: 13, lineHeight: 19 },
  buttonStack: { gap: 10, marginTop: 4 },
  primaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: { color: theme.colors.bg, fontSize: 15, fontWeight: "900" },
  secondaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: theme.colors.text, fontSize: 15, fontWeight: "900" },
  ghostButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  ghostButtonText: { color: theme.colors.muted, fontSize: 13, fontWeight: "800" },
  linkSection: { borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 18, gap: 6 },
  linkTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "900" },
  linkBody: { color: theme.colors.muted, fontSize: 13, lineHeight: 18 },
});
