import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { tapCashTheme } from "../../src/theme";

const steps = [
  "Create your account or sign in.",
  "Verify your inbox before the dashboard unlocks.",
  "Open earn, cashout, and activity inside the tabs.",
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="TapCash access"
        title="A cleaner rewards app starts here."
        description="This native flow mirrors the web rules: verified inbox, server-backed session, and no fake unlocks."
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Mobile onboarding</Text>
          <Text style={styles.heroValue}>Fast sign in. Real verification. Clean access.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
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
          <Pressable onPress={() => router.push("/(auth)/signup")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create account</Text>
          </Pressable>
          <Link href="/(auth)/signin" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Sign in</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trust signals</Text>
          <Text style={styles.cardBody}>Verified inbox gate</Text>
          <Text style={styles.cardBody}>Ledger-backed balance model</Text>
          <Text style={styles.cardBody}>Same backend as the web app</Text>
        </View>
      </ScreenFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tapCashTheme.colors.background },
  content: { paddingBottom: 28 },
  heroCard: {
    borderRadius: tapCashTheme.radius.xl,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 18,
    gap: 8,
  },
  heroLabel: {
    color: tapCashTheme.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  heroValue: { color: tapCashTheme.colors.text, fontSize: 20, lineHeight: 28, fontWeight: "900" },
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
  stepList: { gap: 10 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: tapCashTheme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    color: tapCashTheme.colors.accent,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 12,
    fontWeight: "900",
  },
  stepText: { flex: 1, color: tapCashTheme.colors.text, fontSize: 14, lineHeight: 20 },
  buttonRow: { gap: 10 },
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
});
