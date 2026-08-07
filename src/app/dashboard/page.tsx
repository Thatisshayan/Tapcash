"use client";

import { useEffect, useState, useCallback, useMemo, useId } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Loader2, Trophy } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { usePolling } from "@/hooks/usePolling";
import { formatCadFromCoins, tapCashActivity, tapCashLeaderboardSeed, tapCashOffers } from "@shared/tapcash-content";
import { CTAButton, MotionWrap } from "@/components/PremiumUi";
import StreakWidget from "@/components/StreakWidget";

// Aurora accent rotation (packages/tokens/tokens.json v3.0.0) -- gold / violet / blue.
// No green, no purple-as-primary, no neon. Rotated by index for the offer list
// so a column of rows reads as a system, not a single flat color.
const AURORA_ACCENTS = ["#D9B678", "#6C5CE0", "#3E6FD9"] as const;
const HAIRLINE = "rgba(245,243,239,0.09)";
const MIN_CASHOUT_COINS = 20000; // $20.00 CAD minimum, canonical rate 1000 coins = $1 CAD

type LedgerTx = {
  id: string;
  type: string;
  amountCoins: number;
  balanceEffectCoins?: number;
  method?: string;
  status: string;
  createdAt: Date | string | { toDate?: () => Date } | null;
};

type FilterType = "all" | "credits" | "cashouts" | "pending";

type LedgerSummaryResponse = {
  balanceCoins?: number;
  pendingCoins?: number;
  verificationState?: string;
};

/** Ease-out cubic count-up, ~1.3s. Respects prefers-reduced-motion. */
function useCountUp(target: number, active: boolean, duration = 1300) {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, reduceMotion]);

  return value;
}

/** Borderless circular progress ring -- the mockup's "stat cluster" ring, sitting
 * directly on the page atmosphere rather than inside a bordered card panel. */
