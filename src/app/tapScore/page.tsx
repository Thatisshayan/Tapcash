"use client";

import { useAuth } from "@/context/AuthContext";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { tapCashTrustPoints } from "@shared/tapcash-content";

export default function TapScorePage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050813] text-[#f6f8ff]">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#050813]/84 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <CTAButton href="/" label="Back to TapCash" variant="secondary" />
        </div>
      </header>

      <main className="pb-20">
        <section className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-10">
            <MotionWrap className="space-y-4">
              <PageShell
                eyebrow="TapScore™"
                title="Know the safest offers before you start."
                description="Rank safer offers faster. Reduce trial and error before you start earning."
              />
            </MotionWrap>

            <div className="grid gap-4 md:grid-cols-3">
              <MotionWrap delay={0.05}>
                <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6">
                  <p className="font-display text-4xl font-black text-white">94%</p>
                  <p className="mt-2 text-sm text-zinc-400">Avg safety score for reviewed offers</p>
                </div>
              </MotionWrap>

              <MotionWrap delay={0.08}>
                <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6">
                  <p className="font-display text-4xl font-black text-white">Under 2m</p>
                  <p className="mt-2 text-sm text-zinc-400">Approval path added to new offers in the last week</p>
                </div>
              </MotionWrap>

              <MotionWrap delay={0.11}>
                <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6">
                  <p className="font-display text-4xl font-black text-white">Low friction</p>
                  <p className="mt-2 text-sm text-zinc-400">No purchase requirement for eligible offers</p>
                </div>
              </MotionWrap>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {tapCashTrustPoints.map((point) => (
                <MotionWrap key={point.title} delay={0.1}>
                  <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-sm font-semibold text-white">{point.title}</p>
                    <p className="mt-2 text-sm text-zinc-400">{point.description}</p>
                  </div>
                </MotionWrap>
              ))}
            </div>

            <MotionWrap>
              <CTAButton href={user ? "/rapidoreach" : "/auth/signup"} label={user ? "Open Offerwall" : "Create free account"} />
            </MotionWrap>
          </div>
        </section>
      </main>
    </div>
  );
}
