"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

const FALLBACK_TICKER = [
  "User_***92 earned +500 coins via RapidoReach Survey",
  "User_***15 cashed out $25.00 CAD via PayPal",
  "User_***44 completed Daily Mission +200 coins",
  "User_***78 earned +150 coins from survey",
  "User_***31 hit jackpot spin +500 coins",
  "User_***60 referred a friend +250 coins",
];

const STATS = [
  { value: "3.9M+", label: "Verified Completions" },
  { value: "50K+", label: "Active Earners" },
  { value: "$2M+", label: "Total Paid Out" },
  { value: "24h", label: "Avg Payout Time" },
];

const STEPS = [
  {
    id: "01",
    title: "Create and verify account",
    body: "Signup in under a minute and verify email once to unlock full earning access.",
  },
  {
    id: "02",
    title: "Complete offers and missions",
    body: "Run surveys, complete daily objectives, and stack streak bonuses with anti-fraud protection.",
  },
  {
    id: "03",
    title: "Cash out confidently",
    body: "Withdraw to PayPal, crypto, and gift cards with ledger-backed payout review.",
  },
];

const PAYOUTS = ["PayPal", "Bitcoin", "Litecoin", "Interac", "Steam", "Tim Hortons"];

function useLiveActivity() {
  const [items, setItems] = useState<string[]>(FALLBACK_TICKER);
  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d: { items?: string[] }) => {
        if (Array.isArray(d.items) && d.items.length > 0) setItems(d.items);
      })
      .catch(() => {});
  }, []);
  return items;
}

export default function LandingPage() {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const tickerItems = useLiveActivity();

  const motionProps = useMemo(
    () => ({
      initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-80px" },
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [shouldReduceMotion]
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <div className="relative overflow-hidden border-b border-[#00e6c3]/12 bg-[#07111f] py-2">
        <div className="animate-marquee gap-12 flex">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold text-[#00e6c3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e6c3]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050816]/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00e6c3] to-[#3a7bff]">
              <Sparkles className="h-4 w-4 text-[#050816]" />
            </div>
            <div>
              <p className="font-display text-lg font-black leading-none tap-gradient-text">TapCash</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">Neon Vault Rewards</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="hidden text-sm font-semibold text-zinc-400 transition hover:text-white sm:block">
              Sign In
            </Link>
            <Link
              href={user ? "/dashboard" : "/auth/signup"}
              className="rounded-full bg-[#00e6c3] px-5 py-2.5 text-sm font-black text-[#050816] shadow-[0_10px_32px_rgba(0,230,195,0.24)] transition hover:-translate-y-0.5"
            >
              {user ? "Open Dashboard" : "Join Free"}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="pointer-events-none absolute inset-0 tap-grid opacity-45" />
          <div className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-[#00e6c3]/10 blur-[120px]" />
          <div className="pointer-events-none absolute -right-24 top-20 h-[24rem] w-[24rem] rounded-full bg-[#3a7bff]/12 blur-[110px]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div {...motionProps} className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f5c842]/25 bg-[#f5c842]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5c842]">
                <Crown className="h-3.5 w-3.5" />
                Luxe Security Layer Active
              </div>

              <h1 className="font-display text-[clamp(2.6rem,7vw,5rem)] font-black leading-[0.9] tracking-tight">
                <span className="block text-white">Earn Smarter.</span>
                <span className="block tap-gradient-text">Cash Out Faster.</span>
                <span className="block text-white">Stay Protected.</span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
                TapCash combines high-conversion offer earnings with ledger-first payout integrity. You focus on tasks, we protect the economics.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-7 py-3.5 text-sm font-black text-[#050816] shadow-[0_16px_36px_rgba(0,230,195,0.24)] transition hover:-translate-y-0.5"
                >
                  {user ? "Go to Dashboard" : "Start Earning Free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/rapidoreach"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f5c842]/30 bg-[#f5c842]/8 px-7 py-3.5 text-sm font-bold text-[#f5c842] transition hover:bg-[#f5c842]/14"
                >
                  Explore Offerwall
                  <Zap className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: ShieldCheck, label: "Ledger Verified" },
                  { icon: Wallet, label: "Multi-Method Cashout" },
                  { icon: CheckCircle2, label: "Daily Mission Loop" },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300">
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="tap-card rounded-[1.75rem] border border-white/10 p-6 sm:p-7"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Vault Snapshot</p>
                  <p className="mt-1 text-lg font-black text-white">Today&apos;s Momentum</p>
                </div>
                <span className="rounded-full border border-[#00e6c3]/30 bg-[#00e6c3]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#00e6c3]">
                  Live
                </span>
              </div>

              <div className="mb-5 rounded-2xl border border-[#f5c842]/20 bg-[#f5c842]/8 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5c842]">Premium Pool</p>
                <p className="mt-2 font-display text-4xl font-black text-white">24,750 Coins</p>
                <p className="mt-1 text-sm text-zinc-300">Approx. $24.75 CAD in vault balance</p>
              </div>

              <div className="space-y-2.5">
                {[
                  ["Survey Completion", "+500"],
                  ["Daily Mission", "+200"],
                  ["Referral Bonus", "+140"],
                ].map(([label, amount]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-semibold text-zinc-200">{label}</p>
                    <p className="text-sm font-black text-[#00e6c3]">{amount}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/5 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} {...motionProps} transition={{ ...motionProps.transition, delay: shouldReduceMotion ? 0 : i * 0.06 }} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
                <p className="font-display text-4xl font-black text-white">{stat.value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-[#040b17] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...motionProps} className="mb-10">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#3a7bff]">How It Works</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white md:text-5xl">Engineered for repeat earnings</h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <motion.div key={step.id} {...motionProps} transition={{ ...motionProps.transition, delay: shouldReduceMotion ? 0 : i * 0.08 }} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                  <p className="text-sm font-black text-[#00e6c3]">{step.id}</p>
                  <h3 className="mt-2 text-xl font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.8rem] border border-[#1e355f] bg-gradient-to-br from-[#07101f] to-[#060b16] p-8 sm:p-10">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f5c842]">Cashout Stack</p>
                <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Your payout options stay flexible</h2>
              </div>
              <p className="text-sm text-zinc-400">Manual review, fraud checks, and payout integrity by design</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {PAYOUTS.map((method) => (
                <div key={method} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center text-sm font-bold text-zinc-200">
                  {method}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <motion.div {...motionProps} className="mx-auto max-w-7xl rounded-[2rem] border border-[#00e6c3]/20 bg-gradient-to-r from-[#071422] via-[#06101d] to-[#0b1a2d] px-8 py-14 text-center sm:px-12">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#00e6c3]">Tap into the Neon Vault</p>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">Start in 30 seconds</h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
              No card required. Just verified tasks, clean progression, and reliable payout flow.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={user ? "/dashboard" : "/auth/signup"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00e6c3] px-8 py-3.5 text-sm font-black text-[#050816]"
              >
                {user ? "Open Dashboard" : "Create Free Account"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/rapidoreach"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                Open Offerwall
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
