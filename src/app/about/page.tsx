"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { Shield, Users, MapPin } from "lucide-react";

const VALUES = [
  { icon: Shield, title: "Transparency", description: "Every offer is verified. Every payout is tracked. No hidden fees." },
  { icon: Users, title: "Community First", description: "Built for Canadian earners with real rewards and real support." },
  { icon: MapPin, title: "Proudly Canadian", description: "Operated from Vancouver, BC. We know the local market." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="About us"
            title="Building Canada's most transparent rewards platform"
            description="TapCash connects you with verified offers from trusted partners. Complete them, earn coins, cash out — no tricks."
          />
        </MotionWrap>

        <div className="mt-10 space-y-6 text-sm text-white/60 leading-relaxed">
          <MotionWrap>
            <p>
              TapCash was built to solve a simple problem: most rewards platforms are opaque. You complete an offer, wait,
              and hope for the best. We wanted to change that.
            </p>
          </MotionWrap>
          <MotionWrap delay={0.05}>
            <p>
              Every offer on TapCash goes through CashPath — a transparent pipeline that tracks your progress from start to
              payout. No bait-and-switch. No hidden minimums. Just clear, verified rewards.
            </p>
          </MotionWrap>
          <MotionWrap delay={0.1}>
            <p>
              Based in Vancouver, BC, we're a small team focused on quality over quantity. We review every offer before it
              goes live, and every payout request before funds are released.
            </p>
          </MotionWrap>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-12">
          {VALUES.map((v) => (
            <MotionWrap key={v.title} delay={0.05}>
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-5 text-center">
                <v.icon className="mx-auto w-6 h-6 text-[#18D9FF]" />
                <h3 className="mt-3 text-sm font-bold text-white">{v.title}</h3>
                <p className="mt-1 text-xs text-white/40">{v.description}</p>
              </div>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-12 text-center">
          <CTAButton href="/auth/signup" label="Join TapCash" />
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
