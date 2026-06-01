"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CircleGauge,
  Loader2,
  Sparkles,
  Trophy,
  Wallet,
  ShieldCheck,
  Activity,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { accentClass, formatCoins, formatCadFromCoins, tapCashOffers, tapCashLeaderboardSeed, tapCashActivity } from "@shared/tapcash-content";

type LedgerSummaryResponse = {
  balanceCoins?: number;
  pendingCoins?: number;
  verificationState?: string;
};

type LeaderboardEntry = {
  rank: number;
  displayName: string;
  coins: number;
};

function useDashboardMotion() {
  const reduceMotion = useReducedMotion();

  return useMemo(
    () => ({
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [reduceMotion]
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const motionProps = useDashboardMotion();
  const [ledger, setLedger] = useState<LedgerSummaryResponse | null>(null);
  const [offers, setOffers] = useState(tapCashOffers);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(tapCashLeaderboardSeed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const token = await currentUser.getIdToken();
        const [ledgerResponse, offersResponse, leaderboardResponse] = await Promise.allSettled([
          fetch("/api/debug/ledger-summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/offers"),
          fetch("/api/leaderboard"),
        ]);

        if (!cancelled && ledgerResponse.status === "fulfilled" && ledgerResponse.value.ok) {
          const ledgerData = (await ledgerResponse.value.json()) as LedgerSummaryResponse;
          setLedger(ledgerData);
        }

        if (!cancelled && offersResponse.status === "fulfilled" && offersResponse.value.ok) {
          const data = await offersResponse.value.json();
          if (Array.isArray(data.offers) && data.offers.length > 0) {
            setOffers(
              data.offers.slice(0, 4).map((offer: { id: string; title: string; description: string; payout: number; provider: string; category?: string }) => ({
                id: offer.id,
                title: offer.title,
                provider: offer.provider,
                category: offer.category || "Offer",
                payoutCoins: offer.payout,
                estimateMinutes: offer.payout >= 500 ? 20 : 8,
                description: offer.description,
                accent: offer.payout >= 500 ? "blue" : "teal",
                cta: "Open offer",
              }))
            );
          }
        }

        if (!cancelled && leaderboardResponse.status === "fulfilled" && leaderboardResponse.value.ok) {
          const data = await leaderboardResponse.value.json();
          if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
            setLeaderboard(data.leaderboard.slice(0, 4));
          }
        }
      } catch (dashboardError) {
        console.error("Dashboard load failed:", dashboardError);
        if (!cancelled) {
          setError("We could not refresh the live dashboard data right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || (user && loading && !ledger)) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#00e6c3]" />
            <p className="mt-4 text-sm text-zinc-400">Loading the dashboard shell...</p>
          </div>
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
            <ShieldCheck className="mx-auto h-12 w-12 text-[#8cf8e9]" />
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Sign in to open your dashboard</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The dashboard stays visible, but the full ledger and offer data only open after authentication.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3 text-sm font-black text-[#04101d]">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const balanceCoins = ledger?.balanceCoins ?? 24750;
  const pendingCoins = ledger?.pendingCoins ?? 1200;
  const verificationState = ledger?.verificationState ?? "Verified";

  return (
    <div className="min-h-screen bg-[#040913] text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.section {...motionProps} className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.14),transparent_28%),linear-gradient(180deg,rgba(7,15,24,0.96),rgba(5,8,16,0.98))] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8cf8e9]">
                <Sparkles className="h-3.5 w-3.5" />
                Dashboard shell
              </div>
              <div>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
                  A cleaner place to scan rewards, balance, and next actions.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                  TapCash keeps the primary screen focused on what matters: verified state, payout path, and the strongest next CTA.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/rapidoreach" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3.5 text-sm font-black text-[#04101d]">
                  Open offerwall
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/cashout" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white">
                  Review cashout
                  <Wallet className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Balance", value: formatCoins(balanceCoins), detail: formatCadFromCoins(balanceCoins), icon: CircleGauge },
                { label: "Pending", value: formatCoins(pendingCoins), detail: "Under verification", icon: Activity },
                { label: "Status", value: verificationState, detail: "Email verified", icon: BadgeCheck },
                { label: "Cashout", value: "Ready", detail: "Open payout store", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{item.label}</p>
                      <Icon className="h-4 w-4 text-[#8cf8e9]" />
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {error && (
          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#8cf8e9]">Featured offers</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Pick a task that fits the session</h2>
              </div>
              <Link href="/rapidoreach" className="hidden text-sm font-semibold text-zinc-400 transition-colors hover:text-white sm:inline-flex">
                All offers
              </Link>
            </div>

            <div className="grid gap-4">
              {offers.map((offer) => {
                const classes = accentClass(offer.accent);
                return (
                  <div key={offer.id} className={`rounded-[1.75rem] border ${classes.ring} bg-white/[0.03] p-5 ${classes.glow}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                          {offer.provider} · {offer.category}
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-white">{offer.title}</h3>
                        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{offer.description}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Payout</p>
                        <p className="mt-1 text-2xl font-black text-white">+{offer.payoutCoins.toLocaleString()}</p>
                        <p className="mt-1 text-xs text-zinc-500">{offer.estimateMinutes} min session</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4">
                      <p className="text-sm font-semibold text-zinc-400">{offer.cta}</p>
                      <ArrowRight className="h-4 w-4 text-[#8cf8e9]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#f5c842]">Leaderboard</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-white">Top earners</h2>
                <Trophy className="h-5 w-5 text-[#f5c842]" />
              </div>
              <div className="mt-5 space-y-3">
                {leaderboard.map((row) => (
                  <div key={row.rank} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">#{row.rank} {row.displayName}</p>
                      <p className="text-xs text-zinc-500">Community proof</p>
                    </div>
                    <p className="text-sm font-black text-[#8cf8e9]">{formatCoins(row.coins)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#8cf8e9]">Recent activity</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">What people are doing now</h2>
              <div className="mt-5 space-y-3">
                {tapCashActivity.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-white/6 bg-black/15 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                    <p className="mt-2 text-sm font-black text-[#8cf8e9]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
