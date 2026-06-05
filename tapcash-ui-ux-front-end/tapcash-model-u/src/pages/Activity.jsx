import { theme, activityFeed } from "../theme";

export default function Activity() {
  return (
    <div style={{ padding: "0 34px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: theme.colors.cyan, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>
          Activity
        </p>
        <h2 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 10px", letterSpacing: -2 }}>Live proof, compressed.</h2>
        <p style={{ color: theme.colors.muted, fontSize: 18, margin: 0 }}>Recent actions across the platform.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {activityFeed.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              border: `1px solid ${theme.colors.line}`,
              background: `linear-gradient(180deg, ${theme.colors.panel}, rgba(6,12,23,0.72))`,
              borderRadius: theme.radius.md,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: theme.colors.cyan,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, margin: "0 0 2px" }}>
                <strong>{item.user}</strong> {item.action}
              </p>
            </div>
            <span style={{ color: theme.colors.green, fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