function CashoutProgressRing({ progress, size = 120, strokeWidth = 7 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);
  const reduceMotion = useReducedMotion();
  const gradientId = useId();

  useEffect(() => {
    if (reduceMotion) {
      setAnimated(progress);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1300;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(progress * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, reduceMotion]);

  const dash = (circumference * Math.min(Math.max(animated, 0), 100)) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={HAIRLINE} strokeWidth={strokeWidth} />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0CE97" />
            <stop offset="100%" stopColor="#D9B678" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-black tabular-nums text-[#F5F3EF]">{Math.round(Math.min(Math.max(animated, 0), 100))}%</span>
      </div>
    </div>
  );
}

function GDPRExportButton({ user }: { user: { getIdToken: () => Promise<string> } | null }) {
  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/gdpr/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tapcash-data-export-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      console.error("GDPR export failed");
    } finally {
      setExporting(false);
    }
  };
  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[rgba(245,243,239,0.45)] transition-colors hover:text-[#F5F3EF] disabled:opacity-40"
    >
      {exporting ? "Exporting..." : "Download my data"}
    </button>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [ledger, setLedger] = useState<LedgerSummaryResponse | null>(null);
  const [offers, setOffers] = useState(tapCashOffers);
  const [leaderboard, setLeaderboard] = useState(tapCashLeaderboardSeed);
  const [liveActivity, setLiveActivity] = useState(tapCashActivity);
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!user) return;

    const currentUser = user;
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const token = await currentUser.getIdToken();
        const [ledgerResponse, offersResponse, leaderboardResponse] = await Promise.allSettled([
          fetch("/api/debug/ledger-summary", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/offers"),
          fetch("/api/leaderboard"),
        ]);

        if (!cancelled && ledgerResponse.status === "fulfilled" && ledgerResponse.value.ok) {
          const data = (await ledgerResponse.value.json()) as LedgerSummaryResponse;
          setLedger(data);
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
        if (!cancelled) setError("We could not refresh the live dashboard data right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const ledgerQuery = query(
      collection(db, "ledger_transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      ledgerQuery,
      (snapshot) => {
        setTransactions(snapshot.docs.slice(0, 6).map((doc) => ({ id: doc.id, ...doc.data() })) as LedgerTx[]);
      },
      (snapshotError) => {
        console.error("Ledger subscription error:", snapshotError);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const refreshActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity/live");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.activities) && data.activities.length > 0) {
        setLiveActivity(
          data.activities.map((a: { userName: string; type: string; offerTitle?: string; amount?: number }) => ({
            label: a.userName,
            detail: a.type === "offer_completed" ? `completed ${a.offerTitle || "an offer"}` : a.type === "cashout" ? "requested a payout" : "joined TapCash",
            value: a.amount ? `+${a.amount} coins` : "",
          })),
        );
      }
    } catch {
      // silent fallback stays at seed data
    }
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/leaderboard/live", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
        setLeaderboard(data.leaderboard.slice(0, 4));
      }
    } catch {
      // silent fallback stays at seed data
    }
  }, [user]);

  usePolling(refreshActivity, 30000, !!user);
  usePolling(refreshLeaderboard, 60000, !!user);

  const balanceCoins = ledger?.balanceCoins ?? 0;
  const pendingCoins = ledger?.pendingCoins ?? 0;
  // Real verification state from the Firebase Auth user record -- the ledger-summary
  // API does not return `verificationState`, so this used to always fall back to the
  // literal string "Verified" regardless of whether the account actually was. That is
  // exactly the hardcoded-fake-state anti-pattern REDESIGN_SPEC.md warns about, so it's
  // wired to `user.emailVerified` here instead.
  const verified = user?.emailVerified ?? false;
  const animatedBalance = useCountUp(balanceCoins, !loading && !!ledger);
  const cashoutProgress = useMemo(() => Math.min((balanceCoins / MIN_CASHOUT_COINS) * 100, 100), [balanceCoins]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "credits") return (tx.balanceEffectCoins ?? 0) > 0 && tx.status !== "pending";
    if (filter === "cashouts") return tx.type?.includes("cashout");
    if (filter === "pending") return tx.status === "pending";
    return true;
  });

  if (authLoading || (user && loading && !ledger)) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#D9B678]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
        <Navbar />
        <main className="mx-auto flex min-h-[75vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 py-12 text-center sm:px-6 lg:px-8">
          <MotionWrap>
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">Authentication</p>
              <h1 className="text-3xl font-black tracking-tight text-[#F5F3EF] md:text-4xl">Sign in to open your dashboard</h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-[rgba(245,243,239,0.68)]">
                The full ledger, offer data, and cashout queue open after authentication.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <CTAButton href="/auth/signin" label="Sign in" />
                <CTAButton href="/" label="Back to home" variant="secondary" />
              </div>
            </div>
          </MotionWrap>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <MotionWrap>
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">Dashboard</p>
            <h1 className="text-3xl font-black tracking-tight text-[#F5F3EF] md:text-4xl">
              A cleaner place to scan rewards, balance, and next actions.
            </h1>
            <p className="text-base leading-relaxed text-[rgba(245,243,239,0.68)]">
              TapCash keeps the primary screen focused on what matters: verified state, payout path, and the strongest next CTA.
            </p>
          </div>
        </MotionWrap>

        {/* Stat cluster: huge balance number + borderless progress ring, separated by a
            hairline divider -- no bordered card panels (Aurora anti-pattern). */}
        <MotionWrap delay={0.05} className="mt-10">
          <div
            className="flex flex-col gap-8 pb-10 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderBottom: `1px solid ${HAIRLINE}` }}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[rgba(245,243,239,0.45)]">Balance</p>
              <p className="mt-3 font-mono text-5xl font-black tabular-nums text-[#F5F3EF] sm:text-6xl">
                {animatedBalance.toLocaleString()}
                <span className="ml-2 text-lg font-bold text-[rgba(245,243,239,0.45)]">coins</span>
              </p>
              <p className="mt-2 font-mono text-lg font-bold tabular-nums text-[#D9B678]">{formatCadFromCoins(balanceCoins)}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[rgba(245,243,239,0.68)]">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className={`h-4 w-4 ${verified ? "text-[#D9B678]" : "text-[rgba(245,243,239,0.45)]"}`} />
                  {verified ? "Email verified" : "Email verification pending"}
                </span>
                {pendingCoins > 0 && (
                  <span className="font-mono tabular-nums">{pendingCoins.toLocaleString()} coins pending review</span>
                )}
              </div>
            </div>

            <div className="hidden h-24 w-px sm:block" style={{ backgroundColor: HAIRLINE }} />

            <div className="flex flex-col items-center gap-3 self-center">
              <CashoutProgressRing progress={cashoutProgress} />
              <p className="max-w-[10rem] text-center text-xs text-[rgba(245,243,239,0.45)]">
                <span className="font-mono tabular-nums text-[#F5F3EF]">{formatCadFromCoins(balanceCoins)}</span> of $20.00 min cashout
              </p>
            </div>
          </div>
        </MotionWrap>

        <MotionWrap delay={0.08} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/rapidoreach"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-[#0A0A0D] transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
          >
            Open offerwall
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/cashout"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-[#F5F3EF] transition-colors hover:bg-white/[0.04]"
            style={{ border: `1px solid ${HAIRLINE}` }}
          >
            Review cashout
          </Link>
        </MotionWrap>

        <div className="mt-8">
          <StreakWidget />
        </div>

        {error && (
          <div
            className="mt-6 rounded-2xl px-4 py-3 text-sm text-[#F0CE97]"
            style={{ border: "1px solid rgba(217,182,120,0.25)", background: "rgba(217,182,120,0.08)" }}
          >
            {error}
          </div>
        )}

        <div className="mt-12 grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#D9B678]">Featured offers</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#F5F3EF]">Pick a task that fits the session</h2>
              </div>
              <Link href="/rapidoreach" className="hidden text-sm font-semibold text-[rgba(245,243,239,0.45)] transition-colors hover:text-[#F5F3EF] sm:inline-flex">
                All offers
              </Link>
            </div>

            <div>
              {offers.map((offer, index) => {
                const accent = AURORA_ACCENTS[index % AURORA_ACCENTS.length];
                return (
                  <MotionWrap key={offer.id} delay={index * 0.04}>
                    <div
                      className="group flex flex-col gap-4 py-5 pl-5 transition-transform hover:-translate-y-0.5 md:flex-row md:items-start md:justify-between"
                      style={{ borderLeft: `2px solid ${accent}`, borderBottom: index < offers.length - 1 ? `1px solid ${HAIRLINE}` : undefined }}
                    >
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgba(245,243,239,0.45)]">
                          {offer.provider} · {offer.category}
                        </p>
                        <h3 className="text-xl font-black tracking-tight text-[#F5F3EF]">{offer.title}</h3>
                        <p className="max-w-2xl text-sm leading-relaxed text-[rgba(245,243,239,0.68)]">{offer.description}</p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[rgba(245,243,239,0.45)]">Payout</p>
                        <p className="mt-1 font-mono text-2xl font-black tabular-nums text-[#F5F3EF]">+{offer.payoutCoins.toLocaleString()}</p>
                        <p className="mt-1 text-xs text-[rgba(245,243,239,0.45)]">{offer.estimateMinutes} min session</p>
                      </div>
                    </div>
                  </MotionWrap>
                );
              })}
            </div>
          </section>

          <section className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#D9B678]" />
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[rgba(245,243,239,0.45)]">Leaderboard</p>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#F5F3EF]">Top earners</h2>
              <div>
                {leaderboard.map((row, i) => (
                  <div
                    key={row.rank}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: i < leaderboard.length - 1 ? `1px solid ${HAIRLINE}` : undefined }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#F5F3EF]">
                        #{row.rank} {row.displayName}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-black tabular-nums text-[#D9B678]">{row.coins.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[rgba(245,243,239,0.45)]">Recent activity</p>
              <h2 className="text-2xl font-black tracking-tight text-[#F5F3EF]">What people are doing now</h2>
              <div>
                {liveActivity.map((item, i) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="flex items-center justify-between gap-4 py-3"
                    style={{ borderBottom: i < liveActivity.length - 1 ? `1px solid ${HAIRLINE}` : undefined }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#F5F3EF]">{item.label}</p>
                      <p className="mt-1 text-xs text-[rgba(245,243,239,0.45)]">{item.detail}</p>
                    </div>
                    <p className="font-mono text-sm font-black tabular-nums text-[#D9B678]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12" style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: "2rem" }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {(["all", "credits", "cashouts", "pending"] as FilterType[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className="whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.22em] transition-colors"
                style={
                  filter === item
                    ? { background: "linear-gradient(135deg, #F0CE97, #D9B678)", color: "#0A0A0D" }
                    : { background: "rgba(245,243,239,0.04)", color: "rgba(245,243,239,0.68)" }
                }
              >
                {item}
              </button>
            ))}
            <span className="ml-auto text-[10px] font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">
              {filteredTransactions.length} entries
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="space-y-4 py-12 text-center">
              <Trophy className="mx-auto h-10 w-10 text-[rgba(245,243,239,0.28)]" />
              <div>
                <p className="text-sm font-semibold text-[#F5F3EF]">No transactions yet</p>
                <p className="mt-1 text-sm text-[rgba(245,243,239,0.45)]">Complete offers to start earning, then cash out.</p>
              </div>
              <div className="flex justify-center gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)", color: "#0A0A0D" }}
                >
                  Start Earning
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/cashout"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[rgba(245,243,239,0.68)] transition hover:text-[#F5F3EF]"
                  style={{ border: `1px solid ${HAIRLINE}` }}
                >
                  Cash Out
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {filteredTransactions.map((tx, i) => {
                const isCredit = (tx.balanceEffectCoins ?? 0) > 0;
                const dotColor = tx.status === "pending" ? "#3E6FD9" : isCredit ? "#D9B678" : "#6C5CE0";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 py-4"
                    style={{ borderBottom: i < filteredTransactions.length - 1 ? `1px solid ${HAIRLINE}` : undefined }}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgba(245,243,239,0.45)]">
                        {tx.type.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 text-sm text-[rgba(245,243,239,0.68)]">
                        {tx.status} {tx.method ? `· ${tx.method}` : ""}
                      </p>
                    </div>
                    <p className={`font-mono text-lg font-black tabular-nums ${isCredit ? "text-[#D9B678]" : "text-[#F5F3EF]"}`}>
                      {isCredit ? "+" : "-"}
                      {Math.abs(tx.balanceEffectCoins ?? tx.amountCoins).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-10 divide-y divide-transparent lg:grid-cols-2 lg:gap-16" style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: "2.5rem" }}>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#D9B678]">Next step</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#F5F3EF]">Move from earned to payable with less friction.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(245,243,239,0.68)]">
              The dashboard works best when the next action is obvious. Jump from history to offers or cashout without re-learning the interface.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#D9B678]">Quick links</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#F5F3EF]">Keep the flow moving</h2>
              </div>
              <BadgeCheck className="h-6 w-6 text-[#D9B678]" />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/rapidoreach" label="Open offerwall" />
              <CTAButton href="/cashout" label="Go to cashout" variant="secondary" />
            </div>
            <GDPRExportButton user={user} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
