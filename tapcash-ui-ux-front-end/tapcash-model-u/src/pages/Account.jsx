import { theme } from "../theme";

export default function Account() {
  return (
    <div style={{ padding: "0 34px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: theme.colors.cyan, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>
          Account
        </p>
        <h2 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 10px", letterSpacing: -2 }}>Your TapCash session.</h2>
        <p style={{ color: theme.colors.muted, fontSize: 18, margin: 0 }}>Manage your account and session.</p>
      </div>

      <div
        style={{
          border: `1px solid ${theme.colors.line}`,
          background: `linear-gradient(180deg, ${theme.colors.panel}, rgba(6,12,23,0.72))`,
          borderRadius: theme.radius.lg,
          padding: 28,
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>Profile</h3>
        <p style={{ color: theme.colors.muted, fontSize: 15, margin: "0 0 6px" }}>user@tapcash.com</p>
        <p style={{ color: theme.colors.green, fontSize: 13, fontWeight: 700, margin: 0 }}>Verified account</p>
      </div>

      <div
        style={{
          border: `1px solid ${theme.colors.line}`,
          background: `linear-gradient(180deg, ${theme.colors.panel}, rgba(6,12,23,0.72))`,
          borderRadius: theme.radius.lg,
          padding: 28,
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px" }}>Session controls</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["Refresh status", "Resend verification", "Sign out"].map((action, i) => (
            <button
              key={action}
              style={{
                padding: "14px 20px",
                borderRadius: theme.radius.md,
                border: i === 2 ? "none" : `1px solid ${theme.colors.line}`,
                background: i === 2 ? theme.colors.cyan : theme.colors.panel2,
                color: i === 2 ? theme.colors.bg : theme.colors.text,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${theme.colors.line}`,
          background: `linear-gradient(180deg, ${theme.colors.panel}, rgba(6,12,23,0.72))`,
          borderRadius: theme.radius.lg,
          padding: 28,
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>Platform rules</h3>
        <ul style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 2, margin: 0, paddingLeft: 20 }}>
          <li>Verified inbox before the dashboard unlocks.</li>
          <li>Real sessions instead of placeholder auth.</li>
          <li>Same backend as the mobile app.</li>
        </ul>
      </div>
    </div>
  );
}
