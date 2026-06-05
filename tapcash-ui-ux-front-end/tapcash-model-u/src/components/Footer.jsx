import { theme } from "../theme";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${theme.colors.line}`,
        padding: "40px 34px",
        marginTop: 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: theme.colors.muted,
        fontSize: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/logos/tapcash-icon-final.svg" alt="TapCash" style={{ width: 32, height: 32 }} />
        <span>&copy; 2026 TapCash. All rights reserved.</span>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {["Privacy Policy", "Terms of Service", "Support"].map((link) => (
          <a
            key={link}
            href="#"
            style={{
              color: theme.colors.muted,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = theme.colors.text)}
            onMouseLeave={(e) => (e.target.style.color = theme.colors.muted)}
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
