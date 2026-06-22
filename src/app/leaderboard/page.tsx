"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap, PageShell } from "@/components/PremiumUi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { tapCashLeaderboardSeed } from "@shared/tapcash-content";
import { Trophy, Medal, Sparkles } from "lucide-react";

const RANK_COLORS = ["text-[#FFC442]", "text-[#C0C0C0]", "text-[#CD7F32]", "text-white/40"];
const RANK_BG = ["bg-[#FFC442]/10", "bg-[#C0C0C0]/10", "bg-[#CD7F32]/10", "bg-white/[0.03]"];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="Competition"
            title="Top Earners"
            description="Updated in real-time. Complete offers to climb the ranks."
            kicker={
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC442]/20 bg-[#FFC442]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#FFC442]">
                <Trophy className="w-3.5 h-3.5" />
                Leaderboard
              </div>
            }
          />
        </MotionWrap>

        <div className="mt-10 space-y-3">
          {tapCashLeaderboardSeed.map((entry, i) => (
            <MotionWrap key={entry.rank} delay={i * 0.08}>
              <Card
                variant={i < 3 ? "elevated" : "default"}
                className={`flex items-center gap-4 ${i < 3 ? RANK_BG[i] : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${RANK_COLORS[i]}`}>
                  {i === 0 ? <Trophy size={22} /> : i < 3 ? <Medal size={20} /> : `#${entry.rank}`}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{entry.displayName}</p>
                  <p className="text-xs text-white/40">{entry.coins.toLocaleString()} coins earned</p>
                </div>
                <Badge variant={i === 0 ? "gold" : i === 1 ? "purple" : "green"}>
                  {entry.coins.toLocaleString()}
                </Badge>
              </Card>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-12 text-center">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-8">
            <Sparkles className="mx-auto w-8 h-8 text-[#31F06F]" />
            <h3 className="mt-3 text-lg font-bold text-white">Want to see your name here?</h3>
            <p className="mt-1 text-sm text-white/50">Complete offers and earn coins to climb the leaderboard.</p>
            <div className="mt-4 inline-flex gap-3">
              <a
                href="/auth/signup"
                className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#31F06F] to-[#18D9FF] text-black hover:opacity-90 transition-opacity"
              >
                Start earning
              </a>
              <a
                href="/games"
                className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
              >
                Browse offers
              </a>
            </div>
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
