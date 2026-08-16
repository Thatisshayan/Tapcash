"use client";

import { useAuth } from "@/context/AuthContext";
import { CTAButton, MotionWrap } from "@/components/PremiumUi";
import { tapCashTrustPoints } from "@shared/tapcash-content";

const HAIRLINE = "rgba(245,243,239,0.09)";

export default function TapScorePage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0D] text-[#F5F3EF]">
      <header className="sticky top-0 z-40 bg-[#0A0A0D]/84 backdrop-blur-2xl" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <CTAButton href="/" label="Back to TapCash" variant="secondary" />
        </div>
      </header>

      <main className="pb-20">
        <section className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-12">
            <MotionWrap className="max-w-3xl space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">TapScore™</p>
              <h1 className="text-3xl font-black tracking-tight text-[#F5F3EF] md:text-4xl">
                Know the safest offers before you start.
              </h1>
              <p className="text-base leading-relaxed text-[rgba(245,243,239,0.68)]">
                Rank safer offers faster. Reduce trial and error before you start earning.
              </p>
            </MotionWrap>

            <div className="grid gap-8 sm:grid-cols-3">
              <MotionWrap delay={0.05}>
                <div className="space-y-2 sm:border-r sm:pr-8" style={{ borderColor: HAIRLINE }}>
                  <p className="font-mono text-4xl font-black tabular-nums text-[#F5F3EF]">94%</p>
                  <p className="text-sm text-[rgba(245,243,239,0.45)]">Avg safety score for reviewed offers</p>
                </div>
              </MotionWrap>

              <MotionWrap delay={0.08}>
                <div className="space-y-2 sm:border-r sm:pr-8" style={{ borderColor: HAIRLINE }}>
                  <p className="font-mono text-4xl font-black tabular-nums text-[#F5F3EF]">Under 2m</p>
                  <p className="text-sm text-[rgba(245,243,239,0.45)]">Approval path added to new offers in the last week</p>
                </div>
              </MotionWrap>

              <MotionWrap delay={0.11}>
                <div className="space-y-2">
                  <p className="font-mono text-4xl font-black tabular-nums text-[#F5F3EF]">Low friction</p>
                  <p className="text-sm text-[rgba(245,243,239,0.45)]">No purchase requirement for eligible offers</p>
                </div>
              </MotionWrap>
            </div>

            <div className="grid gap-6 md:grid-cols-3" style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: "2.5rem" }}>
              {tapCashTrustPoints.map((point) => (
                <MotionWrap key={point.title} delay={0.1}>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[#F5F3EF]">{point.title}</p>
                    <p className="text-sm text-[rgba(245,243,239,0.45)]">{point.description}</p>
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
