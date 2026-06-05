"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { MotionWrap } from "@/components/PremiumUi";

export default function TapScorePage() {
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
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#18D9FF]">Offer quality</p>
              <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">TapScore™</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#9AA8C6] md:text-[15px]">
                Rank safer offers faster. Reduce trial and error before you start earning.
              </p>
            </MotionWrap>
            <MotionWrap delay={0.05}>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9AA8C6]">Estimated impact</p>
                    <p className="mt-2 font-display text-4xl font-black text-white">Safer path selection</p>
                    <p className="mt-2 text-sm text-[#9AA8C6]">Ranked signals reduce guesswork at the start of the session.</p>
                  </div>
                  <div className="hidden rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-right sm:block">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9AA8C6]">Status</p>
                    <p className="mt-2 text-sm font-black text-[#18D9FF]">Preview available</p>
                  </div>
                </div>
              </div>
            </MotionWrap>
            <MotionWrap delay={0.1}>
              <Link
                href={user ? "/offers" : "/auth/signup"}
                className="inline-flex items-center gap-2 rounded-full bg-[#00e6c3] px-6 py-3 text-sm font-black text-[#04101d]"
              >
                {user ? "Open Offerwall" : "Create free account"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </MotionWrap>
          </div>
        </section>
      </main>
    </div>
  );
}
