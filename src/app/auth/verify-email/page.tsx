"use client";

import Link from "next/link";
import { MotionWrap } from "@/components/PremiumUi";
import { useSearchParams } from "next/navigation";
import { CircleGauge, MailCheck, Sparkles } from "lucide-react";
import VerifiedAccessGate from "@/components/VerifiedAccessGate";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const nextHref = searchParams.get("next") || "/dashboard";
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen tap-shell text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,230,195,0.14),_transparent_35%),radial-gradient(circle_at_right,_rgba(58,123,255,0.12),_transparent_35%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-center">
          <section className="space-y-8 max-w-2xl">
            <MotionWrap delay={0}>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00e6c3] to-[#3a7bff] flex items-center justify-center text-[#050816] shadow-[0_12px_40px_rgba(58,123,255,0.22)] group-hover:scale-105 transition-transform">
                  <CircleGauge className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-xl font-black tracking-tight tap-gradient-text font-display">TapCash</p>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-semibold">Ledger-first rewards</p>
                </div>
              </Link>

              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full tap-badge text-[10px] font-black uppercase tracking-[0.28em] text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#00e6c3]" />
                  Verify your inbox
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.92] font-display tap-gradient-text">
                  One more step before you can start earning.
                </h1>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                  We sent a verification link to {email ? <span className="text-zinc-200 font-semibold">{email}</span> : "your email address"}. Tap the link, come back here, and we’ll unlock the dashboard, offerwall, and cashout.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {["Anti-bot gate", "Real inbox verification", "No fake signups"].map((item) => (
                  <div key={item} className="tap-card rounded-[1.25rem] p-4">
                    <div className="flex items-center gap-2 text-[#00e6c3] text-xs font-black uppercase tracking-[0.24em]">
                      <MailCheck className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-200 font-medium">{item}</p>
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
