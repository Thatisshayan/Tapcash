"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { tapCashOffers } from "@shared/tapcash-content";
import { ArrowRight, Clock, Gamepad2, ClipboardList, PlayCircle, Users, Package, Sparkles } from "lucide-react";

// Every category present in the shared offer data must have a filter tab --
// "Games" was previously missing here, making the gaming_bonus offer
// unreachable by filter (only visible under "All"). Fixed while retheming.
const CATEGORIES = ["All", "Survey", "Games", "Video", "Referral"] as const;

const CATEGORY_ICON: Record<string, typeof ClipboardList> = {
  Survey: ClipboardList,
  Games: Gamepad2,
  Video: PlayCircle,
  Referral: Users,
};

// Aurora accent rotation (packages/tokens/tokens.json v3.0.0) -- gold / violet /
// blue only, no green/no neon. Literal hex here are the token primitives
// themselves (gold #D9B678, violet #6C5CE0, blue #3E6FD9), used so alpha
// suffixes can be composed for the icon-chip backgrounds.
const CATEGORY_ACCENT: Record<string, string> = {
  Survey: "#3E6FD9",
  Games: "#6C5CE0",
  Video: "#D9B678",
  Referral: "#6C5CE0",
};

export default function GamesPage() {
  const [active, setActive] = useState<string>("All");

  const filtered = active === "All" ? tapCashOffers : tapCashOffers.filter((o) => o.category === active);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ background: "rgba(217,182,120,0.1)", color: "var(--color-brand-green)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {tapCashOffers.length} offers live
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "var(--color-text-primary)" }}>
            Offers & Surveys
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "var(--color-text-muted)" }}>
            Pick a task, complete it, and earn coins. Every offer is verified before payout.
          </p>
        </MotionWrap>

        {/* Category filters */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition-all"
                style={{
                  background: isActive ? "var(--color-text-primary)" : "rgba(255,255,255,0.05)",
                  color: isActive ? "var(--color-bg-base)" : "rgba(245,243,239,0.55)",
                  border: `1px solid ${isActive ? "transparent" : "rgba(245,243,239,0.09)"}`,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Offer tiles -- no bordered/filled card panel; grouped with spacing,
            soft shadow, and typography per tokens.json antiPatterns. */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((offer) => {
            const Icon = CATEGORY_ICON[offer.category] ?? Package;
            const accent = CATEGORY_ACCENT[offer.category] ?? "#D9B678";
            return (
              <Link key={offer.id} href="/rapidoreach" className="group h-full">
                <div
                  className="flex h-full flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "var(--shadow-card-elevated)", background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ background: `${accent}1f`, color: accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
                      style={{ background: "rgba(217,182,120,0.12)", color: "var(--color-brand-green)" }}
                    >
                      {offer.payoutCoins.toLocaleString()} coins
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {offer.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {offer.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs" style={{ color: "rgba(245,243,239,0.45)" }}>
                    <span>{offer.provider}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {offer.estimateMinutes} min
                    </span>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: accent }}>
                    {offer.cta}
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm" style={{ color: "rgba(245,243,239,0.3)" }}>
            No offers in this category yet. Check back soon.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
