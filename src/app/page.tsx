"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  Flame,
  Gamepad2,
  Globe,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

// ─── Static fallback data ─────────────────────────────────────────────────────

const FALLBACK_TICKER = [
  "User_***92 earned +500 coins via RapidoReach Survey",
  "User_***15 cashed out $25.00 CAD via PayPal",
  "User_***44 completed Daily Mission +200 coins",
  "User_***78 earned +150 coins from survey",
  "User_***31 hit jackpot spin +500 coins",
  "User_***60 referred a friend +250 coins",
  "User_***83 cashed out $10 via Bitcoin",
  "User_***19 earned +800 coins via offerwall",
];

function useLiveActivity() {
  const [items, setItems] = useState<string[]>(FALLBACK_TICKER);
  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => { if (d.items?.length) setItems(d.items); })
      .catch(() => {});
  }, []);
  return items;
}

const earnMethods = [
  {
    Icon: BarChart3,
    title: "Surveys",
    sub: "Via RapidoReach",
    desc: "Answer targeted brand questions from leading companies. High payout per completion.",
    payout: "50–2,000 coins",
    badge: "Most Popular",
    accent: "#3a7bff",
    href: "/auth/signup",
    cta: "Start Surveys",
  },
  {
    Icon: Zap,
    title: "RapidoReach",
    sub: "Offerwall",
    desc: "Premium offerwall partner with unlimited daily survey slots and guaranteed payouts.",
    payout: "100–5,000 coins",
    badge: "Featured",
    accent: "#00e6c3",
    href: "/rapidoreach",
    cta: "Open Offerwall",
    featured: true,
  },
  {
    Icon: Trophy,
    title: "Daily Missions",
    sub: "Battle Pass",
    desc: "Complete daily tasks, unlock bonus coin caches. Resets at midnight UTC.",
    payout: "10–200 coins",
    badge: "Daily Reset",
    accent: "#8b5cf6",
    href: "/dashboard",
    cta: "View Missions",
  },
  {
    Icon: Users,
    title: "Refer Friends",
    sub: "20% Forever",
    desc: "Earn 20% passive commission on every coin your referrals earn. No cap, ever.",
    payout: "20% passive",
    badge: "Unlimited",
    accent: "#f59e0b",
    href: "/referrals",
    cta: "Get Link",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your free account",
    desc: "Sign up with email or Google in 30 seconds. Verify your email to unlock the full offerwall.",
    color: "#00e6c3",
  },
  {
    n: "02",
    title: "Complete offers, surveys & missions",
    desc: "Use the RapidoReach offerwall, finish daily missions, spin the wheel, and refer friends.",
    color: "#3a7bff",
  },
  {
    n: "03",
    title: "Cash out your way",
    desc: "Request PayPal, Bitcoin, Interac e-Transfer, or Canadian gift cards. Manual review protects everyone.",
    color: "#f59e0b",
  },
];

const cashoutMethods = [
  { name: "PayPal", detail: "Instant up to $1K" },
  { name: "Bitcoin", detail: "Any amount" },
  { name: "Litecoin", detail: "Low fees" },
  { name: "Amazon", detail: "Gift cards" },
  { name: "Steam", detail: "Games & cards" },
  { name: "Tim Hortons", detail: "Canadian" },
  { name: "Shoppers", detail: "Gift cards" },
  { name: "Interac", detail: "e-Transfer CA" },
];

const stats = [
  { value: "3.9M+", label: "Verified Completions", color: "#00e6c3" },
  { value: "50K+", label: "Active Earners", color: "#3a7bff" },
  { value: "$2M+", label: "Total Paid Out", color: "#f59e0b" },
  { value: "24h", label: "Avg. Payout Time", color: "#8b5cf6" },
];

const leaderboard = [
  { rank: 1, name: "Alpha_Earner", coins: 42800, tier: "Gold VIP" },
  { rank: 2, name: "CryptoCoiner", coins: 28900, tier: "Silver VIP" },
  { rank: 3, name: "TapTastic", coins: 19450, tier: "Bronze VIP" },
  { rank: 4, name: "SurveyQueen", coins: 14200, tier: "Bronze VIP" },
  { rank: 5, name: "LootLord", coins: 11050, tier: "Bronze VIP" },
];

