"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatCoins, tapCashPayoutMethods } from "@shared/tapcash-content";
import { MotionWrap } from "@/components/PremiumUi";

// Aurora palette (packages/tokens/tokens.json v3.0.0). No bounded card/box
// chrome as the default layout language -- methods are grouped with
// spacing + typography + a hairline divider, matching the pattern already
// established on /cashout and /rewards in this same rollout.
const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";
const INK = "#F5F3EF";

// Interac e-Transfer stays out of the visible list per the still-active
// product freeze (docs/governance/DEFERRED_WORK.md) -- filtered at render
// time only. The underlying shared data entry is untouched.
const VISIBLE_METHODS = tapCashPayoutMethods.filter((m) => m.id !== "interac");

export default function PayoutsPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Hero -- de-boxed: spacing + typography hierarchy, no card chrome */}
        <MotionWrap>
          <div
            className="relative pb-8"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 0%, rgba(217,182,120,0.07), transparent 45%)",
            }}
          >
            <div
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em]"
              style={{ color: GOLD_BRIGHT }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Payout guide
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl md:text-5xl" style={{ color: INK }}>
              The withdrawal options are presented like a storefront, not a hidden settings page.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,243,239,0.68)" }}>
              TapCash is intentionally explicit about minimums, timing, and audience fit so users can decide before they start earning.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                href="/cashout"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#0A0A0D", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
              >
                Open cashout <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="text-sm font-bold transition-colors" style={{ color: "rgba(245,243,239,0.68)" }}>
                Back to dashboard
              </Link>
            </div>
          </div>
        </MotionWrap>

        <div className="mt-10">
          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.26em]" style={{ color: "rgba(245,243,239,0.45)" }}>
            Payout methods
          </p>
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {VISIBLE_METHODS.map((method, index) => (
              <motion.article
                key={method.id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: index * 0.04 }}
                className="flex flex-col h-full pb-8 border-b"
                style={{ borderColor: "rgba(245,243,239,0.09)" }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "#6C5CE0" }}>
                  {method.audience}
                </p>
                <h2 className="mt-3 text-2xl font-black" style={{ color: INK }}>{method.label}</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(245,243,239,0.5)" }}>{method.subtitle}</p>
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "rgba(245,243,239,0.45)" }}>Minimum</span>
                    <span className="font-mono font-semibold tabular-nums" style={{ color: INK }}>{formatCoins(method.minCoins)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "rgba(245,243,239,0.45)" }}>Timing</span>
                    <span className="font-semibold" style={{ color: INK }}>{method.eta}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <MotionWrap>
            <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "rgba(245,243,239,0.45)" }}>
              Trust rules
            </p>
            <h2 className="mt-2 text-2xl font-black" style={{ color: INK }}>Visible before withdrawal</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(245,243,239,0.68)" }}>
              The backend decides when a payout can be created, and the UI keeps that truth obvious.
            </p>
            <div className="mt-6 space-y-4">
              {["The backend decides when a payout can be created.", "The UI never pretends a payout succeeded before verification.", "The cashout store always shows the minimum threshold up front."].map((point) => (
                <p key={point} className="text-sm leading-relaxed" style={{ color: "rgba(245,243,239,0.68)" }}>
                  {point}
                </p>
              ))}
            </div>
          </MotionWrap>

          <MotionWrap delay={0.05}>
            <div className="border-t pt-8" style={{ borderColor: "rgba(245,243,239,0.09)" }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.26em]" style={{ color: GOLD_BRIGHT }}>Next action</p>
                  <h2 className="mt-2 text-2xl font-black" style={{ color: INK }}>Open the cashout store</h2>
                </div>
                <Wallet className="h-6 w-6 shrink-0" style={{ color: GOLD }} />
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(245,243,239,0.68)" }}>
                This route is informational. The actual withdrawal interaction stays in the cashout store where balance and status are already visible.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cashout"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#0A0A0D", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
                >
                  Open cashout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/transactions" className="inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors" style={{ color: "rgba(245,243,239,0.68)" }}>
                  View ledger
                </Link>
              </div>
            </div>
          </MotionWrap>
        </div>
      </main>
      <Footer />
    </div>
  );
}
