import { theme, payoutMethods } from "../theme";
import { ArrowUpRight, Zap } from "lucide-react";

const accentColors = {
  teal: { border: "rgba(0,217,255,0.3)", bg: "rgba(8,19,35,0.8)", text: "#18d9ff" },
  blue: { border: "rgba(58,123,255,0.3)", bg: "rgba(15,23,40,0.8)", text: "#3a7bff" },
  gold: { border: "rgba(255,196,66,0.3)", bg: "rgba(26,22,8,0.8)", text: "#ffc442" },
};

export default function Cashout() {
  return (
    <div style={{ padding: "0 34px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: theme.colors.cyan, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>
          Cashout
        </p>
        <h2 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 10px", letterSpacing: -2 }}>Payouts stay visible before you tap.</h2>
        <p style={{ color: theme.colors.muted, fontSize: 18, margin: 0 }}>Choose your preferred withdrawal method.</p>
      </div>

      <div
        style={{
          border: `1px solid ${theme.colors.line}`,
          background: `linear-gradient(180deg, ${theme.colors.panel}, rgba(6,12,23,0.72))`,
          borderRadius: theme.radius.lg,
          padding: 28,
          marginBottom: 32,
        }}
      >
        <p style={{ textTransform: "uppercase", color: "#b9c5df", fontSize: 13, fontWeight: 800, margin: "0 0 8px" }}>Your Balance</p>
        <p style={{ fontSize: 48, fontWeight: 900, margin: "0 0 4px" }}>$12.50</p>
        <p style={{ color: theme.colors.green, fontWeight: 800, margin: "0 0 16px" }}>+$4.20 today</p>
        <div style={{ height: 9, background: "#18243a", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "62%", borderRadius: 99, background: `linear-gradient(90deg, ${theme.colors.green}, #9cff39)` }} />
        </div>
        <p style={{ color: "#c1c9dd", fontSize: 13, margin: "10px 0 0" }}>Min. $20 to withdraw &middot; 62% complete</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {payoutMethods.map((method) => {
          const a = accentColors[method.accent] || accentColors.teal;
          return (
            <div
              key={method.id}
              style={{
                border: `1px solid ${theme.colors.line}`,
                background: `linear-gradient(180deg, ${theme.colors.panel2}, rgba(6,12,23,0.72))`,
                borderRadius: theme.radius.lg,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 20px 60px ${a.border}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: a.bg,
                  border: `1px solid ${a.border}`,
                  color: a.text,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  alignSelf: "flex-start",
                }}
              >
                {method.audience}
              </span>
              <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{method.label}</h3>
              <p style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 1.4, margin: 0 }}>{method.subtitle}</p>
              <div style={{ height: 1, background: theme.colors.line, margin: "4px 0" }} />
              <p style={{ fontSize: 13, margin: 0 }}>Minimum {method.min}</p>
              <p style={{ fontSize: 13, margin: 0 }}>{method.eta}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
