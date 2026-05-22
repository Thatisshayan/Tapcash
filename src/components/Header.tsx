// src/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Coins, LogOut, Menu, X, Landmark, Users, ArrowRightLeft, ShieldAlert, Globe, DollarSign } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom bilingual & currency toggles
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [displayCurrency, setDisplayCurrency] = useState<"COIN" | "CAD">("COIN");

  const router = useRouter();
  const pathname = usePathname();

  // Hydrate local preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("tapcash_preferred_lang") as "en" | "fr";
      if (savedLang) setLang(savedLang);

      const savedCurr = localStorage.getItem("tapcash_display_currency") as "COIN" | "CAD";
      if (savedCurr) setDisplayCurrency(savedCurr);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "fr" : "en";
    setLang(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("tapcash_preferred_lang", nextLang);
      // Dispatch custom event to let other components listen to language updates
      window.dispatchEvent(new Event("languageChange"));
    }
  };

  const toggleCurrency = () => {
    const nextCurr = displayCurrency === "COIN" ? "CAD" : "COIN";
    setDisplayCurrency(nextCurr);
    if (typeof window !== "undefined") {
      localStorage.setItem("tapcash_display_currency", nextCurr);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBalance(data.wallet?.balance || 0);
          setIsAdmin(data.admin === true);
        }
      },
      (error) => {
        console.error("Error subscribing to user balance:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Translations Map
  const labels = {
    en: {
      earn: "Earn Coins",
      referrals: "Referrals",
      transactions: "Transactions",
      admin: "Admin",
      signOut: "Sign Out",
      signIn: "Sign In",
      signUp: "Sign Up Free",
      balance: "Wallet Balance",
      tapToToggle: "Click to toggle CAD views",
    },
    fr: {
      earn: "Gagner des Coins",
      referrals: "Parrainage",
      transactions: "Retraits & Vault",
      admin: "Admin",
      signOut: "Se Déconnecter",
      signIn: "Se Connecter",
      signUp: "S'inscrire",
      balance: "Solde",
      tapToToggle: "Cliquez pour voir en CAD",
    }
  }[lang];

  const navItems = [
    { name: labels.earn, href: "/dashboard", icon: Coins },
    { name: labels.referrals, href: "/referrals", icon: Users },
    { name: labels.transactions, href: "/transactions", icon: ArrowRightLeft },
    ...(isAdmin ? [{ name: labels.admin, href: "/admin", icon: ShieldAlert }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 border-b border-zinc-900 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-200">
              <Coins className="w-5.5 h-5.5 text-black" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-emerald-400 tracking-tight">
              TapCash
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Wallet, Local Language, & Profile Actions */}
        <div className="flex items-center gap-4">
          
          {/* Bilingual Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title={lang === "en" ? "Passer en Français" : "Switch to English"}
            className="px-3 py-2 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-850 rounded-xl text-xs font-black text-zinc-400 hover:text-emerald-400 flex items-center gap-1.5 transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{lang}</span>
          </button>

          {user ? (
            <>
              {/* Interactive Wallet Balance Pill (Coins <-> CAD Dynamic Toggle) */}
              <button
                onClick={toggleCurrency}
                title={labels.tapToToggle}
                className="relative group bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-900 hover:border-emerald-500/25 rounded-full py-1.5 pl-4 pr-5 flex items-center gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 text-left cursor-pointer select-none"
              >
                <div className="absolute inset-0 bg-emerald-500/[0.01] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 relative shrink-0">
                  {displayCurrency === "COIN" ? (
                    <Coins className="w-4 h-4 animate-pulse" />
                  ) : (
                    <span className="font-black text-xs leading-none text-emerald-400">$</span>
                  )}
                  {/* Glowing dynamic ring */}
                  <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping opacity-25" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">
                    {labels.balance}
                  </span>
                  <span className="text-sm font-black text-emerald-400 leading-tight tracking-tight mt-0.5 whitespace-nowrap">
                    {displayCurrency === "COIN" ? (
                      `${balance.toLocaleString()} Coins`
                    ) : (
                      `$${(balance / 1000).toLocaleString("en-CA", { minimumFractionDigits: 2 })} CAD`
                    )}
                  </span>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-red-500/30 hover:text-red-400 text-zinc-400 text-sm font-bold rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{labels.signOut}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition duration-200"
              >
                {labels.signIn}
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200"
              >
                {labels.signUp}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-[#0a0a0a] px-4 pt-4 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl text-base font-bold text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>{labels.signOut}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
