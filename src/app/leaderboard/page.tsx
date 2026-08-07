"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { usePolling } from "@/hooks/usePolling";
import { tapCashLeaderboardSeed } from "@shared/tapcash-content";
import { Trophy, Medal, Sparkles, Loader2 } from "lucide-react";

const HAIRLINE = "rgba(245,243,239,0.09)";

interface LeaderboardRow {
  rank: number;
  displayName: string;
  coins: number;
}

// Aurora rank accents: gold (1st), violet (2nd), blue (3rd), muted below.
const RANK_COLORS = ["#F0CE97", "#6C5CE0", "#3E6FD9", "rgba(245,243,239,0.45)"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardRow[]>(tapCashLeaderboardSeed);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
        setEntries(data.leaderboard);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  usePolling(refresh, 60000);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0D] text-[#F5F3EF]">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <MotionWrap>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#F0CE97]">
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#F5F3EF] md:text-4xl">Top Earners</h1>
            <p className="text-base leading-relaxed text-[rgba(245,243,239,0.68)]">
              Updated in real-time. Complete offers to climb the ranks.
            </p>
          </div>
        </MotionWrap>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#D9B678]" />
          </div>
        ) : (
          <div className="mt-10">
            {entries.map((entry, i) => (
              <MotionWrap key={entry.rank} delay={i * 0.08}>
                <div
                  className="flex items-center gap-4 py-4"
                  style={{ borderBottom: i < entries.length - 1 ? `1px solid ${HAIRLINE}` : undefined }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-lg font-black"
                    style={{ color: RANK_COLORS[Math.min(i, 3)] }}
                  >
                    {i === 0 ? <Trophy size={22} /> : i < 3 ? <Medal size={20} /> : `#${entry.rank}`}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#F5F3EF]">{entry.displayName}</p>
                    <p className="text-xs text-[rgba(245,243,239,0.45)]">{entry.coins.toLocaleString()} coins earned</p>
                  </div>
                  <p className="font-mono text-sm font-black tabular-nums" style={{ color: RANK_COLORS[Math.min(i, 3)] }}>
                    {entry.coins.toLocaleString()}
                  </p>
                </div>
              </MotionWrap>
            ))}
          </div>
        )}

        <MotionWrap className="mt-14 text-center">
          <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: "2.5rem" }}>
            <Sparkles className="mx-auto h-8 w-8 text-[#D9B678]" />
            <h3 className="mt-3 text-lg font-bold text-[#F5F3EF]">Want to see your name here?</h3>
            <p className="mt-1 text-sm text-[rgba(245,243,239,0.45)]">Complete offers and earn coins to climb the leaderboard.</p>
            <div className="mt-5 inline-flex gap-3">
              <a
                href="/auth/signup"
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#0A0A0D] transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)" }}
              >
                Start earning
              </a>
              <a
                href="/games"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[rgba(245,243,239,0.68)] transition-all hover:text-[#F5F3EF]"
                style={{ border: `1px solid ${HAIRLINE}` }}
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
