"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Globe,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Wallet,
  ChevronRight,
} from "lucide-react";

const proofStats = [
  { label: "Verified rewards", value: "3.9M+" },
  { label: "Average payout", value: "24h" },
  { label: "Active methods", value: "10+" },
];

const howItWorks = [
  {
    title: "Sign up in seconds",
    description: "Create your TapCash account with email or Google and start with a secure session.",
  },
  {
    title: "Complete verified offers",
    description: "Use the offerwall, surveys, and app tasks that pay into the ledger after verified completion.",
  },
  {
    title: "Request payout manually",
    description: "Cashouts stay under admin review so payouts remain controlled and auditable.",
  },
];

const payoutMethods = [
  "PayPal cash",
  "Interac e-Transfer",
  "Gift cards",
  "Crypto payouts",
];

const featureCards = [
  {
    title: "Offerwall access",
    text: "Jump into surveys and app offers with a cleaner, calmer reward wall.",
  },
  {
    title: "Ledger-backed balance",
    text: "Your balance is computed from transactions, not a mutable wallet field.",
  },
  {
    title: "Referral earnings",
    text: "Invite friends and build passive coins through a transparent referral loop.",
  },
  {
    title: "Manual payout control",
    text: "Cashouts are reviewed by admins so payouts stay safe and measurable.",
  },
];

const faqItems = [
  {
    q: "How do I earn on TapCash?",
    a: "Complete surveys, app offers, promo tasks, and referrals. Every approved completion creates a ledger credit.",
  },
  {
    q: "How do cashouts work?",
    a: "Users request a payout and admins review it manually before any funds are marked paid.",
  },
  {
    q: "Is my balance real-time?",
    a: "Yes. The dashboard balance is derived from ledger transactions, not a client-side counter.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen tap-shell text-white overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050816]/78 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00e6c3] via-[#3a7bff] to-[#9f7aea] flex items-center justify-center shadow-[0_12px_40px_rgba(58,123,255,0.22)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#050816]" />
            </div>
            <div>
              <span className="block text-xl font-black tracking-tight tap-gradient-text font-display">TapCash</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-semibold">
                Rewards with receipts
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <a href="#how" className="px-4 py-2 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              How it works
            </a>
            <a href="#rewards" className="px-4 py-2 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              Rewards
            </a>
            <a href="#faq" className="px-4 py-2 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              FAQ
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
              <div className="flex items-center gap-2 sm:gap-3">
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
        <section className="relative px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-14">
          <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.08fr_0.92fr] items-start">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full tap-badge text-[10px] font-black uppercase tracking-[0.28em] text-zinc-300">
                <BadgeCheck className="w-3.5 h-3.5 text-[#00e6c3]" />
                A cleaner rewards funnel
              </span>

              <div className="space-y-4 max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] font-display tap-gradient-text">
                  Earn rewards through a site that feels like a real product, not a gimmick.
                </h1>
                <p className="text-zinc-400 text-sm md:text-lg leading-relaxed max-w-2xl">
                  TapCash helps users complete verified offers, watch their ledger grow, and cash out with a cleaner fintech-style experience.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] text-sm font-black shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                >
                  {user ? "Go to dashboard" : "Start earning now"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full tap-badge text-sm font-bold text-zinc-200 hover:text-white"
                >
                  See the steps
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="tap-card rounded-[1.25rem] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">{stat.label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-zinc-400">Visible proof up front.</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#00e6c3]/12 via-transparent to-[#3a7bff]/12 blur-3xl" />
              <div className="tap-card rounded-[2rem] p-6 md:p-7 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Live earnings snapshot</p>
                    <h2 className="text-2xl font-black tracking-tight text-white font-display mt-1">Your next reward is one offer away</h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00e6c3] to-[#3a7bff] flex items-center justify-center text-[#050816]">
                    <Coins className="w-5 h-5" />
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
                    <p className="mt-2 text-xl font-black text-white">Manual review</p>
                    <p className="mt-1 text-sm text-zinc-400">Safer payouts by default.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/4 border border-white/6 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Best action</p>
                    <p className="mt-2 text-xl font-black text-white">Open offers</p>
                    <p className="mt-1 text-sm text-zinc-400">That is where value starts.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/4 border border-white/6 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Payout path</p>
                    <p className="mt-2 text-xl font-black text-white">Cashout later</p>
                    <p className="mt-1 text-sm text-zinc-400">Only after credits land.</p>
                  </div>
                </div>

                <div className="rounded-[1.25rem] bg-[#0a0f1f] border border-white/6 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-[#00e6c3] shrink-0">
                      <Clock3 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Fast start</p>
                      <p className="text-xs text-zinc-500">Users should know what to do in the first five seconds.</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    TapCash now uses a direct promise, visible proof, and repeated action blocks to push the right next step without clutter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="px-4 sm:px-6 lg:px-8 py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">How it works</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">Three steps. One clear earning path.</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {howItWorks.map((step) => (
                <div key={step.title} className="tap-card rounded-[1.5rem] p-6">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-[#00e6c3] mb-4">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16" id="rewards">
          <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Rewards and payouts</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">Offer-driven earnings with payout options people understand.</h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                Keep the reward story simple. Users should immediately see what they can earn and how they can redeem it.
              </p>
              <div className="flex flex-wrap gap-3">
                {payoutMethods.map((method) => (
                  <span key={method} className="inline-flex items-center gap-2 rounded-full tap-badge px-4 py-2 text-sm font-bold text-zinc-200">
                    <Target className="w-4 h-4 text-[#00e6c3]" />
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featureCards.map((card) => (
                <div key={card.title} className="tap-card rounded-[1.5rem] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-black text-white">{card.title}</h3>
                    <ShieldCheck className="w-4 h-4 text-[#00e6c3]" />
                  </div>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-3">
            <div className="tap-card rounded-[1.5rem] p-6 md:col-span-2">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Trust strip</span>
                  <h2 className="mt-1 text-2xl font-black text-white font-display">Users trust products that show proof before they ask for action.</h2>
                </div>
                <BadgeCheck className="w-10 h-10 text-[#00e6c3]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Verified postbacks",
                  "Manual payout control",
                  "Ledger-based balance",
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/4 border border-white/6 px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00e6c3] shrink-0" />
                    <p className="text-sm text-zinc-200 font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="tap-card rounded-[1.5rem] p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Quick stat</p>
              <p className="mt-2 text-4xl font-black text-white">1.2M</p>
              <p className="mt-2 text-sm text-zinc-400">Offer completions verified through the TapCash ledger engine.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">The answers users need before they click.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {faqItems.map((item) => (
                <div key={item.q} className="tap-card rounded-[1.5rem] p-6">
                  <h3 className="text-lg font-black text-white">{item.q}</h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto tap-card rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Ready to earn</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">Start with offers, stay for the payout clarity.</h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
                TapCash now has the acquisition structure, proof blocks, and repeated calls to action that a real rewards funnel needs.
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
          <p className="text-zinc-600">TapCash {new Date().getFullYear()} - built to earn with proof.</p>
        </div>
      </footer>
    </div>
  );
}
