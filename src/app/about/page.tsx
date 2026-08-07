"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { Shield, Users, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

const VALUES = [
  { icon: Shield, title: "Transparency", description: "Every offer is verified. Every payout is tracked. No hidden fees." },
  { icon: Users, title: "Community First", description: "Built for Canadian earners with real rewards and real support." },
  { icon: MapPin, title: "Proudly Canadian", description: "Operated from Vancouver, BC. We know the local market." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
            About us
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Building Canada&apos;s most transparent rewards platform
          </h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)]">
            TapCash connects you with verified offers from trusted partners. Complete them, earn coins, cash out &mdash; no tricks.
          </p>
        </MotionWrap>

        <div className="mt-10 space-y-6 text-sm text-[rgba(245,243,239,0.6)] leading-relaxed">
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

        <div className="grid gap-8 sm:grid-cols-3 mt-14">
          {VALUES.map((v) => (
            <MotionWrap key={v.title} delay={0.05}>
              <div className="text-center">
                <v.icon className="mx-auto w-6 h-6" style={{ color: GOLD }} />
                <h3 className="mt-3 text-sm font-bold">{v.title}</h3>
                <p className="mt-1 text-xs text-[rgba(245,243,239,0.4)]">{v.description}</p>
              </div>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-14 text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
          >
            Join TapCash <ArrowRight className="h-4 w-4" />
          </Link>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
