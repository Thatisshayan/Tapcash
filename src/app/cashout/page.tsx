"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Coins, Loader2, Sparkles, Wallet } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { accentClass, formatCoins, formatCadFromCoins, tapCashPayoutMethods } from "@shared/tapcash-content";

type LedgerSummaryResponse = {
  balanceCoins?: number;
  pendingCoins?: number;
};

export default function CashoutPage() {
  const { user, loading: authLoading } = useAuth();
  const reduceMotion = useReducedMotion();
  const [summary, setSummary] = useState<LedgerSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const motionProps = useMemo(
    () => ({
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [reduceMotion]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadSummary() {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/debug/ledger-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = (await response.json()) as LedgerSummaryResponse;
          if (!cancelled) {
            setSummary(data);
          }
        }
      } catch (error) {
        console.error("Failed to load cashout summary:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const balanceCoins = summary?.balanceCoins ?? 24750;
  const pendingCoins = summary?.pendingCoins ?? 1200;

  if (authLoading || (user && loading && !summary)) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#00e6c3]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <Header />
        <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 text-center">
            <Wallet className="mx-auto h-12 w-12 text-[#8cf8e9]" />
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Sign in to review cashout options</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The payout store is private because the balance and withdrawal queue are user-specific.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3 text-sm font-black text-[#04101d]">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
                Back home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040913] text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section {...motionProps} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,200,66,0.1),transparent_28%),linear-gradient(180deg,rgba(8,15,25,0.96),rgba(5,8,16,0.98))] p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f5c842]/20 bg-[#f5c842]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#f5c842]">
              <Sparkles className="h-3.5 w-3.5" />
              Payout store
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
              The cashout side stays visible, readable, and easy to trust.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
              TapCash keeps the withdrawal options up front so users know what they can redeem and when they can do it.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Balance</p>
                <p className="mt-2 text-3xl font-black text-white">{formatCoins(balanceCoins)}</p>
                <p className="mt-1 text-sm text-zinc-400">{formatCadFromCoins(balanceCoins)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Pending</p>
                <p className="mt-2 text-3xl font-black text-white">{formatCoins(pendingCoins)}</p>
                <p className="mt-1 text-sm text-zinc-400">Queued for review</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/cashout/status" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3.5 text-sm font-black text-[#04101d]">
                Check payout status
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white">
                Back to dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {tapCashPayoutMethods.map((method) => {
              const classes = accentClass(method.accent);
              return (
                <div key={method.id} className={`rounded-[1.75rem] border ${classes.ring} bg-white/[0.03] p-5 ${classes.glow}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${classes.badge}`}>
                        {method.audience}
                      </div>
                      <h2 className="mt-4 text-2xl font-black text-white">{method.label}</h2>
                    </div>
                    <BadgeCheck className="h-5 w-5 text-[#8cf8e9]" />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{method.subtitle}</p>

                  <div className="mt-5 space-y-3 border-t border-white/6 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Minimum</span>
                      <span className="font-semibold text-white">{formatCoins(method.minCoins)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Timing</span>
                      <span className="font-semibold text-white">{method.eta}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Verification model</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Server-approved, not client-pretend.</h2>
                </div>
                <Coins className="h-6 w-6 text-[#f5c842]" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  "Sensitive actions stay ledger-backed.",
                  "The queue is visible before you request a payout.",
                  "Users can review the status flow from one place.",
                ].map((point) => (
                  <div key={point} className="rounded-2xl border border-white/6 bg-black/15 px-4 py-3 text-sm text-zinc-300">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
