"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Coins, Loader2, Sparkles, Wallet } from "lucide-react";
import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";
import { useAuth } from "@/context/AuthContext";
import { accentClass, formatCoins, formatCadFromCoins, tapCashPayoutMethods } from "@shared/tapcash-content";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

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
    if (!user) return;

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
        <PremiumHeader />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#00e6c3]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <PremiumHeader />
        <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <MotionWrap>
            <PageShell eyebrow="Payout store" title="Sign in to review cashout options" description="The payout store is private because the balance and withdrawal queue are user-specific.">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <CTAButton href="/auth/signin" label="Sign in" />
                <CTAButton href="/" label="Back home" variant="secondary" />
              </div>
            </PageShell>
          </MotionWrap>
        </main>
        <PremiumFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040913] text-white">
      <PremiumHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <MotionWrap>
          <PageShell
            eyebrow="Payout store"
            title="The cashout side stays visible, readable, and easy to trust."
            description="TapCash keeps the withdrawal options up front so users know what they can redeem and when they can do it."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Balance" value={formatCoins(balanceCoins)} detail={formatCadFromCoins(balanceCoins)} />
              <StatCard label="Pending" value={formatCoins(pendingCoins)} detail="Queued for review" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/cashout/status" label="Check payout status" />
              <CTAButton href="/dashboard" label="Back to dashboard" variant="secondary" />
            </div>
          </PageShell>
        </MotionWrap>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {tapCashPayoutMethods.map((method, index) => {
            const classes = accentClass(method.accent);
            return (
              <MotionWrap key={method.id} delay={index * 0.04}>
                <motion.div {...motionProps} transition={{ ...(motionProps.transition as object), delay: reduceMotion ? 0 : index * 0.04 }} className={`rounded-[1.75rem] border ${classes.ring} bg-white/[0.03] p-5 ${classes.glow}`}>
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
                  <div className="mt-5 space-y-3 border-t border-white/6 pt-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Minimum</span>
                      <span className="font-semibold text-white">{formatCoins(method.minCoins)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Timing</span>
                      <span className="font-semibold text-white">{method.eta}</span>
                    </div>
                  </div>
                </motion.div>
              </MotionWrap>
            );
          })}
        </div>

        <MotionWrap>
          <div className="mt-8 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 sm:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Verification model</p>
                <h2 className="mt-2 text-2xl font-black text-white">Server-approved, not client-pretend.</h2>
              </div>
              <Coins className="h-6 w-6 text-[#f5c842]" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {["Sensitive actions stay ledger-backed.", "The queue is visible before you request a payout.", "Users can review the status flow from one place."].map((point) => (
                <div key={point} className="rounded-2xl border border-white/6 bg-black/15 px-4 py-3 text-sm text-zinc-300">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </MotionWrap>
      </main>
      <PremiumFooter />
    </div>
  );
}
