"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { tapCashSteps, tapCashStats } from "@shared/tapcash-content";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

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
    description: "Cash out via PayPal, Interac, Bitcoin, or gift cards. No minimum balance tricks.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="How it works"
            title="Earn cash in three simple steps"
            description="TapCash connects you with verified offers from trusted providers. Complete them, earn coins, cash out."
          />
        </MotionWrap>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-3 mt-10">
          {tapCashSteps.map((step, i) => (
            <MotionWrap key={step.id} delay={i * 0.1}>
              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-[#31F06F]/20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#31F06F] to-[#18D9FF] flex items-center justify-center font-black text-black text-sm">
                  {step.id}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{step.description}</p>
              </div>
            </MotionWrap>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {tapCashStats.map((stat) => (
            <MotionWrap key={stat.label} delay={0.05}>
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-black text-[#31F06F]">{stat.value}</p>
                <p className="mt-1 text-xs font-bold text-white/50 uppercase tracking-wider">{stat.label}</p>
              </div>
            </MotionWrap>
          ))}
        </div>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3 mt-16">
          {FEATURES.map((feat) => (
            <MotionWrap key={feat.title} delay={0.05}>
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-5 flex items-start gap-3">
                <feat.icon className="w-5 h-5 text-[#18D9FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                  <p className="mt-1 text-xs text-white/40 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            </MotionWrap>
          ))}
        </div>

        {/* CTA */}
        <MotionWrap className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-3">
            <CTAButton href="/auth/signup" label="Get started free" />
            <CTAButton href="/games" label="Browse offers" variant="secondary" />
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