const faqItems = [
  {
    q: "Is TapCash free to join?",
    a: "Yes. No credit card, no hidden fees. Create an account and start earning immediately.",
  },
  {
    q: "How do I earn coins?",
    a: "Complete RapidoReach surveys, finish daily missions, vote in polls, spin the daily wheel, or refer friends for 20% passive income.",
  },
  {
    q: "How does cashout work?",
    a: "Request a payout from your dashboard. Our admin team reviews within 24h, then processes the transfer to your chosen method.",
  },
  {
    q: "Is my balance real-time?",
    a: "Yes. Every coin is tracked by a ledger engine — not a client counter. Your balance reflects only verified, approved completions.",
  },
  {
    q: "What countries can join?",
    a: "TapCash is open globally, but optimized for Canada with Interac e-Transfer and Canadian gift cards.",
  },
  {
    q: "How does the referral system work?",
    a: "Share your link. When someone signs up and earns, you automatically receive 20% of their coins — forever, with no cap.",
  },
];

const streakDays = [
  { day: 1, reward: "+5", state: "done" as const },
  { day: 2, reward: "+10", state: "done" as const },
  { day: 3, reward: "+15", state: "done" as const },
  { day: 4, reward: "+20", state: "done" as const },
  { day: 5, reward: "+25", state: "active" as const },
  { day: 6, reward: "+50", state: "locked" as const },
  { day: 7, reward: "SPIN", state: "jackpot" as const },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth();
  const tickerItems = useLiveActivity();

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">

      {/* ── TOP ANNOUNCEMENT STRIP ── */}
      <div className="relative overflow-hidden bg-[#001e16] border-b border-[#00e6c3]/10 py-2">
        <div className="animate-marquee gap-12 flex">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-[11px] font-semibold text-[#00e6c3] whitespace-nowrap tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e6c3] shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050816]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#00e6c3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-[#050816]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-black tracking-tight leading-none tap-gradient-text font-display">TapCash</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-semibold mt-0.5">Ledger-first rewards</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {(["#earn", "#how", "#cashout", "#faq"] as const).map((href) => {
              const labels: Record<string, string> = { "#earn": "Earn", "#how": "How it Works", "#cashout": "Cashout", "#faq": "FAQ" };
              return (
                <a key={href} href={href} className="px-3 py-2 rounded-full text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                  {labels[href]}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 tap-badge rounded-full text-xs font-bold text-zinc-500 hover:text-white transition-all">
              <Globe className="w-3 h-3" /> EN / FR
            </button>
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00e6c3] text-[#050816] text-sm font-black hover:opacity-90 transition">
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="hidden sm:block px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="px-5 py-2.5 rounded-full bg-[#00e6c3] text-[#050816] text-sm font-black shadow-[0_0_24px_rgba(0,230,195,0.22)] hover:opacity-90 transition">
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>

        {/* ═══════════════════════════════════════ */}
        {/* HERO                                    */}
        {/* ═══════════════════════════════════════ */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-14 overflow-hidden">
          {/* Ambient glow blobs */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#00e6c3]/[0.05] blur-[130px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3a7bff]/[0.07] blur-[110px] pointer-events-none" />
          {/* Grid */}
          <div className="absolute inset-0 tap-grid pointer-events-none opacity-50" />

          <div className="relative max-w-7xl mx-auto grid gap-14 lg:grid-cols-2 items-start">

            {/* ── Left: Headline + CTA ── */}
            <div className="space-y-7 pt-4">

              {/* Verified badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/[0.06]">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e6c3] opacity-50" />
                  <span className="relative rounded-full w-2 h-2 bg-[#00e6c3]" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00e6c3]">Verified Reward Platform</span>
              </div>

              {/* Headline */}
              <h1 className="font-display font-black text-[clamp(3rem,7vw,5rem)] tracking-tight leading-[0.92]">
                <span className="block text-white">Earn Real Cash</span>
                <span className="block tap-gradient-text">Every Single</span>
                <span className="block text-white">Day.</span>
              </h1>

              {/* Subtext */}
              <p className="text-zinc-400 text-lg leading-relaxed max-w-lg">
                Complete surveys, do app tasks, watch videos — then cash out via PayPal, Bitcoin, or Canadian gift cards. Real earnings, verified ledger, manual payout control.
              </p>

              {/* Live counter chip */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/[0.05]">
                <span className="relative flex w-2.5 h-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e6c3] opacity-60" />
                  <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-[#00e6c3]" />
                </span>
                <span className="text-sm font-bold text-[#00e6c3]">1,247 coins earned in the last 60 seconds</span>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#00e6c3] text-[#050816] font-black text-sm shadow-[0_0_30px_rgba(0,230,195,0.25)] hover:shadow-[0_0_44px_rgba(0,230,195,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  {user ? "Open Dashboard" : "Start Earning Free"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#earn"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/[0.09] bg-white/[0.03] text-sm font-semibold text-zinc-300 hover:bg-white/[0.07] hover:text-white transition-all"
                >
                  See how you earn
                </a>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { Icon: ShieldCheck, label: "3.9M+ Completions" },
                  { Icon: Wallet, label: "24h Payouts" },
                  { Icon: CheckCircle2, label: "10+ Cash Methods" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] text-xs font-semibold text-zinc-400">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Dashboard card preview ── */}
            <div className="relative animate-float">
              <div className="absolute inset-x-8 inset-y-4 rounded-[2rem] bg-[#3a7bff]/[0.1] blur-3xl -z-10" />
              <div className="rounded-[1.75rem] border border-[#1e2d4f] bg-[#07111e] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.55)]">

                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d4f] bg-[#0d1a2e]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#00e6c3]/10 border border-[#00e6c3]/20 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-[#00e6c3]" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Live Wallet</p>
                      <p className="text-sm font-black text-white leading-tight">Your Earnings Dashboard</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#001a14] border border-[#00e6c3]/20 text-[10px] font-black text-[#00e6c3] uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e6c3] animate-pulse" />
                    Live
                  </span>
                </div>

                {/* Balance */}
                <div className="px-6 pt-5 pb-4">
                  <p className="font-display font-black text-[3.2rem] text-[#00e6c3] tracking-tight leading-none">24,750</p>
                  <p className="text-xs text-zinc-500 font-semibold tracking-wider mt-1.5 uppercase">Coins = $24.75 CAD</p>
                  <span className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-[#2a1a00] border border-[#f59e0b]/25 text-[10px] font-black text-[#f59e0b]">
                    <Crown className="w-3 h-3" /> Gold VIP
                  </span>
                </div>

                <div className="mx-6 border-t border-[#1e2d4f]" />

                {/* Activity list */}
                <div className="px-6 py-4 space-y-2">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-3">Recent Activity</p>
                  {[
                    { label: "RapidoReach Survey Completed", time: "2 min ago", amount: "+500", color: "#00e6c3" },
                    { label: "Daily Mission Complete", time: "1 hr ago", amount: "+200", color: "#3a7bff" },
                    { label: "Daily Spin Wheel — Lucky!", time: "3 hr ago", amount: "+100", color: "#f59e0b" },
                  ].map((tx) => (
                    <div key={tx.label} className="flex items-center justify-between p-3 rounded-xl bg-[#0a1628]/60 hover:bg-[#0a1628] transition">
                      <div>
                        <p className="text-[13px] font-semibold text-zinc-200">{tx.label}</p>
                        <p className="text-xs text-zinc-600">{tx.time}</p>
                      </div>
                      <span className="text-[13px] font-black shrink-0 ml-4" style={{ color: tx.color }}>{tx.amount}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="px-6 pb-5 pt-1 grid grid-cols-2 gap-3">
                  <Link
                    href={user ? "/rapidoreach" : "/auth/signup"}
                    className="flex items-center justify-center py-3 rounded-2xl bg-[#00e6c3] text-[#050816] text-sm font-black hover:opacity-90 transition"
                  >
                    Open Offerwall
                  </Link>
                  <Link
                    href="/cashout"
                    className="flex items-center justify-center py-3 rounded-2xl border border-[#1e2d4f] bg-[#0d1628] text-sm font-semibold text-zinc-400 hover:text-white hover:border-white/10 transition"
                  >
                    Request Cashout
                  </Link>
                </div>

                {/* Streak progress */}
                <div className="px-6 pb-5">
                  <div className="rounded-xl bg-[#0a1628] border border-[#1e2d4f] p-3.5">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">7-Day Streak</p>
                      <span className="text-[10px] font-black text-[#f59e0b] flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Day 5/7
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {streakDays.map((d) => (
                        <div key={d.day} className="text-center">
                          <div className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-black ${
                            d.state === "done"    ? "bg-[#00e6c3]/15 text-[#00e6c3]" :
                            d.state === "active"  ? "bg-[#00e6c3] text-[#050816]" :
                            d.state === "jackpot" ? "bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-[#f59e0b]" :
                            "bg-[#1a2040] text-zinc-700"
                          }`}>
                            {d.state === "done" ? "✓" : d.reward}
                          </div>
                          <p className="text-[7px] text-zinc-700 mt-0.5 font-medium">D{d.day}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LIVE ACTIVITY TICKER ── */}
        <div className="relative overflow-hidden border-y border-[#00e6c3]/[0.12] bg-[#001a14]/60 py-3">
          <div className="animate-marquee gap-10 flex">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2.5 text-xs font-semibold text-zinc-400 whitespace-nowrap">
                <span className="text-[#00e6c3] text-sm">●</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* HOW YOU EARN                            */}
        {/* ═══════════════════════════════════════ */}
        <section id="earn" className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#3a7bff] mb-3">How You Earn</p>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white">
                Four ways to grow<br className="hidden sm:block" /> your balance
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {earnMethods.map((m) => (
                <div
                  key={m.title}
                  className={`group relative rounded-[1.5rem] border p-6 transition-all duration-300 hover:-translate-y-1 ${
                    m.featured
                      ? "border-[#00e6c3]/25 bg-[#00e6c3]/[0.04] hover:border-[#00e6c3]/50 shadow-[0_0_40px_rgba(0,230,195,0.06)]"
                      : "border-[#1e2d4f] bg-[#07111e] hover:border-white/[0.09]"
                  }`}
                >
                  {m.featured && (
                    <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#00e6c3] text-[#050816] text-[10px] font-black uppercase tracking-[0.15em]">
                      Featured
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border"
                      style={{ backgroundColor: `${m.accent}15`, borderColor: `${m.accent}30`, color: m.accent }}
                    >
                      <m.Icon className="w-5 h-5" />
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] border"
                      style={{
                        color: m.featured ? "#050816" : m.accent,
                        backgroundColor: m.featured ? m.accent : `${m.accent}15`,
                        borderColor: m.featured ? "transparent" : `${m.accent}28`,
                      }}
                    >
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-white">{m.title}</h3>
                  <p className="text-xs font-bold mt-0.5" style={{ color: m.accent }}>{m.sub}</p>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{m.desc}</p>
                  <p className="mt-2 text-xs font-bold text-zinc-600">
                    Payout: <span style={{ color: m.accent }}>{m.payout}</span>
                  </p>

                  <Link
                    href={m.href}
                    className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all hover:opacity-90"
                    style={{
                      color: m.featured ? "#050816" : m.accent,
                      backgroundColor: m.featured ? m.accent : `${m.accent}10`,
                      borderColor: m.featured ? "transparent" : `${m.accent}22`,
                    }}
                  >
                    {m.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* HOW IT WORKS                            */}
        {/* ═══════════════════════════════════════ */}
        <section id="how" className="px-4 sm:px-6 lg:px-8 py-20 border-y border-[#1e2d4f] bg-[#040c18]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#00e6c3] mb-3">Three Steps</p>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white">Start in 30 seconds</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="group relative rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] p-7 hover:border-white/[0.09] transition-all">
                  <p
                    className="font-display font-black text-8xl leading-none select-none mb-4"
                    style={{ color: `${step.color}12` }}
                  >
                    {step.n}
                  </p>
                  <h3 className="font-display font-black text-xl text-white">{step.title}</h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                  <div className="mt-6 h-0.5 rounded-full bg-[#1e2d4f]">
                    <div
                      className="h-full w-2/3 group-hover:w-full rounded-full transition-all duration-700"
                      style={{ backgroundColor: step.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href={user ? "/dashboard" : "/auth/signup"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#00e6c3] text-[#050816] font-black text-sm shadow-[0_0_30px_rgba(0,230,195,0.2)] hover:shadow-[0_0_44px_rgba(0,230,195,0.35)] hover:-translate-y-0.5 transition-all duration-200"
              >
                {user ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* GAMIFICATION                            */}
        {/* ═══════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f59e0b] mb-3">Gamification Engine</p>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white">
                Built to bring you<br className="hidden sm:block" /> back every day
              </h2>
              <p className="mt-4 text-zinc-400 max-w-xl">Streaks, spins, missions, and a VIP ladder that makes every coin count more than the last.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

              {/* LEFT: Streak + missions */}
              <div className="space-y-5">

                {/* 7-Day Streak */}
                <div className="rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] p-7">
                  <div className="flex items-start justify-between gap-4 mb-7">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">7-Day Login Streak</p>
                      <h3 className="font-display font-black text-2xl text-white">Come back daily for free rewards</h3>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[10px] font-black text-[#f59e0b] uppercase tracking-wide shrink-0">
                      <Flame className="w-3 h-3" /> Day 5
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2.5">
                    {streakDays.map((d) => (
                      <div key={d.day} className="text-center">
                        <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-xs font-black transition-all ${
                          d.state === "done"    ? "bg-[#00e6c3]/10 border-2 border-[#00e6c3]/30 text-[#00e6c3]" :
                          d.state === "active"  ? "bg-[#00e6c3] border-2 border-[#00e6c3] text-[#050816] shadow-[0_0_20px_rgba(0,230,195,0.35)]" :
                          d.state === "jackpot" ? "bg-[#f59e0b]/5 border-2 border-[#f59e0b]/20 text-[#f59e0b]" :
                          "bg-[#0a1628] border-2 border-[#1a2a40] text-zinc-700"
                        }`}>
                          <span>{d.state === "done" ? "✓" : d.reward}</span>
                        </div>
                        <p className="text-[9px] text-zinc-700 mt-1.5 font-semibold">Day {d.day}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-4 rounded-xl bg-[#0a1628] border border-[#1e2d4f]">
                    <p className="text-xs text-zinc-400">
                      Day 7 jackpot reward: <span className="font-black text-[#f59e0b]">FREE Spin — win up to 500 coins</span>
                    </p>
                  </div>
                </div>

                {/* Daily missions preview */}
                <div className="rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-[#8b5cf6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black">Battle Pass · Season 1</p>
                      <h3 className="font-black text-lg text-white">Daily Missions</h3>
                    </div>
                    <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-wide">2/3 Done</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: "Poll Connoisseur", desc: "Vote in today's community poll", reward: "+10", done: true },
                      { name: "Survey Explorer", desc: "Complete 1 offer or survey today", reward: "+50", done: true },
                      { name: "High Earner Boost", desc: "Earn 1,000 coins in total today", reward: "+200", done: false, progress: 65 },
                    ].map((m) => (
                      <div key={m.name} className="flex items-center gap-4 p-4 rounded-xl bg-[#0a1628] border border-[#1e2d4f]">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                          m.done ? "bg-[#00e6c3] text-[#050816]" : "border-2 border-[#2a3a5a] text-zinc-600"
                        }`}>
                          {m.done ? "✓" : "○"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{m.name}</p>
                          <p className="text-xs text-zinc-500">{m.desc}</p>
                          {!m.done && m.progress && (
                            <div className="mt-1.5 h-1 bg-[#1e2d4f] rounded-full overflow-hidden w-32">
                              <div className="h-full bg-[#8b5cf6] rounded-full" style={{ width: `${m.progress}%` }} />
                            </div>
                          )}
                        </div>
                        <span className={`text-xs font-black shrink-0 ${m.done ? "text-[#00e6c3]" : "text-zinc-600"}`}>{m.reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: Spin + VIP */}
              <div className="space-y-5">

                {/* Spin wheel */}
                <div className="rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] p-7 text-center">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black mb-5">Daily Spin Wheel</p>
                  <div className="relative mx-auto w-40 h-40 mb-5">
                    <div className="absolute inset-0 rounded-full border-[3px] border-[#00e6c3]/10" />
                    <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#00e6c3]/15 animate-spin-slow" />
                    <div className="absolute inset-2 rounded-full">
                      {/* Wheel sectors (visual only) */}
                      {["#00e6c3", "#3a7bff", "#8b5cf6", "#f59e0b", "#1e2d4f"].map((color, i) => (
                        <div
                          key={i}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(${color}15 ${i * 72}deg, ${color}08 ${(i + 1) * 72}deg)`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-6 rounded-full bg-[#07111e] border border-[#1e2d4f] flex flex-col items-center justify-center">
                      <Play className="w-6 h-6 text-[#00e6c3]" />
                      <span className="text-[9px] font-black text-zinc-500 mt-0.5 uppercase tracking-wider">SPIN</span>
                    </div>
                  </div>
                  <p className="font-black text-white">Win up to 500 coins</p>
                  <p className="text-xs text-zinc-500 mt-1">Once per 24h. Completely free.</p>
                  <Link
                    href={user ? "/dashboard" : "/auth/signup"}
                    className="mt-5 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00e6c3]/10 border border-[#00e6c3]/20 text-sm font-black text-[#00e6c3] hover:bg-[#00e6c3]/15 transition"
                  >
                    <Play className="w-4 h-4" /> Claim Daily Spin
                  </Link>
                </div>

                {/* VIP Tiers */}
                <div className="rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] p-7">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black mb-4">VIP Loyalty Tiers</p>
                  {[
                    { name: "Bronze", range: "0–1K", color: "#f59e0b" },
                    { name: "Silver", range: "1K–5K", color: "#94a3b8" },
                    { name: "Gold", range: "5K–25K", color: "#f59e0b", active: true },
                    { name: "Platinum", range: "25K–100K", color: "#00e6c3" },
                    { name: "Diamond", range: "100K+", color: "#3a7bff" },
                  ].map((tier) => (
                    <div
                      key={tier.name}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl mb-1.5 last:mb-0 border transition ${
                        tier.active
                          ? "border-[#f59e0b]/25 bg-[#f59e0b]/[0.05]"
                          : "border-transparent hover:bg-[#0a1628]"
                      }`}
                    >
                      <span className="text-sm font-bold" style={{ color: tier.active ? tier.color : "#475569" }}>
                        {tier.name} VIP
                      </span>
                      <span className="text-xs text-zinc-700">{tier.range} coins</span>
                      {tier.active && <span className="text-[9px] font-black text-[#f59e0b] uppercase tracking-wide">You</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* CASHOUT METHODS                         */}
        {/* ═══════════════════════════════════════ */}
        <section id="cashout" className="px-4 sm:px-6 lg:px-8 py-20 border-t border-[#1e2d4f] bg-[#040c18]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#00e6c3] mb-3">Cashout Methods</p>
                <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white">Get paid your way</h2>
              </div>
              <p className="text-zinc-500 text-sm md:text-right">
                Min $5 CAD · Manual review · 24h processing · No hidden fees
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cashoutMethods.map((m) => (
                <div
                  key={m.name}
                  className="group rounded-2xl border border-[#1e2d4f] bg-[#07111e] p-5 text-center hover:border-white/[0.09] hover:-translate-y-0.5 transition-all cursor-default"
                >
                  <p className="font-black text-lg text-white">{m.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{m.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* STATS                                   */}
        {/* ═══════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 border-y border-[#1e2d4f]">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] p-7 text-center hover:border-white/[0.09] transition">
                <p className="font-display font-black text-[3.2rem] tracking-tight leading-none" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs font-bold text-zinc-500 mt-2.5 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* LEADERBOARD                             */}
        {/* ═══════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f59e0b] mb-3">This Week&apos;s Top Earners</p>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white">The competition is real</h2>
            </div>

            <div className="rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] overflow-hidden">
              {leaderboard.map((earner, idx) => (
                <div
                  key={earner.rank}
                  className={`flex items-center gap-4 px-6 py-4.5 py-[18px] transition-colors hover:bg-[#0a1628] ${
                    idx < leaderboard.length - 1 ? "border-b border-[#1e2d4f]" : ""
                  } ${earner.rank === 1 ? "bg-[#f59e0b]/[0.03]" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-base shrink-0 ${
                    earner.rank === 1 ? "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/25" :
                    earner.rank === 2 ? "bg-zinc-700/20 text-zinc-400 border border-zinc-700/30" :
                    earner.rank === 3 ? "bg-[#f59e0b]/8 text-[#f59e0b]/50 border border-[#f59e0b]/12" :
                    "bg-[#0a1628] text-zinc-600 border border-[#1e2d4f]"
                  }`}>
                    {earner.rank === 1 ? "🏆" : earner.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{earner.name}</p>
                    <p className="text-xs text-zinc-500">{earner.tier} · {earner.rank === 1 ? "This week's champion" : `${120 + earner.rank * 38} completions`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-black text-xl" style={{
                      color: earner.rank === 1 ? "#f59e0b" : earner.rank === 2 ? "#94a3b8" : "#64748b"
                    }}>
                      {earner.coins.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-700">coins</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-xs text-zinc-600">
              Want to be on this board?{" "}
              <Link href="/auth/signup" className="text-[#00e6c3] font-bold hover:underline">
                Join TapCash for free →
              </Link>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* FAQ                                     */}
        {/* ═══════════════════════════════════════ */}
        <section id="faq" className="px-4 sm:px-6 lg:px-8 py-20 border-t border-[#1e2d4f] bg-[#040c18]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#3a7bff] mb-3">Got Questions?</p>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white">Answers before you click</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {faqItems.map((item) => (
                <div key={item.q} className="rounded-[1.5rem] border border-[#1e2d4f] bg-[#07111e] p-6 hover:border-white/[0.09] transition-all">
                  <h3 className="font-black text-white">{item.q}</h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* FINAL CTA                               */}
        {/* ═══════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#1e3a6a] bg-[#040e1e] px-8 py-14 md:px-14 md:py-20 text-center">
              {/* Ambient orbs */}
              <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#00e6c3]/[0.07] blur-3xl pointer-events-none" />
              <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#3a7bff]/[0.09] blur-3xl pointer-events-none" />

              <div className="relative">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#3a7bff] mb-5">Join 50,000+ Earners</p>
                <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight text-white mb-5">
                  Start earning in<br />30 seconds.
                </h2>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
                  Free to join. No credit card. Instant access to RapidoReach offerwall and daily earning missions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={user ? "/dashboard" : "/auth/signup"}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#00e6c3] text-[#050816] font-black text-sm shadow-[0_0_40px_rgba(0,230,195,0.25)] hover:shadow-[0_0_60px_rgba(0,230,195,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {user ? "Open Dashboard" : "Create Free Account"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/rapidoreach"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/[0.09] bg-white/[0.03] text-sm font-semibold text-zinc-300 hover:bg-white/[0.07] hover:text-white transition-all"
                  >
                    View Offerwall <Gamepad2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#1e2d4f] bg-[#030810] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#00e6c3] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#050816]" />
            </div>
            <span className="font-black text-white">TapCash</span>
            <span className="text-zinc-600 text-sm hidden sm:inline">— Ledger-first rewards for Canadians</span>
          </div>
          <div className="flex items-center gap-5 flex-wrap text-sm text-zinc-500">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition">Cookies</Link>
            <Link href="/affiliate" className="hover:text-white transition">Affiliate</Link>
          </div>
          <p className="text-xs text-zinc-700">© TapCash {new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  );
}
