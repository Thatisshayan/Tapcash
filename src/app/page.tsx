"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Globe,
  Layers3,
  Sparkles,
  ShieldCheck,
  Target,
  Wallet,
  Star,
  Clock3,
} from "lucide-react";

const STEPS = [
  {
    title: "1. Create your account",
    description: "Sign up in a few seconds with email or Google. Your session is secure from the start.",
  },
  {
    title: "2. Complete verified offers",
    description: "Browse premium surveys and app offers. Every click is logged and every credit is backend verified.",
  },
  {
    title: "3. Request payout manually",
    description: "Submit a cashout when you are ready. Admin review stays on by default for fraud control.",
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Ledger first",
    text: "Balances are computed from append-only transactions, not a mutable wallet field.",
  },
  {
    icon: BadgeCheck,
    title: "Manual payout control",
    text: "No auto-payouts. Cashouts stay in review until an admin approves them.",
  },
  {
    icon: Activity,
    title: "Fraud visibility",
    text: "IP, device, velocity, and click trails are tracked for every earning event.",
  },
];

const REWARD_PATHS = [
  {
    title: "Surveys",
    value: "Fast completion flow",
    description: "Clean, high-trust survey experiences with visible progress and clear reward values.",
  },
  {
    title: "App offers",
    value: "Higher value actions",
    description: "Try apps, register accounts, or complete partner flows with strong tracking.",
  },
  {
    title: "Missions",
    value: "Daily momentum",
    description: "Small streaks and task loops keep users coming back without overwhelming the UI.",
  },
  {
    title: "Cashout",
    value: "Human review",
    description: "Payout requests are visible, auditable, and kept behind manual approval.",
  },
];

const SAFETY_NOTES = [
  "Server verified auth sessions",
  "Provider callbacks validated before crediting",
  "Offer clicks and postbacks are deduplicated",
  "Fraud flags are visible to admins",
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen tap-shell text-white overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050816]/72 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00e6c3] via-[#3a7bff] to-[#9f7aea] flex items-center justify-center shadow-[0_12px_40px_rgba(58,123,255,0.22)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#050816]" />
            </div>
            <div>
              <span className="block text-xl font-black tracking-tight tap-gradient-text font-display">TapCash</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-semibold">
                Premium rewards ledger
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <a href="#how" className="px-4 py-2 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              How it works
            </a>
            <a href="#offers" className="px-4 py-2 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              Rewards
            </a>
            <a href="#safety" className="px-4 py-2 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              Safety
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full tap-badge text-xs font-black text-zinc-400">
              <Globe className="w-3.5 h-3.5" />
              EN / FR
            </button>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] text-sm font-black shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
              >
                Open dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin" className="px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] text-sm font-black shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                >
                  Join free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16">
          <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.08fr_0.92fr] items-center">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full tap-badge text-[10px] font-black uppercase tracking-[0.28em] text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-[#00e6c3]" />
                Hybrid fintech visual identity
              </span>

              <div className="space-y-4 max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] font-display tap-gradient-text">
                  Earn with a rewards app that feels like a real fintech product.
                </h1>
                <p className="text-zinc-400 text-sm md:text-lg leading-relaxed max-w-2xl">
                  TapCash is a ledger-first rewards platform with a calmer interface, clearer trust signals, and a more premium path from signup to cashout.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] text-sm font-black shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                >
                  {user ? "Go to dashboard" : "Start earning"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full tap-badge text-sm font-bold text-zinc-200 hover:text-white"
                >
                  See how it works
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Ledger-backed balance",
                  "Manual cashout approval",
                  "Fraud-aware infrastructure",
                ].map((item) => (
                  <div key={item} className="tap-card rounded-[1.25rem] px-4 py-4">
                    <div className="flex items-center gap-2 text-[#00e6c3] text-xs font-black uppercase tracking-[0.24em]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-200 font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#00e6c3]/12 via-transparent to-[#3a7bff]/12 blur-3xl" />
              <div className="tap-card rounded-[2rem] p-6 md:p-7 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Product snapshot</p>
                    <h2 className="text-2xl font-black tracking-tight text-white font-display mt-1">Trust first, rewards second</h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00e6c3] to-[#3a7bff] flex items-center justify-center text-[#050816]">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.25rem] bg-white/4 border border-white/6 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Balance model</p>
                    <p className="mt-2 text-xl font-black text-white">Ledger only</p>
                    <p className="mt-1 text-sm text-zinc-400">No direct wallet mutation.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/4 border border-white/6 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Approval flow</p>
                    <p className="mt-2 text-xl font-black text-white">Admin review</p>
                    <p className="mt-1 text-sm text-zinc-400">Manual cashout by default.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/4 border border-white/6 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Security</p>
                    <p className="mt-2 text-xl font-black text-white">Verified callbacks</p>
                    <p className="mt-1 text-sm text-zinc-400">Only trusted provider events credit users.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/4 border border-white/6 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">UX goal</p>
                    <p className="mt-2 text-xl font-black text-white">Premium & calm</p>
                    <p className="mt-1 text-sm text-zinc-400">Less scammy, more credible.</p>
                  </div>
                </div>

                <div className="rounded-[1.25rem] bg-[#0a0f1f] border border-white/6 p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-[#00e6c3] shrink-0">
                    <Clock3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Transparent earning path</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Users see exactly what is happening at each step: sign in, complete offer, wait for callback, then request payout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="px-4 sm:px-6 lg:px-8 py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">How it works</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight font-display text-white">A simple flow that feels trustworthy.</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.title} className="tap-card rounded-[1.5rem] p-6">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-[#00e6c3] mb-4">
                    <Layers3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="offers" className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Rewards catalog</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">Built around offers, missions, and cashout clarity.</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-[0.24em]">
                <Star className="w-4 h-4 text-[#00e6c3]" />
                Reward paths designed to feel premium
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {REWARD_PATHS.map((item) => (
                <div key={item.title} className="tap-card rounded-[1.5rem] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <BarChart3 className="w-4 h-4 text-[#00e6c3]" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#00e6c3] uppercase tracking-[0.22em]">{item.value}</p>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="safety" className="px-4 sm:px-6 lg:px-8 py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Safety and transparency</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">The product should feel calm because the system is controlled.</h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                Every earning event is tied to a verified backend action. That means the UI can be sleek without hiding the actual payout controls.
              </p>

              <div className="space-y-3">
                {SAFETY_NOTES.map((note) => (
                  <div key={note} className="flex items-center gap-3 rounded-2xl tap-badge px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00e6c3]" />
                    <span className="text-sm text-zinc-200 font-medium">{note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {TRUST_POINTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="tap-card rounded-[1.5rem] p-5">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-[#00e6c3]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto tap-card rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Ready to ship</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">A better first impression for TapCash.</h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
                Clean gradients, clearer hierarchy, calmer copy, and stronger trust cues across the top of the funnel.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={user ? "/dashboard" : "/auth/signup"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] text-sm font-black shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
              >
                {user ? "Open dashboard" : "Join TapCash"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/rapidoreach"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full tap-badge text-sm font-bold text-zinc-200 hover:text-white"
              >
                View offerwall
                <Target className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/affiliate" className="hover:text-white transition-colors">Affiliate</Link>
          </div>
          <p className="text-zinc-600">TapCash {new Date().getFullYear()} - ledger-first rewards for a cleaner fintech feel.</p>
        </div>
      </footer>
    </div>
  );
}
