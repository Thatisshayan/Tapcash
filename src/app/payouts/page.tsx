"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Wallet } from "lucide-react";
import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";
import { accentClass, formatCoins, tapCashPayoutMethods } from "@shared/tapcash-content";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { useMemo } from "react";

export default function PayoutsPage() {
  const reduceMotion = useReducedMotion();
  const motionProps = useMemo(
    () => ({
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [reduceMotion]
  );

  return (
    <div className="min-h-screen bg-[#040913] text-white">
      <PremiumHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <MotionWrap>
          <section className="rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(245,200,66,0.08),transparent_30%),linear-gradient(180deg,rgba(8,15,25,0.96),rgba(5,8,16,0.98))] p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f5c842]/20 bg-[#f5c842]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#f5c842]">
              <Sparkles className="h-3.5 w-3.5" />
              Payout guide
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
              The withdrawal options are presented like a storefront, not a hidden settings page.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
              TapCash is intentionally explicit about minimums, timing, and audience fit so users can decide before they start earning.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/cashout" label="Open cashout" />
              <CTAButton href="/dashboard" label="Back to dashboard" variant="secondary" />
            </div>
          </section>
        </MotionWrap>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tapCashPayoutMethods.map((method, index) => {
            const classes = accentClass(method.accent);
            return (
              <motion.article key={method.id} {...motionProps} transition={{ ...(motionProps.transition as object), delay: reduceMotion ? 0 : index * 0.04 }} className={`rounded-[1.75rem] border ${classes.ring} bg-white/[0.03] p-5 ${classes.glow}`}>
                <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${classes.badge}`}>
                  {method.audience}
                </div>
                <h2 className="mt-4 text-2xl font-black text-white">{method.label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{method.subtitle}</p>
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
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <PageShell eyebrow="Trust rules" title="Visible before withdrawal" description="The backend decides when a payout can be created, and the UI keeps that truth obvious.">
            <div className="space-y-3">
              {["The backend decides when a payout can be created.", "The UI never pretends a payout succeeded before verification.", "The cashout store always shows the minimum threshold up front."].map((point) => (
                <div key={point} className="rounded-2xl border border-white/6 bg-black/15 px-4 py-3 text-sm text-zinc-300">
                  {point}
                </div>
              ))}
            </div>
          </PageShell>

          <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f5c842]">Next action</p>
                <h2 className="mt-2 text-2xl font-black text-white">Open the cashout store</h2>
              </div>
              <Wallet className="h-6 w-6 text-[#8cf8e9]" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              This route is informational. The actual withdrawal interaction stays in the cashout store where balance and status are already visible.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/cashout" label="Open cashout" />
              <CTAButton href="/transactions" label="View ledger" variant="secondary" />
            </div>
          </section>
        </div>
      </main>
      <PremiumFooter />
    </div>
  );
}
