"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Gamepad2,
  Globe,
  ShieldCheck,
  Sparkles,
  Star,
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
    <div className="min-h-screen bg-[#f6f2e8] text-slate-950 overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1cd3b0] via-[#4c7dff] to-[#8b5cf6] flex items-center justify-center shadow-[0_12px_40px_rgba(76,125,255,0.18)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-xl font-black tracking-tight text-slate-900 font-display">TapCash</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">
                Earn. Track. Cash out.
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <a href="#how" className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors">
              How it works
            </a>
            <a href="#rewards" className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors">
              Rewards
            </a>
            <a href="#faq" className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full border border-black/10 bg-white text-xs font-black text-slate-500">
              <Globe className="w-3.5 h-3.5" />
              EN / FR
            </button>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 text-white text-sm font-black shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
              >
                Open dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/auth/signin" className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 text-white text-sm font-black shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
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
        <section className="px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16">
          <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 bg-white text-[10px] font-black uppercase tracking-[0.28em] text-slate-600">
                <BadgeCheck className="w-3.5 h-3.5 text-[#1cd3b0]" />
                Rewards users actually understand
              </span>

              <div className="space-y-5 max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.92] font-display text-slate-950">
                  Get paid to complete offers, with a funnel that feels familiar and easy.
                </h1>
                <p className="text-slate-600 text-sm md:text-lg leading-relaxed max-w-2xl">
                  TapCash gives you a clean place to complete verified offers, watch your ledger grow, and cash out with clear payout paths and manual review.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-950 text-white text-sm font-black shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
                >
                  {user ? "Go to dashboard" : "Start earning now"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-black/10 bg-white text-sm font-bold text-slate-700 hover:text-slate-950"
                >
                  See the steps
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.4rem] border border-black/8 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">{stat.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">Visible proof up front.</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#1cd3b0]/20 via-transparent to-[#4c7dff]/20 blur-3xl" />
              <div className="rounded-[2rem] bg-white border border-black/8 p-6 md:p-7 space-y-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-black">Rewards snapshot</p>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950 font-display mt-1">One offer starts the flow</h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1cd3b0] to-[#4c7dff] flex items-center justify-center text-white">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.25rem] bg-[#f8fafc] border border-black/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">Balance model</p>
                    <p className="mt-2 text-xl font-black text-slate-950">Ledger only</p>
                    <p className="mt-1 text-sm text-slate-500">No direct wallet mutation.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[#f8fafc] border border-black/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">Approval flow</p>
                    <p className="mt-2 text-xl font-black text-slate-950">Manual review</p>
                    <p className="mt-1 text-sm text-slate-500">Safer payouts by default.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[#f8fafc] border border-black/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">Best action</p>
                    <p className="mt-2 text-xl font-black text-slate-950">Open offers</p>
                    <p className="mt-1 text-sm text-slate-500">That is where value starts.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[#f8fafc] border border-black/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">Payout path</p>
                    <p className="mt-2 text-xl font-black text-slate-950">Cashout later</p>
                    <p className="mt-1 text-sm text-slate-500">Only after credits land.</p>
                  </div>
                </div>

                <div className="rounded-[1.25rem] bg-[#f7f9ff] border border-black/5 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-[#4c7dff] shrink-0">
                      <Clock3 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-950">Fast start</p>
                      <p className="text-xs text-slate-500">Users should know what to do in the first five seconds.</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    This version shifts the product from dark, subtle fintech into a clear conversion site with direct calls to action and visible proof.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="px-4 sm:px-6 lg:px-8 py-16 border-y border-black/5 bg-white/60">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-black">How it works</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-slate-950">Three steps. One clear earning path.</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {howItWorks.map((step) => (
                <div key={step.title} className="rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
                  <div className="w-11 h-11 rounded-2xl bg-slate-950 flex items-center justify-center text-white mb-4">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16" id="rewards">
          <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
            <div className="rounded-[2rem] border border-black/8 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] space-y-4">
              <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-black">Bonus stage</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-slate-950">Fun, cinematic rewards without turning the homepage into a pricing sheet.</h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
                The homepage now leans into a brighter, game-like reward experience while staying simple. No minimum payment clutter, no fake social signup path, and no visual overload.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Arcade feel", value: "Quest cards" },
                  { label: "Clean surface", value: "Less clutter" },
                  { label: "Trust first", value: "Verified flow" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-[#f8fafc] border border-black/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">{item.label}</p>
                    <p className="mt-2 text-lg font-black text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] overflow-hidden border border-black/8 bg-slate-950 p-5 md:p-6 text-white shadow-[0_22px_50px_rgba(15,23,42,0.16)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 font-black">Arcade preview</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight font-display">A cinematic lane for the next mission.</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8cf8e9] flex items-center gap-2">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    Play now
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Offerwall", subtitle: "Tap the next quest", badge: "New" },
                    { title: "Daily spin", subtitle: "Bright bonus round", badge: "Hot" },
                    { title: "Referral run", subtitle: "Bring the crew", badge: "Boost" },
                    { title: "Cashout lane", subtitle: "Manual review path", badge: "Safe" },
                  ].map((card) => (
                    <div key={card.title} className="rounded-[1.5rem] bg-white/[0.06] border border-white/8 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-white">{card.title}</p>
                          <p className="mt-1 text-sm text-slate-300">{card.subtitle}</p>
                        </div>
                        <span className="rounded-full bg-[#00e6c3]/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8cf8e9]">
                          {card.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white border border-black/8 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">Reward brands</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    "/images/logos/timhortons.svg",
                    "/images/logos/shoppers.svg",
                    "/images/logos/cineplex.svg",
                    "/images/logos/canadiantire.svg",
                  ].map((src) => (
                    <div key={src} className="rounded-2xl bg-[#f8fafc] border border-black/5 h-20 flex items-center justify-center p-3">
                      <Image src={src} alt="Reward brand" width={120} height={48} className="max-h-10 w-auto object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16 border-y border-black/5 bg-white/60">
          <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-black/8 bg-white p-6 md:col-span-2 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-black">Trust strip</span>
                  <h2 className="mt-1 text-2xl font-black text-slate-950 font-display">Users trust products that show proof before they ask for action.</h2>
                </div>
                <BadgeCheck className="w-10 h-10 text-[#1cd3b0]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Verified postbacks",
                  "Manual payout control",
                  "Ledger-based balance",
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-[#f8fafc] border border-black/5 px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#1cd3b0] shrink-0" />
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-black">Quick stat</p>
              <p className="mt-2 text-4xl font-black text-slate-950">1.2M</p>
              <p className="mt-2 text-sm text-slate-600">Offer completions verified through the TapCash ledger engine.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-black">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-slate-950">The answers users need before they click.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {faqItems.map((item) => (
                <div key={item.q} className="rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
                  <h3 className="text-lg font-black text-slate-950">{item.q}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto rounded-[2rem] border border-black/8 bg-slate-950 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-slate-400 font-black">Ready to earn</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">Start with offers, stay for the payout clarity.</h2>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl">
                TapCash now has the acquisition structure, proof blocks, and repeated calls to action that a real rewards funnel needs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={user ? "/dashboard" : "/auth/signup"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-950 text-sm font-black shadow-[0_12px_30px_rgba(255,255,255,0.08)]"
              >
                {user ? "Open dashboard" : "Join TapCash"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/rapidoreach"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 bg-white/5 text-sm font-bold text-white hover:bg-white/10"
              >
                View offerwall
                <Gamepad2 className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/8 px-4 sm:px-6 lg:px-8 py-10 bg-white/70">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-slate-900 transition-colors">Cookies</Link>
            <Link href="/affiliate" className="hover:text-slate-900 transition-colors">Affiliate</Link>
          </div>
          <p className="text-slate-400">TapCash {new Date().getFullYear()} - built to earn with proof.</p>
        </div>
      </footer>
    </div>
  );
}
