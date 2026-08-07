"use client";

import { useAuth } from "@/context/AuthContext";
import { MotionWrap } from "@/components/PremiumUi";
import { tapCashSteps } from "@shared/tapcash-content";
import Link from "next/link";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

export default function CashPathPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0D] text-[#F5F3EF]">
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#0A0A0D]/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors">
            &larr; Back to TapCash
          </Link>
        </div>
      </header>

      <main className="pb-24">
        <section className="relative px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_18%,rgba(108,92,224,0.16),transparent_32%),radial-gradient(circle_at_72%_12%,rgba(217,182,120,0.12),transparent_32%)]" />

          <div className="relative mx-auto max-w-6xl">
            <MotionWrap className="max-w-2xl mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
                TapCash signature mechanic
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">CashPath&trade; Live</h1>
              <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)]">
                Verified offers, tracked rewards, clear cashout rules &mdash; all viewable before you start.
              </p>
            </MotionWrap>

            {/* Flowing line, not a boxed step rail -- same pattern as the
                dashboard/mockup CashPath treatment: a gradient path with
                filled dots, no bordered card per step. */}
            <MotionWrap>
              <div className="relative">
                <svg viewBox="0 0 900 60" className="w-full h-auto hidden md:block" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cpGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={GOLD} />
                      <stop offset="55%" stopColor={GOLD_BRIGHT} />
                      <stop offset="100%" stopColor="rgba(245,243,239,0.2)" />
                    </linearGradient>
                  </defs>
                  <path d="M50,30 C 250,-10 350,70 450,30 C 550,-10 650,70 850,30" fill="none" stroke="url(#cpGrad)" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <div className="grid gap-10 md:grid-cols-3 md:-mt-6">
                  {tapCashSteps.map((step, i) => (
                    <MotionWrap key={step.id} delay={0.05 * i} className="text-center md:text-left">
                      <div
                        className="mx-auto md:mx-0 mb-4 flex h-10 w-10 items-center justify-center rounded-full text-xs font-extrabold"
                        style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408", boxShadow: `0 0 16px ${GOLD}66` }}
                      >
                        {step.id}
                      </div>
                      <h3 className="text-xl font-extrabold mb-2">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-[rgba(245,243,239,0.5)]">{step.description}</p>
                    </MotionWrap>
                  ))}
                </div>
              </div>
            </MotionWrap>

            <MotionWrap className="mt-16">
              <Link
                href={user ? "/cashout" : "/auth/signup"}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
              >
                {user ? "Review payout methods" : "Create free account"}
              </Link>
            </MotionWrap>
          </div>
        </section>
      </main>
    </div>
  );
}
