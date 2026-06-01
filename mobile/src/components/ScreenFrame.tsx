import { PropsWithChildren } from "react";
import { View, Text, StyleSheet } from "react-native";
import { tapCashTheme } from "../theme";

type Props = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description?: string;
}>;

export function ScreenFrame({ eyebrow, title, description, children }: Props) {
  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: tapCashTheme.colors.background,
    padding: 20,
    gap: 16,
  },
  header: {
    paddingTop: 24,
    gap: 10,
  },
  eyebrow: {
    color: tapCashTheme.colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: tapCashTheme.colors.text,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
  },
  description: {
    color: tapCashTheme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
