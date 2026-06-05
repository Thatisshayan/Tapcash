import { theme, dashboardOffers } from "../theme";
import { Zap, Clock, ChevronRight } from "lucide-react";

const accentColors = {
  teal: { border: "rgba(0,217,255,0.3)", bg: "rgba(8,19,35,0.8)", text: "#18d9ff" },
  blue: { border: "rgba(58,123,255,0.3)", bg: "rgba(15,23,40,0.8)", text: "#3a7bff" },
  gold: { border: "rgba(255,196,66,0.3)", bg: "rgba(26,22,8,0.8)", text: "#ffc442" },
};

export default function Earn() {
  return (
    <div style={{ padding: "0 34px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: theme.colors.cyan, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>
          Earn
        </p>
        <h2 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 10px", letterSpacing: -2 }}>Best-fit offers first.</h2>
        <p style={{ color: theme.colors.muted, fontSize: 18, margin: 0 }}>Complete verified offers and earn rewards instantly.</p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {["All", "Surveys", "Games", "Videos", "Referrals"].map((filter, i) => (
          <button
            key={filter}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: `1px solid ${i === 0 ? theme.colors.cyan : theme.colors.line}`,
              background: i === 0 ? "rgba(0,217,255,0.1)" : "rgba(255,255,255,0.03)",
              color: i === 0 ? theme.colors.cyan : theme.colors.muted,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
        {dashboardOffers.map((offer) => {
          const a = accentColors[offer.accent] || accentColors.teal;
          return (
            <div
              key={offer.id}
              style={{
                border: `1px solid ${theme.colors.line}`,
                background: `linear-gradient(180deg, ${theme.colors.panel}, rgba(6,12,23,0.72))`,
                borderRadius: theme.radius.lg,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: a.bg,
                      border: `1px solid ${a.border}`,
                      color: a.text,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      marginBottom: 8,
                    }}
                  >
                    {offer.provider} &middot; {offer.category}
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px" }}>{offer.title}</h3>
                </div>
                <div
                  style={{
                    minWidth: 100,
                    padding: "12px 16px",
                    borderRadius: theme.radius.md,
                    background: theme.colors.panel2,
                    border: `1px solid ${theme.colors.line}`,
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: theme.colors.muted, margin: "0 0 4px" }}>Payout</p>
                  <p style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{offer.payout}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: theme.colors.muted, fontSize: 13 }}>
                  <Clock size={14} /> {offer.time} session
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: theme.colors.cyan, fontWeight: 800, fontSize: 13 }}>
                  Start <ChevronRight size={16} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
