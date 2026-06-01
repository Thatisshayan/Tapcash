"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  accentClass,
  formatCoins,
  formatCadFromCoins,
  tapCashActivity,
  tapCashFaqs,
  tapCashOffers,
  tapCashPayoutMethods,
  tapCashStats,
  tapCashSteps,
  tapCashTrustPoints,
} from "@shared/tapcash-content";

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
  const reduceMotion = useReducedMotion();
  const activity = useLiveActivity();

  const reveal = useMemo(
    () => ({
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [reduceMotion]
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#040913] text-white">
      <div className="border-b border-white/6 bg-[#07111d]">
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

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#040913]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00e6c3] via-[#3a7bff] to-[#f5c842] shadow-[0_18px_50px_rgba(58,123,255,0.2)]">
              <Crown className="h-5 w-5 text-[#04101d]" />
            </div>
            <div>
              <p className="font-display text-xl font-black tracking-tight tap-gradient-text">TapCash</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Premium rewards, sharper mobile flow
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/rapidoreach" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">
              Offerwall
            </Link>
            <Link href="/cashout" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">
              Cashout
            </Link>
            <Link href="/dashboard" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
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

      <main>
        <section className="relative px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.14),transparent_25%),radial-gradient(circle_at_bottom,rgba(245,200,66,0.08),transparent_30%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div {...reveal} className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f5c842]/20 bg-[#f5c842]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.26em] text-[#f5c842]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trust-first rewards experience
              </div>

              <h1 className="max-w-3xl font-display text-[clamp(2.8rem,7vw,5.6rem)] font-black leading-[0.92] tracking-tight">
                <span className="block text-white">Earn faster.</span>
                <span className="block text-[#8cf8e9]">See the ledger.</span>
                <span className="block text-white">Cash out with clarity.</span>
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
                TapCash is shaped like a premium rewards product, not a cluttered dashboard: stronger CTA hierarchy, visible payout logic, and mobile-first scanning.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-7 py-3.5 text-sm font-black text-[#04101d] shadow-[0_18px_50px_rgba(0,230,195,0.18)] transition-transform hover:-translate-y-0.5"
                >
                  {user ? "Go to dashboard" : "Start earning free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/rapidoreach"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/8"
                >
                  Open offerwall
                  <Zap className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "Server-verified actions",
                  "Ledger-backed balance",
                  "Fast payout clarity",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#8cf8e9]" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...reveal}
              transition={{ ...(reveal.transition as object), delay: reduceMotion ? 0 : 0.08 }}
              className="relative"
            >
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
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/6 bg-[#06101a] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            {tapCashStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                {...reveal}
                transition={{ ...(reveal.transition as object), delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-3xl border border-white/8 bg-white/[0.03] p-6"
              >
                <p className="font-display text-4xl font-black text-white">{stat.value}</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">How it works</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white md:text-5xl">
                  Simple path, premium presentation
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
                The design stays focused on what gets users to act: trust, clarity, and the next step.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {tapCashSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  {...reveal}
                  transition={{ ...(reveal.transition as object), delay: reduceMotion ? 0 : index * 0.07 }}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-6"
                >
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8cf8e9]">{step.id}</p>
                  <h3 className="mt-3 text-xl font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...reveal} className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f5c842]">Payout clarity</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Know your cashout path before you earn</h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Reward products perform better when payout options are obvious. TapCash keeps the store, thresholds, and queue visible from the start.
              </p>

              <div className="mt-6 space-y-3">
                {tapCashTrustPoints.map((point) => (
                  <div key={point.title} className="flex gap-3 rounded-2xl border border-white/6 bg-black/15 px-4 py-4">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e6c3]/10 text-[#8cf8e9]">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{point.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal} className="grid gap-4 sm:grid-cols-2">
              {tapCashPayoutMethods.map((method) => {
                const classes = accentClass(method.accent);
                return (
                  <div key={method.id} className={`rounded-[1.75rem] border ${classes.ring} bg-white/[0.03] p-5 ${classes.glow}`}>
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
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">Featured earning paths</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Offer cards with clearer hierarchy</h2>
              </div>
              <Link href="/dashboard" className="hidden items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-white sm:inline-flex">
                Open dashboard
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-2">
              {tapCashOffers.map((offer, index) => {
                const classes = accentClass(offer.accent);
                return (
                  <motion.article
                    key={offer.id}
                    {...reveal}
                    transition={{ ...(reveal.transition as object), delay: reduceMotion ? 0 : index * 0.06 }}
                    className={`rounded-[2rem] border ${classes.ring} bg-white/[0.03] p-6 ${classes.glow}`}
                  >
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
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...reveal} className="rounded-[2rem] border border-white/8 bg-[#06111c] p-6 sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f5c842]">FAQ</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Confidence before sign-up</h2>

              <div className="mt-6 space-y-3">
                {tapCashFaqs.map((faq) => (
                  <details key={faq.question} className="group rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal} className="rounded-[2rem] border border-[#00e6c3]/18 bg-gradient-to-br from-[#071722] via-[#06101a] to-[#0a1625] p-6 sm:p-8">
              <div className="inline-flex rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8cf8e9]">
                Final CTA
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
                Start with a cleaner rewards flow.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">
                The mobile app and the web app now share the same trust language, payout clarity, and content hierarchy.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-7 py-3.5 text-sm font-black text-[#04101d]"
                >
                  {user ? "Open dashboard" : "Create free account"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cashout"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white"
                >
                  Review payouts
                  <Wallet className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
