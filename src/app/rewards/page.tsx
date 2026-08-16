"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { tapCashPayoutMethods, formatCadFromCoins } from "@shared/tapcash-content";
import { Sparkles, Wallet, ArrowRight, CreditCard, Bitcoin, Gift, Landmark } from "lucide-react";
import Link from "next/link";

// Aurora palette (packages/tokens/tokens.json v3.0.0). No card/box chrome as
// the default layout language -- methods are spacing + typography + a real
// lucide icon, not emoji (banned per meta.antiPatterns) and not a bordered
// panel grid.
const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

// Real icons, not emoji -- "💸/🏦/₿/🎁" was the previous treatment and both
// the emoji-as-iconography anti-pattern and the missing-real-asset rule in
// tokens.json meta.antiPatterns rule that out.
const PAYOUT_ICONS: Record<string, typeof Wallet> = {
  paypal: Wallet,
  bitcoin: Bitcoin,
  gift: Gift,
  bank: Landmark,
};

export default function RewardsPage() {
  // Interac e-Transfer stays out of the visible grid per the still-active
  // product freeze (docs/governance/DEFERRED_WORK.md / the launch-push
  // decision log) -- filtered at render time, same approach as the cashout
  // page retheme in this same rollout. The underlying shared data entry and
  // any code path that reads it are untouched.
  const methods = tapCashPayoutMethods.filter((m) => m.id !== "interac");

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-14">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
                Rewards catalog
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Ways to cash out</h1>
              <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)]">
                Choose your payout method. Every option is reviewed manually to prevent fraud.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GOLD_BRIGHT }}>
              <Wallet className="w-4 h-4" />
              {methods.length} methods
            </div>
          </div>
        </MotionWrap>

        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {methods.map((method) => {
            const Icon = PAYOUT_ICONS[method.id] || CreditCard;
            return (
              <MotionWrap key={method.id} delay={0.05}>
                <div className="flex flex-col h-full pb-8 border-b" style={{ borderColor: "rgba(245,243,239,0.09)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-7 h-7" style={{ color: GOLD }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[rgba(245,243,239,0.45)]">
                      {method.audience}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{method.label}</h3>
                  <p className="text-sm text-[rgba(245,243,239,0.5)] mb-4">{method.subtitle}</p>
                  <div className="flex items-center gap-4 text-xs text-[rgba(245,243,239,0.4)] mb-5">
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Sparkles size={12} />
                      Min: {formatCadFromCoins(method.minCoins)}
                    </span>
                    <span>{method.eta}</span>
                  </div>
                  <div className="mt-auto">
                    <Link
                      href="/cashout"
                      className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                      style={{ color: GOLD }}
                    >
                      Cash out now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </MotionWrap>
            );
          })}
        </div>

        <MotionWrap className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              href="/cashout"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
            >
              Start cashout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/games"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold border transition-colors hover:text-white"
              style={{ borderColor: "rgba(245,243,239,0.18)", color: "rgba(245,243,239,0.68)" }}
            >
              Earn more coins
            </Link>
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
