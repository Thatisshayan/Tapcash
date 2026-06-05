"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Wallet, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { MotionWrap } from "@/components/PremiumUi";

const steps = [
  { id: "01", title: "Pick", body: "Choose from verified offers with clear difficulty and reward deltas." },
  { id: "02", title: "Complete", body: "Actions are confirmed server-side so balances stay accurate." },
  { id: "03", title: "Cash out", body: "Thresholds and timing are shown before you start the offer." },
];

export default function CashPathPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-[#f6f8ff]">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#050816]/84 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-[#9AA8C6]">← Back to TapCash</Link>
        </div>
      </header>
      <main className="pb-20">
        <section className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-10">
            <MotionWrap delay={0} className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#18D9FF]">TapCash signature mechanic</p>
              <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">CashPath™ Live</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#9AA8C6] md:text-[15px]">
                Verified offers, tracked rewards, clear cashout rules — all viewable before you start.
              </p>
            </MotionWrap>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <MotionWrap key={step.id} delay={0.04}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-6"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#18D9FF]">{step.id}</p>
                    <h3 className="mt-3 text-xl font-black text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#9AA8C6]">{step.body}</p>
                  </motion.div>
                </MotionWrap>
              ))}
            </div>
            <MotionWrap delay={0.1}>
              <Link
                href={user ? "/cashout" : "/auth/signup"}
                className="inline-flex items-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3 text-sm font-black text-[#04101d]"
              >
                {user ? "Review payout methods" : "Create free account"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </MotionWrap>
          </div>
        </section>
      </main>
    </div>
  );
}
