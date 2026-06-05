import { theme } from "../theme";

export default function Header({ activeSection }) {
  return (
    <header
      style={{
        maxWidth: 1800,
        margin: "0 auto",
        padding: "28px 34px 10px",
        display: "flex",
        alignItems: "center",
        gap: 46,
      }}
    >
      <a className="brand" href="#top" aria-label="TapCash home">
        <img src="/logos/tapcash-logo-horizontal.svg" alt="TapCash" style={{ width: 230, height: "auto" }} />
      </a>
      <nav style={{ display: "flex", gap: 38, marginLeft: 60, color: "#f3f6ff", fontWeight: 650 }}>
        {["Games", "How It Works", "CashPath", "Rewards", "Blog"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
            style={{
              color: "inherit",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = theme.colors.cyan)}
            onMouseLeave={(e) => (e.target.style.color = "#f3f6ff")}
          >
            {item}
          </a>
        ))}
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", gap: 18 }}>
        <button
          style={{
            border: `1px solid ${theme.colors.line}`,
            borderRadius: 13,
            background: "rgba(255,255,255,0.03)",
            color: theme.colors.text,
            padding: "14px 30px",
            fontWeight: 750,
            cursor: "pointer",
          }}
        >
          Log In
        </button>
        <button
          style={{
            background: `linear-gradient(100deg, ${theme.colors.purple}, ${theme.colors.cyan}, ${theme.colors.green})`,
            border: "none",
            borderRadius: 13,
            color: "#fff",
            padding: "14px 30px",
            fontWeight: 750,
            cursor: "pointer",
            boxShadow: theme.shadow.glow,
          }}
        >
          Sign Up Free
        </button>
      </div>
    </header>
  );
}
