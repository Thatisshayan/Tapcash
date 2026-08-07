"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { tapCashSteps, tapCashStats } from "@shared/tapcash-content";
import { ShieldCheck, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified offers only",
    description: "Every offer is reviewed before it goes live. No spam, no bait-and-switch.",
  },
  {
    icon: TrendingUp,
    title: "Track everything",
    description: "Live ledger, payout history, and offer status — all visible from your dashboard.",
  },
  {
    icon: Sparkles,
    title: "Real rewards",
    description: "Cash out via PayPal, Bitcoin, bank transfer, or gift cards. No minimum balance tricks.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
            How it works
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Earn cash in three simple steps</h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)] max-w-2xl">
            TapCash connects you with verified offers from trusted providers. Complete them, earn coins, cash out.
          </p>
        </MotionWrap>

        {/* Steps */}
        <div className="grid gap-10 md:grid-cols-3 mt-14">
          {tapCashSteps.map((step, i) => (
            <MotionWrap key={step.id} delay={i * 0.1}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm mb-4"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
              >
                {step.id}
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[rgba(245,243,239,0.5)]">{step.description}</p>
            </MotionWrap>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 pt-14" style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}>
          {tapCashStats.map((stat) => (
            <MotionWrap key={stat.label} delay={0.05}>
              <div className="text-center">
                <p className="text-3xl font-extrabold tabular-nums" style={{ color: GOLD_BRIGHT }}>{stat.value}</p>
                <p className="mt-1 text-xs font-bold text-[rgba(245,243,239,0.5)] uppercase tracking-wider">{stat.label}</p>
              </div>
            </MotionWrap>
          ))}
        </div>

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-3 mt-20 pt-14" style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}>
          {FEATURES.map((feat) => (
            <MotionWrap key={feat.title} delay={0.05}>
              <div className="flex items-start gap-3">
                <feat.icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
                <div>
                  <h4 className="text-sm font-bold">{feat.title}</h4>
                  <p className="mt-1 text-xs text-[rgba(245,243,239,0.4)] leading-relaxed">{feat.description}</p>
                </div>
              </div>
            </MotionWrap>
          ))}
        </div>

        {/* CTA */}
        <MotionWrap className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/games"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-8 py-3.5 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
              style={{ borderColor: "rgba(245,243,239,0.18)" }}
            >
              Browse offers
            </Link>
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
