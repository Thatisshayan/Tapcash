import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Hero, Offers, CashPath, AppPreview, TapScore, TrustStrip } from "./sections";
import { Earn, Cashout, Activity, Account } from "./pages";

const pages = [
  { id: "home", label: "Home" },
  { id: "earn", label: "Earn" },
  { id: "cashout", label: "Cashout" },
  { id: "activity", label: "Activity" },
  { id: "account", label: "Account" },
];

function NavTabs({ active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "6px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        border: `1px solid rgba(255,255,255,0.08)`,
        marginBottom: 32,
        width: "fit-content",
      }}
    >
      {pages.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          style={{
            padding: "10px 22px",
            borderRadius: 12,
            border: "none",
            background: active === p.id ? "rgba(0,217,255,0.12)" : "transparent",
            color: active === p.id ? "#18d9ff" : "#9aa8c6",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function LandingPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Hero />
      <Offers />
      <CashPath />
      <AppPreview />
      <TapScore />
      <TrustStrip />
    </motion.div>
  );
}

function DashboardPage({ page }) {
  const components = { earn: Earn, cashout: Cashout, activity: Activity, account: Account };
  const Component = components[page];
  if (!Component) return null;
  return (
    <motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Component />
    </motion.div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("home");

  return (
    <main>
      <Header />
      <div className="page">
        <NavTabs active={activePage} onChange={setActivePage} />
        <AnimatePresence mode="wait">
          {activePage === "home" ? <LandingPage /> : <DashboardPage page={activePage} />}
        </AnimatePresence>
      </div>
      <Footer />
    </main>
  );
}
