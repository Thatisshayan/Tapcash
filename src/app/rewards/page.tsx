"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { tapCashPayoutMethods } from "@shared/tapcash-content";
import { formatCadFromCoins } from "@shared/tapcash-content";
import { Sparkles, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

const PAYOUT_ICONS: Record<string, string> = {
  paypal: "💸",
  interac: "🏦",
  bitcoin: "₿",
  gift: "🎁",
};

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="Rewards catalog"
            title="Ways to cash out"
            description="Choose your payout method. Every option is reviewed manually to prevent fraud."
            kicker={
              <div className="inline-flex items-center gap-2 rounded-full border border-[#18D9FF]/20 bg-[#18D9FF]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#18D9FF]">
                <Wallet className="w-3.5 h-3.5" />
                {tapCashPayoutMethods.length} methods
              </div>
            }
          />
        </MotionWrap>

        <div className="grid gap-4 sm:grid-cols-2 mt-10">
          {tapCashPayoutMethods.map((method) => (
            <MotionWrap key={method.id} delay={0.05}>
              <Card variant="elevated" className="h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{PAYOUT_ICONS[method.id] || "💳"}</span>
                  <Badge variant="green">{method.audience}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{method.label}</h3>
                <p className="mt-1 text-sm text-white/50">{method.subtitle}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} />
                    Min: {formatCadFromCoins(method.minCoins)}
                  </span>
                  <span>{method.eta}</span>
                </div>
                <div className="mt-auto pt-4">
                  <Link
                    href="/cashout"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#18D9FF] hover:text-[#31F06F] transition-colors"
                  >
                    Cash out now <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-3">
            <CTAButton href="/cashout" label="Start cashout" />
            <CTAButton href="/games" label="Earn more coins" variant="secondary" />
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
