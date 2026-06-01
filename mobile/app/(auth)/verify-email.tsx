import { useEffect, useMemo, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { tapCashTheme } from "../../src/theme";
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
    } catch (authError) {
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
      if (!refreshedUser?.emailVerified) {
        setMessage("Your inbox still looks unverified. Try the link in your email again.");
      }
    } catch (authError) {
      console.error("Mobile verification refresh error:", authError);
      setMessage("We could not refresh your verification status.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="Verify inbox"
        title="One more step unlocks the app."
        description="This mirrors the web gate. Verify your email, then the dashboard tabs open."
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Check {email}</Text>
          <Text style={styles.cardBody}>
            TapCash sent a verification link to that inbox. Once you complete the email step, come back here and refresh the session.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <Text style={styles.cardBody}>{user?.emailVerified ? "Email already verified." : "Email still unverified."}</Text>
          {message ? <Text style={styles.messageText}>{message}</Text> : null}
          <View style={styles.buttonStack}>
            <Pressable onPress={handleResend} style={styles.primaryButton} disabled={sending}>
              {sending ? <ActivityIndicator color={tapCashTheme.colors.background} /> : <Text style={styles.primaryButtonText}>Resend email</Text>}
            </Pressable>
            <Pressable onPress={handleCheck} style={styles.secondaryButton} disabled={checking}>
              {checking ? <ActivityIndicator color={tapCashTheme.colors.text} /> : <Text style={styles.secondaryButtonText}>I verified it</Text>}
            </Pressable>
            <Pressable onPress={logout} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        <Link href="/(auth)/signin" asChild>
          <Pressable style={styles.linkCard}>
            <Text style={styles.linkTitle}>Need to switch accounts?</Text>
            <Text style={styles.linkBody}>Go back to sign in and use a different email.</Text>
          </Pressable>
        </Link>
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
  secondaryButtonText: { color: tapCashTheme.colors.text, fontSize: 15, fontWeight: "900" },
  ghostButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: { color: tapCashTheme.colors.muted, fontSize: 13, fontWeight: "800" },
  linkCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 18,
    gap: 6,
  },
  linkTitle: { color: tapCashTheme.colors.text, fontSize: 16, fontWeight: "900" },
  linkBody: { color: tapCashTheme.colors.muted, fontSize: 13, lineHeight: 18 },
});
