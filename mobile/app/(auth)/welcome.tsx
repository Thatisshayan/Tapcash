import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { theme } from "../../src/theme";

const steps = [
  "Create your account or sign in.",
  "Verify your inbox before the dashboard unlocks.",
  "Open earn, cashout, and activity inside the tabs.",
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TapCash access</Text>
        <Text style={styles.title}>A cleaner rewards app starts here.</Text>
        <Text style={styles.description}>
          This native flow mirrors the web rules: verified inbox, server-backed session, and no fake unlocks.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heroLabel}>Mobile onboarding</Text>
        <Text style={styles.heroValue}>Fast sign in. Real verification. Clean access.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepList}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(auth)/signup");
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Create account</Text>
        </Pressable>
        <Link href="/(auth)/signin" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign in</Text>
          </Pressable>
        </Link>
      </View>

      <View style={[styles.section, styles.sectionDivider]}>
        <Text style={styles.sectionTitle}>Trust signals</Text>
        <Text style={styles.cardBody}>Verified inbox gate</Text>
        <Text style={styles.cardBody}>Ledger-backed balance model</Text>
        <Text style={styles.cardBody}>Same backend as the web app</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 28, gap: 28 },
  header: { paddingTop: 24, gap: 10 },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: { color: theme.colors.text, fontSize: 34, fontWeight: "900", lineHeight: 38 },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  section: { gap: 10 },
  sectionDivider: { borderTopWidth: 1, borderTopColor: theme.colors.line, paddingTop: 18 },
  heroLabel: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  heroValue: { color: theme.colors.text, fontSize: 20, lineHeight: 28, fontWeight: "900" },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "900" },
  cardBody: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  stepList: { gap: 10 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepIndex: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "900",
    width: 20,
  },
  stepText: { flex: 1, color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  buttonRow: { gap: 10 },
  primaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: theme.colors.bg,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: theme.colors.text, fontSize: 15, fontWeight: "900" },
});
