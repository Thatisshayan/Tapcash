import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { tapCashTheme } from "../../src/theme";
import { useAuth } from "../../src/auth/AuthContext";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, refreshSession, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      const refreshedUser = await refreshSession();

      if (refreshedUser?.emailVerified) {
        router.replace("/(tabs)");
        return;
      }

      await resendVerificationEmail();
      router.replace({ pathname: "/(auth)/verify-email", params: { email: email.trim() } });
    } catch (authError) {
      console.error("Mobile sign-in error:", authError);
      setError("Could not sign in right now. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resendAfterSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      const refreshedUser = await refreshSession();

      if (refreshedUser?.emailVerified) {
        router.replace("/(tabs)");
        return;
      }

      await resendVerificationEmail();
      router.replace({ pathname: "/(auth)/verify-email", params: { email: email.trim() } });
    } catch (authError) {
      console.error("Mobile resend flow error:", authError);
      setError("We could not start the verification resend flow.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="Sign in"
        title="Welcome back."
        description="Use the same email and password as the web app. Verified inboxes unlock the tabs."
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in to TapCash</Text>
          <Text style={styles.cardBody}>If your inbox is not verified yet, we’ll route you back to the verification screen.</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable onPress={handleSubmit} style={styles.primaryButton} disabled={submitting}>
            {submitting ? <ActivityIndicator color={tapCashTheme.colors.background} /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
          </Pressable>

          <Pressable onPress={resendAfterSubmit} style={styles.secondaryButton} disabled={submitting}>
            <Text style={styles.secondaryButtonText}>Sign in and resend verification</Text>
          </Pressable>
        </View>

        <Link href="/(auth)/signup" asChild>
          <Pressable style={styles.linkCard}>
            <Text style={styles.linkTitle}>Need an account?</Text>
            <Text style={styles.linkBody}>Create one, verify your inbox, and then the tabs unlock.</Text>
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
    gap: 12,
  },
  cardTitle: { color: tapCashTheme.colors.text, fontSize: 18, fontWeight: "900" },
  cardBody: { color: tapCashTheme.colors.muted, fontSize: 14, lineHeight: 20 },
  label: {
    color: tapCashTheme.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: tapCashTheme.colors.surfaceAlt,
    borderColor: tapCashTheme.colors.border,
    borderWidth: 1,
    borderRadius: tapCashTheme.radius.lg,
    color: tapCashTheme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: { color: "#fca5a5", fontSize: 13, lineHeight: 18 },
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
