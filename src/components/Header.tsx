"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Menu, X, Sparkles, ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { tapCashNavItems } from "@shared/tapcash-content";

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => tapCashNavItems.filter((item) => item.href !== "/"),
    []
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#04101d]/82 backdrop-blur-2xl">
      <div className="border-b border-white/6 bg-gradient-to-r from-[#00e6c3]/14 via-[#3a7bff]/8 to-[#f5c842]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-200 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#00e6c3]" />
            Premium rewards shell
          </span>
          <span className="hidden md:inline text-zinc-400 tracking-normal normal-case font-semibold">
            Web and mobile now share the same trust-first content model.
          </span>
          <span className="tracking-normal normal-case font-semibold text-[#00e6c3]">
            TapCash
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00e6c3] via-[#3a7bff] to-[#f5c842] shadow-[0_18px_50px_rgba(58,123,255,0.2)] transition-transform duration-200 group-hover:scale-[1.03]">
            <ShieldCheck className="h-5 w-5 text-[#04101d]" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-xl font-black tracking-tight tap-gradient-text">TapCash</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
              Reward scanning, cashout clarity
            </p>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "border border-white/10 bg-white/8 text-white"
                    : "border border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/8"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/8 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="hidden sm:inline-flex rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#00e6c3] px-4 py-2.5 text-sm font-black text-[#04101d] shadow-[0_18px_40px_rgba(0,230,195,0.18)] transition-transform hover:-translate-y-0.5"
              >
                Join free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 xl:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/6 bg-[#04101d]/96 px-4 py-4 backdrop-blur-2xl xl:hidden sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${
                    active
                      ? "bg-white/8 text-white"
                      : "bg-white/[0.03] text-zinc-300"
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              );
            })}
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-300"
              >
                <span>Sign out</span>
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-300"
              >
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
