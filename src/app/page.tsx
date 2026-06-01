"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  accentClass,
  formatCoins,
  formatCadFromCoins,
  tapCashActivity,
  tapCashFaqs,
  tapCashOffers,
  tapCashPayoutMethods,
  tapCashSteps,
  tapCashTrustPoints,
} from "@shared/tapcash-content";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

function useLiveActivity() {
  const [items, setItems] = useState<string[]>([
    "User_***92 earned +500 coins via RapidoReach",
    "User_***15 cashed out $25.00 CAD via PayPal",
    "User_***44 completed Daily Mission +200 coins",
  ]);

  useEffect(() => {
    fetch("/api/activity")
      .then((response) => response.json())
      .then((data: { items?: string[] }) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {});
  }, []);

  return items;
}

export default function LandingPage() {
  const { user } = useAuth();
  const activity = useLiveActivity();

  const proofCards = useMemo(
    () => [
      { label: "Verified completions", value: "3.9M+", detail: "Offer and survey actions tracked end to end." },
      { label: "Active earners", value: "50K+", detail: "Built for repeat usage, not one-time hype." },
      { label: "Total paid out", value: "$2M+", detail: "Clear queueing and settlement visibility." },
      { label: "Avg payout window", value: "24h", detail: "The queue stays visible while payouts process." },
    ],
    []
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#040913] text-white">
      <div className="border-b border-white/6 bg-[#07111d]/95">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2 sm:px-6 lg:px-8">
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#8cf8e9]">
            <Sparkles className="h-3.5 w-3.5" />
            Live proof
          </div>
          <div className="flex min-w-0 gap-8 whitespace-nowrap text-xs font-semibold text-zinc-400">
            {activity.slice(0, 5).map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00e6c3]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#040913]/84 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00e6c3] via-[#3a7bff] to-[#f5c842] shadow-[0_18px_50px_rgba(58,123,255,0.2)] transition-transform group-hover:scale-[1.03]">
              <Crown className="h-5 w-5 text-[#04101d]" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-xl font-black tracking-tight tap-gradient-text">TapCash</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Rewards, payout clarity, trust
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/rapidoreach" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">
              Offerwall
            </Link>
            <Link href="/cashout" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">
              Cashout
            </Link>
            <Link href="/transactions" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">
              Activity
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={user ? "/dashboard" : "/auth/signin"}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/8"
            >
              {user ? "Open dashboard" : "Sign in"}
            </Link>
            <Link
              href={user ? "/dashboard" : "/auth/signup"}
              className="inline-flex items-center gap-2 rounded-full bg-[#00e6c3] px-4 py-2.5 text-sm font-black text-[#04101d] shadow-[0_16px_40px_rgba(0,230,195,0.18)] transition-transform hover:-translate-y-0.5"
            >
              {user ? "Start earning" : "Join free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20">
        <section className="px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <MotionWrap className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f5c842]/20 bg-[#f5c842]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.26em] text-[#f5c842]">
                <ShieldCheck className="h-3.5 w-3.5" />
                High-trust rewards experience
              </div>

              <h1 className="max-w-3xl font-display text-[clamp(2.9rem,7vw,5.9rem)] font-black leading-[0.92] tracking-tight">
                <span className="block text-white">Earn faster.</span>
                <span className="block text-[#8cf8e9]">See the ledger.</span>
                <span className="block text-white">Cash out with clarity.</span>
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
                TapCash now reads like a premium rewards product: strong CTA hierarchy, visible payout logic, clean scanning, and a mobile-first interface language shared across web and app.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton href={user ? "/dashboard" : "/auth/signup"} label={user ? "Go to dashboard" : "Start earning free"} />
                <CTAButton href="/rapidoreach" label="Open offerwall" variant="secondary" />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {["Server-verified actions", "Ledger-backed balance", "Fast payout clarity"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#8cf8e9]" />
                    {item}
                  </span>
                ))}
              </div>
            </MotionWrap>

            <MotionWrap delay={0.08} className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#00e6c3]/10 via-transparent to-[#3a7bff]/15 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(9,16,29,0.96),rgba(5,8,16,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Live snapshot</p>
                    <p className="mt-1 text-lg font-black text-white">Today&apos;s progress</p>
                  </div>
                  <span className="rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8cf8e9]">
                    Active
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Balance</p>
                    <p className="mt-2 font-display text-4xl font-black text-white">{formatCoins(24750)}</p>
                    <p className="mt-1 text-sm text-zinc-400">{formatCadFromCoins(24750)} available on the ledger</p>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Pending</p>
                    <p className="mt-2 font-display text-4xl font-black text-white">1.2K</p>
                    <p className="mt-1 text-sm text-zinc-400">Coins in verification or payout queue</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {tapCashActivity.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.detail}</p>
                      </div>
                      <span className="text-sm font-black text-[#8cf8e9]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MotionWrap>
          </div>
        </section>

        <section className="border-y border-white/6 bg-[#06101a] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            {proofCards.map((stat, index) => (
              <MotionWrap key={stat.label} delay={index * 0.04}>
                <StatCard {...stat} />
              </MotionWrap>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <MotionWrap className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">How it works</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white md:text-5xl">Simple path, premium presentation</h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
                The product feels confident when the next step is obvious. This sequence keeps the trust story and the CTA hierarchy clear.
              </p>
            </MotionWrap>

            <div className="grid gap-4 md:grid-cols-3">
              {tapCashSteps.map((step, index) => (
                <MotionWrap key={step.id} delay={index * 0.05}>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8cf8e9]">{step.id}</p>
                    <h3 className="mt-3 text-xl font-black text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                  </div>
                </MotionWrap>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <MotionWrap>
              <PageShell
                eyebrow="Payout clarity"
                title="Know the cashout path before you earn"
                description="Reward products perform better when payout options, thresholds, and timing are visible from the start."
                kicker={
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Queue status</p>
                    <p className="mt-1 text-sm font-semibold text-white">Clear and reviewable</p>
                  </div>
                }
              >
                <div className="space-y-3">
                  {tapCashTrustPoints.map((point) => (
                    <div key={point.title} className="flex gap-3 rounded-2xl border border-white/6 bg-black/15 px-4 py-4">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e6c3]/10 text-[#8cf8e9]">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{point.title}</p>
                        <p className="mt-1 text-sm text-zinc-400">{point.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PageShell>
            </MotionWrap>

            <div className="grid gap-4 sm:grid-cols-2">
              {tapCashPayoutMethods.map((method, index) => {
                const classes = accentClass(method.accent);
                return (
                  <MotionWrap key={method.id} delay={index * 0.05}>
                    <div className={`rounded-[1.75rem] border ${classes.ring} bg-white/[0.03] p-5 ${classes.glow}`}>
                      <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${classes.badge}`}>
                        {method.audience}
                      </div>
                      <h3 className="mt-4 text-xl font-black text-white">{method.label}</h3>
                      <p className="mt-2 text-sm text-zinc-400">{method.subtitle}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4 text-sm">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Threshold</p>
                          <p className="mt-1 font-semibold text-white">{formatCoins(method.minCoins)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Timing</p>
                          <p className="mt-1 font-semibold text-white">{method.eta}</p>
                        </div>
                      </div>
                    </div>
                  </MotionWrap>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <MotionWrap className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">Featured earning paths</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Offer cards with clearer hierarchy</h2>
              </div>
              <Link href="/dashboard" className="hidden items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-white sm:inline-flex">
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionWrap>

            <div className="grid gap-4 lg:grid-cols-2">
              {tapCashOffers.map((offer, index) => {
                const classes = accentClass(offer.accent);
                return (
                  <MotionWrap key={offer.id} delay={index * 0.05}>
                    <article className={`rounded-[2rem] border ${classes.ring} bg-white/[0.03] p-6 ${classes.glow}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                            {offer.provider} · {offer.category}
                          </div>
                          <h3 className="mt-4 text-2xl font-black tracking-tight text-white">{offer.title}</h3>
                          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{offer.description}</p>
                        </div>
                        <div className={`rounded-2xl border px-4 py-3 text-right ${classes.badge}`}>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-80">Payout</p>
                          <p className="mt-1 text-xl font-black text-white">{offer.payoutCoins.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">
                          {offer.estimateMinutes} min
                        </span>
                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">
                          {formatCoins(offer.payoutCoins)}
                        </span>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-white/6 pt-4">
                        <p className="text-sm font-semibold text-zinc-400">{offer.cta}</p>
                        <ArrowRight className="h-4 w-4 text-[#8cf8e9]" />
                      </div>
                    </article>
                  </MotionWrap>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <MotionWrap>
              <PageShell
                eyebrow="FAQ"
                title="Confidence before sign-up"
                description="The copy answers the most common objections first so the product feels trustworthy, not slippery."
              >
                <div className="space-y-3">
                  {tapCashFaqs.map((faq) => (
                    <details key={faq.question} className="group rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-white">{faq.question}</summary>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </PageShell>
            </MotionWrap>

            <MotionWrap>
              <section className="rounded-[2rem] border border-[#00e6c3]/18 bg-gradient-to-br from-[#071722] via-[#06101a] to-[#0a1625] p-6 sm:p-8">
                <div className="inline-flex rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8cf8e9]">
                  Final CTA
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">Start with a cleaner rewards flow.</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">
                  The web app and the mobile app now share the same trust language, payout clarity, and visual hierarchy.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <CTAButton href={user ? "/dashboard" : "/auth/signup"} label={user ? "Open dashboard" : "Create free account"} />
                  <CTAButton href="/cashout" label="Review payouts" variant="secondary" />
                </div>
              </section>
            </MotionWrap>
          </div>
        </section>
      </main>
    </div>
  );
}
