import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { updateProfile } from "firebase/auth";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { auth } from "../../src/lib/firebase";
import { tapCashTheme } from "../../src/theme";
import { useAuth } from "../../src/auth/AuthContext";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, resendVerificationEmail, refreshSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Fill in your name, email, and password.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signUp(email.trim(), password);
      if (auth.currentUser && name.trim()) {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
        });
      }

      await refreshSession();
      await resendVerificationEmail();
      router.replace({ pathname: "/(auth)/verify-email", params: { email: email.trim() } });
    } catch (authError) {
      console.error("Mobile sign-up error:", authError);
      setError("Could not create the account right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="Create account"
        title="Join the verified flow."
        description="Sign up on mobile, confirm your inbox, then open the full TapCash shell."
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create your account</Text>
          <Text style={styles.cardBody}>We send you to the verification screen immediately after signup so the app stays gated the same way as web.</Text>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />

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
            {submitting ? <ActivityIndicator color={tapCashTheme.colors.background} /> : <Text style={styles.primaryButtonText}>Create account</Text>}
          </Pressable>
        </View>

        <Link href="/(auth)/signin" asChild>
          <Pressable style={styles.linkCard}>
            <Text style={styles.linkTitle}>Already have an account?</Text>
            <Text style={styles.linkBody}>Go to sign in instead.</Text>
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
