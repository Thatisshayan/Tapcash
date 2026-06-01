import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { ScreenFrame } from "../../src/components/ScreenFrame";
import { loadActivity } from "../../src/lib/api";
import { tapCashTheme } from "../../src/theme";
import { tapCashActivity } from "../../../shared/tapcash-content";

export default function ActivityScreen() {
  const [items, setItems] = useState<string[]>(tapCashActivity.map((item) => `${item.label} ${item.detail}`));

  useEffect(() => {
    let mounted = true;
    loadActivity().then((result) => {
      if (mounted && Array.isArray(result) && result.length > 0) {
        setItems(result);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenFrame
        eyebrow="Activity"
        title="Live proof, compressed for mobile."
        description="Recent actions are presented as a quick scan list instead of a dense ledger clone."
      >
        <View style={styles.stack}>
          {items.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.row}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScreenFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tapCashTheme.colors.background },
  content: { paddingBottom: 28 },
  stack: { gap: 10 },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    borderRadius: tapCashTheme.radius.lg,
    backgroundColor: tapCashTheme.colors.surface,
    borderWidth: 1,
    borderColor: tapCashTheme.colors.border,
    padding: 14,
  },
  dot: {
    marginTop: 7,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: tapCashTheme.colors.accent,
  },
  rowText: { flex: 1, color: tapCashTheme.colors.text, fontSize: 14, lineHeight: 20 },
});
