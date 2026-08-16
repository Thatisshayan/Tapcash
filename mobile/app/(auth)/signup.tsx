import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { updateProfile } from "firebase/auth";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../src/lib/firebase";
import { theme } from "../../src/theme";
import { useAuth } from "../../src/auth/AuthContext";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, resendVerificationEmail, refreshSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"name" | "email" | "password" | null>(null);

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
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      await refreshSession();
      try {
        await resendVerificationEmail();
      } catch (verificationError) {
        console.warn("Verification email send failed:", verificationError);
      }
      router.replace({ pathname: "/(auth)/verify-email", params: { email: email.trim() } });
    } catch {
      setError("Could not create the account right now.");
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
          <Text style={styles.eyebrow}>Create account</Text>
          <Text style={styles.title}>Join the verified flow.</Text>
          <Text style={styles.description}>Sign up on mobile, confirm your inbox, then open the full TapCash shell.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formIntro}>
            We send you to the verification screen immediately after signup so the app stays gated the same way as web.
          </Text>
          <View>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              placeholder="John Doe"
              placeholderTextColor={theme.colors.ghost}
              style={[styles.input, focusedField === "name" && styles.inputFocused]}
            />
          </View>
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
            {submitting ? <ActivityIndicator color={theme.colors.bg} /> : <Text style={styles.primaryButtonText}>Create account</Text>}
          </Pressable>
        </View>

        <Link href="/(auth)/signin" asChild>
          <Pressable style={styles.linkSection}>
            <Text style={styles.linkTitle}>Already have an account?</Text>
            <Text style={styles.linkBody}>Go to sign in instead.</Text>
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
  formIntro: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
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
