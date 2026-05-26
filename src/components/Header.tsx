"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightLeft,
  CircleGauge,
  DollarSign,
  Globe,
  LogOut,
  Menu,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type DisplayCurrency = "COIN" | "CAD";

type LedgerSummaryResponse = {
  balanceCoins?: number;
};

export default function Header() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("COIN");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLang = localStorage.getItem("tapcash_preferred_lang") as "en" | "fr" | null;
    const savedCurrency = localStorage.getItem("tapcash_display_currency") as DisplayCurrency | null;

    if (savedLang) setLang(savedLang);
    if (savedCurrency) setDisplayCurrency(savedCurrency);
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        if (snapshot.exists()) {
          const data = snapshot.data();
          setIsAdmin(data.admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      return;
    }

    let cancelled = false;

    const loadBalance = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/debug/ledger-summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = (await response.json()) as LedgerSummaryResponse;
        if (!cancelled) {
          setBalance(Number(data.balanceCoins || 0));
        }
      } catch (error) {
        console.error("Failed to load ledger summary:", error);
      }
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const labels = useMemo(
    () =>
      ({
        en: {
          earn: "Earn",
          cashout: "Cashout",
          referrals: "Referrals",
          transactions: "Ledger",
          admin: "Admin",
          signOut: "Sign Out",
          signIn: "Sign In",
          signUp: "Join Free",
          balance: "Ledger Balance",
          tapToToggle: "Toggle between coins and CAD",
        },
        fr: {
          earn: "Gagner",
          cashout: "Retirer",
          referrals: "Parrainage",
          transactions: "Historique",
          admin: "Admin",
          signOut: "Se Deconnecter",
          signIn: "Se Connecter",
          signUp: "Creer un compte",
          balance: "Solde du registre",
          tapToToggle: "Basculer entre Coins et CAD",
        },
      })[lang],
    [lang]
  );

  const navItems = useMemo(
    () => [
      { name: labels.earn, href: "/dashboard", icon: CircleGauge },
      { name: labels.cashout, href: "/cashout", icon: DollarSign },
      { name: labels.referrals, href: "/referrals", icon: Users },
      { name: labels.transactions, href: "/transactions", icon: ArrowRightLeft },
      ...(isAdmin ? [{ name: labels.admin, href: "/admin", icon: ShieldAlert }] : []),
    ],
    [isAdmin, labels]
  );

  const toggleLanguage = () => {
    const next = lang === "en" ? "fr" : "en";
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("tapcash_preferred_lang", next);
      window.dispatchEvent(new Event("languageChange"));
    }
  };

  const toggleCurrency = () => {
    const next = displayCurrency === "COIN" ? "CAD" : "COIN";
    setDisplayCurrency(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("tapcash_display_currency", next);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const formattedBalance =
    displayCurrency === "COIN"
      ? `${balance.toLocaleString()} Coins`
      : `$${(balance / 1000).toLocaleString("en-CA", { minimumFractionDigits: 2 })} CAD`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050816]/78 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#00e6c3] via-[#3a7bff] to-[#9f7aea] shadow-[0_12px_40px_rgba(58,123,255,0.25)] group-hover:scale-105 transition-transform duration-200">
              <CircleGauge className="w-5.5 h-5.5 text-[#050816]" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-xl lg:text-2xl font-black tracking-tight tap-gradient-text font-display">
                TapCash
              </span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-semibold">
                Ledger-first rewards
              </span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all duration-200 tap-focus-ring ${
                    isActive
                      ? "bg-white/8 text-white border border-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleLanguage}
            title={lang === "en" ? "Passer en Francais" : "Switch to English"}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 tap-badge rounded-full text-xs font-black text-zinc-400 hover:text-white hover:border-white/15 transition-all tap-focus-ring"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{lang}</span>
          </button>

          {user ? (
            <>
              <button
                onClick={toggleCurrency}
                title={labels.tapToToggle}
                className="relative group tap-card hover:border-white/10 rounded-full py-1.5 pl-4 pr-5 flex items-center gap-3 transition-all duration-300 text-left cursor-pointer select-none tap-focus-ring"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00e6c3]/6 to-[#3a7bff]/6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#00e6c3] relative shrink-0 bg-white/5 border border-white/8">
                  {displayCurrency === "COIN" ? (
                    <CircleGauge className="w-4 h-4" />
                  ) : (
                    <span className="font-black text-xs leading-none text-[#00e6c3]">$</span>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">
                    {labels.balance}
                  </span>
                  <span className="text-sm font-black text-white leading-tight tracking-tight mt-0.5 whitespace-nowrap">
                    {formattedBalance}
                  </span>
                </div>
              </button>

              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 tap-badge hover:border-red-500/20 hover:text-red-300 text-zinc-400 text-sm font-bold rounded-full transition-all duration-200 tap-focus-ring"
              >
                <LogOut className="w-4 h-4" />
                <span>{labels.signOut}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/auth/signin"
                className="hidden sm:inline-flex px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition duration-200"
              >
                {labels.signIn}
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] hover:opacity-95 text-[#050816] text-sm font-black rounded-full shadow-[0_12px_30px_rgba(58,123,255,0.18)] transition-all duration-200 tap-focus-ring"
              >
                {labels.signUp}
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 text-zinc-400 hover:text-white xl:hidden rounded-full tap-focus-ring"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/5 bg-[#050816]/96 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={toggleLanguage}
                className="px-3 py-2 tap-badge rounded-full text-xs font-black text-zinc-400 hover:text-white hover:border-white/15 transition-all tap-focus-ring"
              >
                <span className="uppercase">{lang}</span>
              </button>
              {user && (
                <button
                  onClick={toggleCurrency}
                  className="px-3 py-2 tap-badge rounded-full text-xs font-black text-zinc-400 hover:text-white hover:border-white/15 transition-all tap-focus-ring"
                >
                  {displayCurrency === "COIN" ? "COINS" : "CAD"}
                </button>
              )}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold tracking-tight ${
                    isActive
                      ? "bg-white/8 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold tracking-tight text-zinc-400 hover:text-red-300 hover:bg-red-500/5"
              >
                <LogOut className="w-4 h-4" />
                <span>{labels.signOut}</span>
              </button>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold tracking-tight text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <span>{labels.signIn}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
