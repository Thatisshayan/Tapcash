"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap, PageShell } from "@/components/PremiumUi";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { tapCashOffers } from "@shared/tapcash-content";
import { Clock, Sparkles } from "lucide-react";

const CATEGORIES = ["All", "Survey", "Games", "Video", "Referral"] as const;

const CATEGORY_ICONS: Record<string, string> = {
  Survey: "📋",
  Games: "🎮",
  Video: "🎬",
  Referral: "👥",
};

export default function GamesPage() {
  const [active, setActive] = useState<string>("All");

  const filtered = active === "All" ? tapCashOffers : tapCashOffers.filter((o) => o.category === active);

  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="Start earning"
            title="Games & Offers"
            description="Pick a task, complete it, and earn coins. Every offer is verified before payout."
            kicker={
              <div className="inline-flex items-center gap-2 rounded-full border border-[#31F06F]/20 bg-[#31F06F]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#31F06F]">
                <Sparkles className="w-3.5 h-3.5" />
                {tapCashOffers.length} offers live
              </div>
            }
          />
        </MotionWrap>

        {/* Category filters */}
        <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`shrink-0 text-xs font-bold uppercase tracking-[0.22em] px-4 py-2 rounded-xl border transition-all ${
                active === cat
                  ? "bg-[#31F06F]/10 border-[#31F06F]/40 text-[#31F06F]"
                  : "bg-white/[0.03] border-white/8 text-white/50 hover:text-white/80 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Offer grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {filtered.map((offer) => (
            <Link key={offer.id} href="/rapidoreach">
              <Card variant="interactive" className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[offer.category] || "📦"}</span>
                  <Badge variant="green" className="shrink-0">
                    {offer.payoutCoins} coins
                  </Badge>
                </div>
                <h3 className="mt-3 text-base font-bold text-white">{offer.title}</h3>
                <p className="mt-1.5 text-sm text-white/50 leading-relaxed flex-1">{offer.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                  <span>{offer.provider}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {offer.estimateMinutes} min
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-white/30">No offers in this category yet. Check back soon.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
