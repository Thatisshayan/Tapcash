import { View, StyleSheet, ViewStyle, type StyleProp } from "react-native";
import { tapCashTheme } from "../theme";

type GlassCardProps = {
  variant?: "default" | "elevated";
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ variant = "default", children, style }: GlassCardProps) {
  const isElevated = variant === "elevated";
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isElevated ? "rgba(245,243,239,0.08)" : "rgba(245,243,239,0.04)",
          borderColor: isElevated ? "rgba(255,255,255,0.10)" : tapCashTheme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: tapCashTheme.radius.lg,
  },
});
