"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowRight, X } from "lucide-react";

interface Props {
  userId: string;
  onComplete: () => void;
}

const STEPS = [
  {
    emoji: "🎯",
    badge: "Step 1 of 3",
    title: "Complete tasks,\nearn real coins",
    body: "Browse surveys, try apps, watch videos, and play games. Every completed task credits coins straight to your ledger — no waiting, no tricks.",
    highlights: [
      { icon: "📋", label: "Surveys", sub: "Up to 500 coins each" },
      { icon: "🎮", label: "Games", sub: "Install & hit a milestone" },
      { icon: "📹", label: "Videos", sub: "Quick 30-second clips" },
    ],
    cta: "Next",
    color: "from-[#00e6c3]/20 to-transparent",
    accent: "#00e6c3",
  },
  {
    emoji: "🔥",
    badge: "Step 2 of 3",
    title: "Log in daily,\nmultiply your earnings",
    body: "A 7-day streak doubles your bonus rewards. Miss a day and your streak resets — so keep the flame alive. Day 7 unlocks a free jackpot spin.",
    highlights: [
      { icon: "Day 1", label: "+5 Coins", sub: "Start the chain" },
      { icon: "Day 3", label: "+15 Coins", sub: "Halfway there" },
      { icon: "Day 7", label: "🎰 Free Spin", sub: "Up to 500 coins!" },
    ],
    cta: "Got it",
    color: "from-[#f5c842]/15 to-transparent",
    accent: "#f5c842",
  },
  {
    emoji: "💸",
    badge: "Step 3 of 3",
    title: "Cash out when\nyou're ready",
    body: "Redeem your coins for PayPal cash, Interac e-Transfer, crypto, or gift cards. No subscriptions, no fees — just real rewards.",
    highlights: [
      { icon: "💵", label: "PayPal / Interac", sub: "Direct cash transfers" },
      { icon: "🪙", label: "Crypto", sub: "Bitcoin & Litecoin" },
      { icon: "🎁", label: "Gift Cards", sub: "Tim's, Steam, Roblox & more" },
    ],
    cta: "Let's go!",
    color: "from-[#3a7bff]/15 to-transparent",
    accent: "#3a7bff",
  },
];

export default function OnboardingModal({ userId, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const advance = async () => {
    if (isLast) {
      setClosing(true);
      try {
        await updateDoc(doc(db, "users", userId), {
          onboardingComplete: true,
          updatedAt: serverTimestamp(),
        });
      } catch { /* non-blocking */ }
      setTimeout(onComplete, 300);
    } else {
      setStep(s => s + 1);
    }
  };

  const dismiss = async () => {
    setClosing(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      });
    } catch { /* non-blocking */ }
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {!closing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full sm:max-w-md bg-[#080c1a] border border-white/8 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          >
            {/* Top accent gradient */}
            <div className={`absolute top-0 left-0 right-0 h-56 bg-gradient-to-b ${current.color} pointer-events-none`} />

            {/* Dismiss button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative px-7 pt-8 pb-8 space-y-6">
              {/* Badge + emoji */}
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] font-black uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border"
                  style={{ color: current.accent, borderColor: `${current.accent}33`, background: `${current.accent}12` }}
                >
                  {current.badge}
                </span>
              </div>

              {/* Big emoji */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                className="text-6xl leading-none"
              >
                {current.emoji}
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-black text-white leading-tight tracking-tight whitespace-pre-line">
                {current.title}
              </h2>

              {/* Body */}
              <p className="text-zinc-400 text-sm leading-relaxed">{current.body}</p>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-2.5">
                {current.highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="rounded-2xl border border-white/6 bg-white/[0.03] p-3 text-center space-y-1"
                  >
                    <p className="text-xl leading-none">{h.icon}</p>
                    <p className="text-xs font-black text-white">{h.label}</p>
                    <p className="text-[10px] text-zinc-500 font-medium leading-tight">{h.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? 20 : 6,
                      height: 6,
                      background: i === step ? current.accent : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={advance}
                className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-black shadow-lg transition-all"
                style={{
                  background: `linear-gradient(90deg, ${current.accent}, ${current.accent}cc)`,
                  color: step === 1 ? "#050816" : "#050816",
                  boxShadow: `0 12px 30px ${current.accent}30`,
                }}
              >
                {current.cta}
                {!isLast && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
