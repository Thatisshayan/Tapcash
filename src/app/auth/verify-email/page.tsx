"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { MotionWrap } from "@/components/PremiumUi";
import { useSearchParams } from "next/navigation";
import VerifiedAccessGate from "@/components/VerifiedAccessGate";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const nextHref = searchParams.get("next") || "/dashboard";
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(217,182,120,0.08), transparent 45%), radial-gradient(circle at 85% 30%, rgba(108,92,224,0.06), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="max-w-2xl space-y-8">
            <MotionWrap delay={0}>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-[#0A0A0D] transition-transform group-hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)" }}
                >
                  TC
                </div>
                <div>
                  <p className="text-xl font-black tracking-tight text-[#F5F3EF]">TapCash</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgba(245,243,239,0.45)]">Ledger-first rewards</p>
                </div>
              </Link>

              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">Verify your inbox</p>
                <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-[#F5F3EF] md:text-6xl">
                  One more step before you can start earning.
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-[rgba(245,243,239,0.68)] md:text-base">
                  We sent a verification link to{" "}
                  {email ? <span className="font-semibold text-[#F5F3EF]">{email}</span> : "your email address"}. Tap
                  the link, come back here, and we&rsquo;ll unlock the dashboard, offerwall, and cashout.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
                {["Anti-bot gate", "Real inbox verification", "No fake signups"].map((item) => (
                  <div key={item} className="border-t border-[rgba(245,243,239,0.09)] pt-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D9B678]">Confirmed</p>
                    <p className="mt-2 text-sm font-medium text-[rgba(245,243,239,0.68)]">{item}</p>
                  </div>
                ))}
              </div>
            </MotionWrap>
          </section>

          <section>
            <MotionWrap delay={0.12}>
              <VerifiedAccessGate
                title="Verify your email to unlock TapCash"
                description="This check keeps the platform cleaner, reduces bot signups, and makes sure real users are the ones entering the rewards flow."
                nextHref={nextHref}
                nextLabel="Continue to TapCash"
              />
            </MotionWrap>
          </section>
        </div>
      </div>
    </div>
  );
}
