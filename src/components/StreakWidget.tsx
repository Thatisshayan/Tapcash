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
      <div className="py-4">
        <p className="text-sm text-[rgba(245,243,239,0.45)]">{error}</p>
      </div>
    );
  }

  const streak = data?.streakCount ?? 0;
  const dayInCycle = data?.dayInCycle ?? 0;
  const checkedIn = data?.checkedInToday ?? false;
  const best = data?.bestStreak ?? 0;
  const nextReward = data?.nextReward ?? 10;

  return (
    <div className="py-2" style={{ borderTop: "1px solid rgba(245,243,239,0.09)", borderBottom: "1px solid rgba(245,243,239,0.09)", paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-[#D9B678]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-[#F0CE97]">Daily Streak</h3>
        </div>
        <span className="text-xs font-bold text-[rgba(245,243,239,0.45)]">Best: {best}</span>
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
              className="flex flex-1 flex-col items-center gap-1 rounded-xl p-2 transition-all"
              style={{
                backgroundColor: completed || isToday ? "rgba(217,182,120,0.14)" : isCurrent ? "rgba(240,206,151,0.08)" : "rgba(245,243,239,0.02)",
                boxShadow: isCurrent ? "0 0 12px rgba(240,206,151,0.18)" : undefined,
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-[rgba(245,243,239,0.45)]">{label}</span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black"
                style={
                  completed || isToday
                    ? { backgroundColor: "#F0CE97", color: "#0A0A0D" }
                    : isCurrent
                      ? { border: "2px solid #F0CE97", color: "#F0CE97" }
                      : { border: "1px solid rgba(245,243,239,0.09)", color: "rgba(245,243,239,0.28)" }
                }
              >
                {completed || isToday ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  DAY_REWARDS[i]
                )}
              </div>
              <span className="text-[8px] font-semibold text-[rgba(245,243,239,0.45)]">
                {DAY_REWARDS[i]}c
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-[#F5F3EF]">
            {streak} day streak{streak !== 1 ? "" : ""}
          </p>
          <p className="text-xs text-[rgba(245,243,239,0.45)]">
            {checkedIn
              ? "Checked in today. Come back tomorrow!"
              : `Check in now for +${nextReward} coins`}
          </p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={checkedIn || checking}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all"
          style={
            checkedIn
              ? { cursor: "default", color: "#F0CE97", backgroundColor: "rgba(217,182,120,0.1)" }
              : { background: "linear-gradient(135deg, #F0CE97, #D9B678)", color: "#0A0A0D", boxShadow: "0 8px 24px rgba(217,182,120,0.28)" }
          }
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
