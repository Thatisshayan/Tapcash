"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Check, Loader2 } from "lucide-react";

interface StreakData {
  streakCount: number;
  bestStreak: number;
  checkedInToday: boolean;
  streakActive: boolean;
  nextReward: number;
  dayInCycle: number;
}

const DAY_LABELS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
const DAY_REWARDS = [10, 15, 20, 25, 30, 40, 50];

export default function StreakWidget() {
  const [data, setData] = useState<StreakData | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStreak() {
    try {
      const res = await fetch("/api/streak");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      setError("Could not load streak data");
    }
  }

  useEffect(() => {
    fetchStreak();
  }, []);

  async function handleCheckIn() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/streak", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await fetchStreak();
        } else if (json.checkedInToday) {
          setError("Already checked in today!");
        }
      } else {
        const json = await res.json();
        setError(json.error || "Check-in failed");
      }
    } catch {
      setError("Network error during check-in");
    } finally {
      setChecking(false);
    }
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
        <p className="text-sm text-zinc-400">{error}</p>
      </div>
    );
  }

  const streak = data?.streakCount ?? 0;
  const dayInCycle = data?.dayInCycle ?? 0;
  const checkedIn = data?.checkedInToday ?? false;
  const best = data?.bestStreak ?? 0;
  const nextReward = data?.nextReward ?? 10;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.04] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">Daily Streak</h3>
        </div>
        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
          Best: {best}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {DAY_LABELS.map((label, i) => {
          const dayNum = i + 1;
          const completed = dayNum <= dayInCycle;
          const isCurrent = dayNum === dayInCycle + 1 && !checkedIn;
          const isToday = dayNum === dayInCycle && checkedIn;

          return (
            <motion.div
              key={label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
                completed || isToday
                  ? "border-amber-500/40 bg-amber-500/20"
                  : isCurrent
                    ? "border-amber-400/60 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                    : "border-white/6 bg-white/[0.02]"
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                  completed || isToday
                    ? "bg-amber-400 text-[#0a0a0a]"
                    : isCurrent
                      ? "border-2 border-amber-400 text-amber-400"
                      : "border border-white/10 text-zinc-600"
                }`}
              >
                {completed || isToday ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  DAY_REWARDS[i]
                )}
              </div>
              <span className="text-[8px] font-semibold text-zinc-500">
                {DAY_REWARDS[i]}c
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-white">
            {streak} day streak{streak !== 1 ? "" : ""}
          </p>
          <p className="text-xs text-zinc-400">
            {checkedIn
              ? "Checked in today. Come back tomorrow!"
              : `Check in now for +${nextReward} coins`}
          </p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={checkedIn || checking}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all ${
            checkedIn
              ? "cursor-default border border-amber-500/20 bg-amber-500/10 text-amber-400"
              : "bg-amber-400 text-[#0a0a0a] shadow-[0_8px_24px_rgba(251,191,36,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(251,191,36,0.35)]"
          }`}
        >
          {checking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : checkedIn ? (
            <Check className="h-4 w-4" />
          ) : (
            <Flame className="h-4 w-4" />
          )}
          {checkedIn ? "Done" : "Check In"}
        </button>
      </div>
    </div>
  );
}
