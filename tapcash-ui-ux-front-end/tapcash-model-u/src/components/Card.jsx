import { theme } from "../theme";

const accents = {
  teal: { border: "rgba(0,217,255,0.3)", badge: "rgba(8,19,35,0.8)", text: "#18d9ff" },
  blue: { border: "rgba(58,123,255,0.3)", badge: "rgba(15,23,40,0.8)", text: "#3a7bff" },
  gold: { border: "rgba(255,196,66,0.3)", badge: "rgba(26,22,8,0.8)", text: "#ffc442" },
};

export default function Card({ accent = "teal", glow, children, style, ...props }) {
  const a = accents[accent] || accents.teal;
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.line}`,
        background: `linear-gradient(180deg, ${theme.colors.panel}, rgba(6,12,23,0.72))`,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        padding: 28,
        ...(glow ? { filter: `drop-shadow(0 20px 60px ${a.border})` } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ accent = "teal", children, style }) {
  const a = accents[accent] || accents.teal;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 8,
        background: a.badge,
        border: `1px solid ${a.border}`,
        color: a.text,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 8,
        background: "rgba(8,19,35,0.8)",
        border: `1px solid rgba(0,217,255,0.3)`,
        color: "#18d9ff",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}
