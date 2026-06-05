"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { ArrowRight, BadgeCheck, CircleGauge, Loader2, Sparkles, ShieldCheck, Trophy, Wallet } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { accentClass, formatCadFromCoins, formatCoins, tapCashActivity, tapCashLeaderboardSeed, tapCashOffers } from "@shared/tapcash-content";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";

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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [ledger, setLedger] = useState<LedgerSummaryResponse | null>(null);
  const [offers, setOffers] = useState(tapCashOffers);
  const [leaderboard, setLeaderboard] = useState(tapCashLeaderboardSeed);
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

  if (authLoading || (user && loading && !ledger)) {
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
            <ShieldCheck className="mx-auto h-12 w-12 text-[#8cf8e9]" />
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Sign in to open your dashboard</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The full ledger and offer data open after authentication.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <CTAButton href="/auth/signin" label="Sign in" />
              <CTAButton href="/" label="Back to home" variant="secondary" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const balanceCoins = ledger?.balanceCoins ?? 24750;
  const pendingCoins = ledger?.pendingCoins ?? 1200;
  const verificationState = ledger?.verificationState ?? "Verified";
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "credits") return (tx.balanceEffectCoins ?? 0) > 0 && tx.status !== "pending";
    if (filter === "cashouts") return tx.type?.includes("cashout");
    if (filter === "pending") return tx.status === "pending";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050813] text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <MotionWrap>
          <section className="rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#18d9ff]/20 bg-[#18d9ff]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#18d9ff]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dashboard shell
                </div>
                <div>
                  <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
                    A cleaner place to scan rewards, balance, and next actions.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#9aa8c6] md:text-base">
                    TapCash keeps the primary screen focused on what matters: verified state, payout path, and the strongest next CTA.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/rapidoreach" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#18d9ff] px-6 py-3.5 text-sm font-black text-[#050813] shadow-[0_18px_50px_rgba(24,217,255,0.25)] transition-transform hover:-translate-y-0.5">
                    Open offerwall
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/cashout" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.07]">
                    Review cashout
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Balance", value: formatCoins(balanceCoins), detail: formatCadFromCoins(balanceCoins), icon: CircleGauge },
                  { label: "Pending", value: formatCoins(pendingCoins), detail: "Under verification", icon: Wallet },
                  { label: "Status", value: verificationState, detail: "Email verified", icon: BadgeCheck },
                  { label: "Cashout", value: "Ready", detail: "Open payout store", icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9aa8c6]">{item.label}</p>
                        <Icon className="h-4 w-4 text-[#18d9ff]" />
                      </div>
                      <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
                      <p className="mt-1 text-sm text-[#9aa8c6]">{item.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </MotionWrap>

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
              {offers.map((offer, index) => {
                const classes = accentClass(offer.accent);
                return (
                  <MotionWrap key={offer.id} delay={index * 0.04}>
                    <div className={`rounded-[1.75rem] border ${classes.ring} bg-white/[0.03] p-5 ${classes.glow}`}>
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
                  </MotionWrap>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <PageShell eyebrow="Leaderboard" title="Top earners" description="Community proof without losing clarity." kicker={<Trophy className="h-6 w-6 text-[#f5c842]" />}>
              <div className="space-y-3">
                {leaderboard.map((row) => (
                  <div key={row.rank} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        #{row.rank} {row.displayName}
                      </p>
                      <p className="text-xs text-zinc-500">Community proof</p>
                    </div>
                    <p className="text-sm font-black text-[#8cf8e9]">{formatCoins(row.coins)}</p>
                  </div>
                ))}
              </div>
            </PageShell>

            <PageShell eyebrow="Recent activity" title="What people are doing now" description="Live scan of the product loop.">
              <div className="space-y-3">
                {tapCashActivity.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-white/6 bg-black/15 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                    <p className="mt-2 text-sm font-black text-[#8cf8e9]">{item.value}</p>
                  </div>
                ))}
              </div>
            </PageShell>
          </section>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-white/8 bg-white/[0.03]">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-white/6 px-4 py-4">
            {(["all", "credits", "cashouts", "pending"] as FilterType[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.22em] transition-colors ${
                  filter === item ? "bg-[#00e6c3] text-[#04101d]" : "bg-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
            <span className="ml-auto text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">{filteredTransactions.length} entries</span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Loader2 className="mx-auto h-10 w-10 text-zinc-700" />
              <p className="mt-4 text-sm font-semibold text-white">No matching transactions yet</p>
              <p className="mt-2 text-sm text-zinc-500">Complete offers or request a payout to populate the ledger.</p>
            </div>
          ) : (
            <div className="grid gap-3 p-4 sm:p-5">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="rounded-[1.5rem] border border-white/6 bg-black/15 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {tx.type.replaceAll("_", " ")}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white">{tx.balanceEffectCoins && tx.balanceEffectCoins > 0 ? "Credit" : "Balance change"} logged</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {tx.status} {tx.method ? `• ${tx.method}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${tx.balanceEffectCoins && tx.balanceEffectCoins > 0 ? "text-[#8cf8e9]" : "text-[#f5c842]"}`}>
                        {tx.balanceEffectCoins && tx.balanceEffectCoins > 0 ? "+" : "-"}
                        {Math.abs(tx.balanceEffectCoins ?? tx.amountCoins).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">coins</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#8cf8e9]">Next step</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Move from earned to payable with less friction.</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The dashboard works best when the next action is obvious. Jump from history to offers or cashout without re-learning the interface.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#f5c842]">Quick links</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Keep the flow moving</h2>
              </div>
              <BadgeCheck className="h-6 w-6 text-[#8cf8e9]" />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/rapidoreach" label="Open offerwall" />
              <CTAButton href="/cashout" label="Go to cashout" variant="secondary" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
