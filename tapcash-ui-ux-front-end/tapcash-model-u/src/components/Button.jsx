import { theme } from "../theme";

const base = {
  border: `1px solid ${theme.colors.line}`,
  borderRadius: theme.radius.md,
  cursor: "pointer",
  fontFamily: theme.font.family,
  fontWeight: 850,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  transition: "all 0.2s ease",
};

const variants = {
  primary: {
    ...base,
    background: `linear-gradient(100deg, ${theme.colors.purple}, ${theme.colors.cyan}, ${theme.colors.green})`,
    color: "#fff",
    border: "none",
    boxShadow: theme.shadow.glow,
    padding: "18px 32px",
    fontSize: 18,
  },
  secondary: {
    ...base,
    background: "rgba(255,255,255,0.035)",
    color: "#fff",
    padding: "18px 30px",
    fontSize: 16,
  },
  ghost: {
    ...base,
    background: "rgba(255,255,255,0.03)",
    color: theme.colors.text,
    padding: "14px 30px",
    fontSize: 15,
  },
  small: {
    ...base,
    background: `linear-gradient(100deg, ${theme.colors.purple}, ${theme.colors.cyan}, ${theme.colors.green})`,
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    fontSize: 14,
    borderRadius: theme.radius.sm,
  },
  offer: {
    ...base,
    background: `linear-gradient(90deg, ${theme.colors.cyan}, ${theme.colors.purple})`,
    border: 0,
    borderRadius: theme.radius.sm,
    color: "#fff",
    padding: "14px",
    width: "100%",
    fontWeight: 850,
    marginTop: 18,
  },
};

export default function Button({ variant = "primary", children, style, ...props }) {
  return (
    <button style={{ ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
}
