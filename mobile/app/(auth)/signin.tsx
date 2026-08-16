import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../../src/theme";
import { useAuth } from "../../src/auth/AuthContext";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, refreshSession, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

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
    } catch {
      setError("Could not sign in right now. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Sign in</Text>
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.description}>Use the same email and password as the web app. Verified inboxes unlock the tabs.</Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.ghost}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, focusedField === "email" && styles.inputFocused]}
            />
          </View>
          <View>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              placeholder="********"
              placeholderTextColor={theme.colors.ghost}
              secureTextEntry
              style={[styles.input, focusedField === "password" && styles.inputFocused]}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable onPress={handleSubmit} style={styles.primaryButton} disabled={submitting}>
            {submitting ? <ActivityIndicator color={theme.colors.bg} /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
          </Pressable>
        </View>

        <Link href="/(auth)/signup" asChild>
          <Pressable style={styles.linkSection}>
            <Text style={styles.linkTitle}>Need an account?</Text>
            <Text style={styles.linkBody}>Create one, verify your inbox, and then the tabs unlock.</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, gap: 28 },
  header: { gap: 10 },
  eyebrow: { color: theme.colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: "900", lineHeight: 36 },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  form: { gap: 20 },
  label: { color: theme.colors.dim, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    color: theme.colors.text,
    paddingHorizontal: 2,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputFocused: { borderBottomColor: theme.colors.accent },
  errorText: { color: theme.colors.danger, fontSize: 13, lineHeight: 18 },
  primaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 4,
  },
  primaryButtonText: { color: theme.colors.bg, fontSize: 15, fontWeight: "900" },
  linkSection: { borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 18, gap: 6 },
  linkTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "900" },
  linkBody: { color: theme.colors.muted, fontSize: 13, lineHeight: 18 },
});
