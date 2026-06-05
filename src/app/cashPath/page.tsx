"use client";

import { useAuth } from "@/context/AuthContext";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { tapCashSteps } from "@shared/tapcash-content";

export default function CashPathPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050813] text-[#f6f8ff]">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#050813]/84 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <CTAButton href="/" label="Back to TapCash" variant="secondary" />
        </div>
      </header>

      <main className="pb-20">
        <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(124,61,255,0.22),transparent_28%),radial-gradient(circle_at_72%_12%,rgba(0,230,195,0.18),transparent_28%)]" />

          <div className="relative mx-auto max-w-7xl space-y-10">
            <MotionWrap className="space-y-4">
              <PageShell
                eyebrow="TapCash signature mechanic"
                title="CashPath™ Live"
                description="Verified offers, tracked rewards, clear cashout rules — all viewable before you start."
              />
            </MotionWrap>

            <div className="grid gap-4 md:grid-cols-3">
              {tapCashSteps.map((step) => (
                <MotionWrap key={step.id} delay={0.05}>
                  <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 transition-transform hover:-translate-y-1">
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-[#18d9ff]">{step.id}</p>
                    <h3 className="mt-3 text-xl font-black text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                  </div>
                </MotionWrap>
              ))}
            </div>

            <MotionWrap>
              <CTAButton href={user ? "/cashout" : "/auth/signup"} label={user ? "Review payout methods" : "Create free account"} />
            </MotionWrap>
          </div>
        </section>
      </main>
    </div>
  );
}
