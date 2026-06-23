import Svg, { Circle } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme";

type TapScoreRingProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
};

export function TapScoreRing({ score, size = 80, strokeWidth = 6, showLabel = true }: TapScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score / 100, 0), 1);
  const gap = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.green}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference - gap} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.colors.text, fontSize: size * 0.28, fontWeight: "900" }}>
            {score}
          </Text>
          {showLabel && (
            <Text style={{ color: theme.colors.muted, fontSize: size * 0.12, fontWeight: "700", textTransform: "uppercase" }}>
              TapScore
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
