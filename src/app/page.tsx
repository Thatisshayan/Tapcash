"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Crown, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
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
import { MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

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
  const controls = useAnimation();
  const activity = useLiveActivity();

  const topOffers = useMemo(() => tapCashOffers.slice(0, 3), []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050813] text-white">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#050813]/84 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18d9ff] via-[#7c3dff] to-[#31f06f] shadow-[0_18px_50px_rgba(24,217,255,0.18)] transition-transform group-hover:scale-[1.03]">
              <Crown className="h-5 w-5 text-[#050813]" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-xl font-black tracking-tight text-white">TapCash</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Rewards, payout clarity, trust</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/cashPath" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">CashPath</Link>
            <Link href="/tapScore" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">TapScore</Link>
            <Link href="/rapidoreach" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">Offerwall</Link>
            <Link href="/cashout" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">Cashout</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={user ? "/dashboard" : "/auth/signin"} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/8">{user ? "Open dashboard" : "Sign in"}</Link>
            <Link href={user ? "/dashboard" : "/auth/signup"} className="inline-flex items-center gap-2 rounded-full bg-[#18d9ff] px-4 py-2.5 text-sm font-black text-[#050813] shadow-[0_16px_40px_rgba(24,217,255,0.18)] transition-transform hover:-translate-y-0.5">
              {user ? "Start earning" : "Join free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_14%,rgba(124,61,255,0.22),transparent_28%),radial-gradient(circle_at_72%_10%,rgba(24,217,255,0.18),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <MotionWrap className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-300">
                <ShieldCheck className="h-4 w-4 text-[#18d9ff]" />
                High-trust rewards
              </div>

              <h1 className="max-w-3xl font-display text-[clamp(2.8rem,6.8vw,5.6rem)] font-black leading-[0.96] tracking-tight">
                <span className="block text-white">Play.</span>
                <span className="block">Earn.</span>
                <span className="block bg-gradient-to-r from-[#31f06f] via-[#18d9ff] to-[#7c3dff] bg-clip-text text-transparent">Cash Out.</span>
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
                Complete verified offers. Track every step. Cash out when rewards clear.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={user ? "/dashboard" : "/auth/signup"} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#18d9ff] px-6 py-3.5 text-base font-black text-[#050813] shadow-[0_18px_50px_rgba(24,217,255,0.25)] transition-transform hover:-translate-y-0.5">
                  {user ? "Open dashboard" : "Start My Safest Offer"}
                </Link>
                <Link href="/rapidoreach" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/[0.07]">
                  See How It Works
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {["Server-verified", "Ledger-backed", "Fast payout"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#18d9ff]" />
                    {item}
                  </span>
                ))}
              </div>
            </MotionWrap>

            <MotionWrap delay={0.1} className="relative">
              <div className="relative rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Live snapshot</p>
                    <p className="mt-1 text-lg font-black text-white">Today&apos;s progress</p>
                  </div>
                  <span className="rounded-full border border-[#18d9ff]/20 bg-[#18d9ff]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#18d9ff]">Active</span>
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
                    <div key={item.label + item.value} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.detail}</p>
                      </div>
                      <span className="text-sm font-black text-[#18d9ff]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MotionWrap>
          </div>
        </section>

        <section className="border-y border-white/6 bg-[#07111d] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#18d9ff]">Top Offers</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white md:text-4xl">Start with verifiable offers</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">Curated completions with clear requirements, tracking, and payout targets.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {topOffers.map((offer, index) => {
                const classes = accentClass(offer.accent);
                return (
                  <MotionWrap key={offer.id} delay={index * 0.05}>
                    <article className={`rounded-[2rem] border ${classes.ring} bg-white/[0.03] p-6 ${classes.glow}`}>
                      <div className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {offer.provider} · {offer.category}
                      </div>
                      <h3 className="mt-4 text-2xl font-black tracking-tight text-white">{offer.title}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{offer.description}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">{offer.estimateMinutes} min</span>
                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">{formatCoins(offer.payoutCoins)}</span>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-white/6 pt-4">
                        <Link href="/rapidoreach" className="text-sm font-semibold text-zinc-300 transition-colors hover:text-white">Start Offer</Link>
                        <ArrowRight className="h-4 w-4 text-[#18d9ff]" />
                      </div>
                    </article>
                  </MotionWrap>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 pt-16 sm:px-6 lg:px-8" id="cashpath">
          <div className="mx-auto max-w-7xl">
            <MotionWrap className="mb-10">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#18d9ff]">CashPath™ Live</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white md:text-4xl">Track every step. See your reward hit your account.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">A single verification-backed sequence makes the experience easier to trust.</p>
            </MotionWrap>

            <div className="grid gap-4 md:grid-cols-3">
              {tapCashSteps.map((step, index) => (
                <MotionWrap key={step.id} delay={index * 0.06}>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-[#18d9ff]">{step.id}</p>
                    <h3 className="mt-3 text-xl font-black text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                  </div>
                </MotionWrap>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/6 bg-[#050b13] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <MotionWrap>
                <PageShell eyebrow="See It In Action" title="Offer details, TapScore, and cashout in one clean app flow." description="The mobile shell uses the same ledger, CTA, and payout logic as the web app.">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Balance</p>
                      <p className="mt-2 font-display text-2xl font-black text-white">$12.50</p>
                      <p className="mt-1 text-xs text-zinc-400">CashPath view</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Offer score</p>
                      <p className="mt-2 font-display text-2xl font-black text-white">94%</p>
                      <p className="mt-1 text-xs text-zinc-400">TapScore preview</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Cash Out</p>
                      <p className="mt-2 font-display text-2xl font-black text-white">PayPal</p>
                      <p className="mt-1 text-xs text-zinc-400">Fastest exit option</p>
                    </div>
                  </div>
                </PageShell>
              </MotionWrap>

              <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-6 sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#18d9ff]">TapScore™</p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Know the safest offers before you start.</h3>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  <li>Fast payout history</li>
                  <li>High tracking completion rate</li>
                  <li>No purchase required</li>
                  <li>Easy to complete</li>
                </ul>
                <Link href="/tapScore" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#7c3dff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(124,61,255,0.25)] transition hover:-translate-y-0.5">
                  Open TapScore <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tapCashTrustPoints.map((point) => (
                <div key={point.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#18d9ff]/10 text-[#18d9ff]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{point.title}</p>
                  <p className="mt-2 text-sm text-zinc-400">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-18 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <MotionWrap>
                <PageShell eyebrow="Payout clarity" title="Know the cashout path before you earn" description="Reward products perform better when payout options, thresholds, and timing are visible from the start.">
                  <div className="space-y-3">
                    {[
                      "Server-verified actions before ledger moves",
                      "Clear queueing and settlement visibility",
                      "PayPal, Interac, Bitcoin, and gift card options",
                    ].map((text) => (
                      <div key={text} className="flex gap-3 rounded-2xl border border-white/6 bg-black/15 px-4 py-4">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#18d9ff]/10 text-[#18d9ff]">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-white">{text}</p>
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
          </div>
        </section>

        <section className="border-y border-white/6 bg-[#050b13] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Verified completions", value: "3.9M+" },
                { label: "Active earners", value: "50K+" },
                { label: "Total paid out", value: "$2M+" },
                { label: "Avg payout window", value: "24h" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-center">
                  <p className="font-display text-4xl font-black text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <MotionWrap>
                <PageShell eyebrow="Confidence before sign-up" title="Common questions, direct answers" description="Honest copy, no inflated stats.">
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

              <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-6 sm:p-8">
                <div className="inline-flex rounded-full border border-[#7c3dff]/20 bg-[#7c3dff]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#a888ff]">Final CTA</div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">Start with a cleaner rewards flow.</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">The web app and the mobile app now share the same trust language, payout clarity, and visual hierarchy.</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href={user ? "/dashboard" : "/auth/signup"} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#18d9ff] via-[#7c3dff] to-[#31f06f] px-6 py-3.5 text-base font-black text-white shadow-[0_18px_50px_rgba(124,61,255,0.22)] transition hover:-translate-y-0.5">
                    {user ? "Open dashboard" : "Create free account"}
                  </Link>
                  <Link href="/cashout" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/[0.07]">Review payouts</Link>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
