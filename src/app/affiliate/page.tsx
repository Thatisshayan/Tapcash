// src/app/affiliate/page.tsx
"use client";

import Header from "@/components/Header";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, Users, Award, AlertTriangle, RefreshCw, Scale, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AffiliatePolicyPage() {
  const lastUpdated = "May 22, 2026";

  const sections = [
    {
      id: "program-overview",
      title: "1. Referral Program Mechanics",
      icon: Users,
      content: (
        <>
          <p>
            TapCash offers a highly lucrative Affiliate &amp; Referral Program that allows you to earn passive rewards by inviting friends to our community. When a user signs up using your unique referral link, they are permanently linked as your referee.
          </p>
          <div className="my-4 p-5 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-emerald-400">Standard Affiliate Commission</h4>
              <p className="text-xs text-zinc-400 mt-1">Earn on every single offer wall, survey, and task your referral completes.</p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-2xl font-black text-emerald-400">20%</p>
              <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Passive Rate</p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm">
            This commission is funded entirely from our system marketing budget. Referees do not lose any part of their earnings; they receive 100% of their earned Coins, while you receive an additional 20% bonus on top.
          </p>
        </>
      ),
    },
    {
      id: "prohibited-promotions",
      title: "2. Prohibited Promotional Behaviors",
      icon: AlertTriangle,
      content: (
        <>
          <p>
            To protect our advertiser relationships, we enforce strict guidelines on how you promote your referral links. The following promotional methods are strictly prohibited:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-400 text-sm sm:text-base">
            <li>
              <strong className="text-white">Self-Referral:</strong> Creating multiple accounts yourself and linking them to your main affiliate link is strictly prohibited. Doing so will result in an immediate permanent ban on all associated accounts.
            </li>
            <li>
              <strong className="text-white">Search Engine Hijacking:</strong> Bidding on trademarked search terms (e.g., &quot;TapCash&quot;, &quot;TapCash Codes&quot;, &quot;TapCash App&quot;) on search ad networks (Google Ads, Bing Ads, Yahoo) is strictly prohibited.
            </li>
            <li>
              <strong className="text-white">Spamming:</strong> Posting your referral link inside irrelevant subreddits, comment sections of YouTube/TikTok, public chat channels, or sending unsolicited emails.
            </li>
            <li>
              <strong className="text-white">Incentivized Signups:</strong> Paying other users to sign up using your link or promising separate payouts or cash rewards outside our platform.
            </li>
            <li>
              <strong className="text-white">Misrepresentation:</strong> Advertising TapCash using false, misleading, or hyper-inflated earning promises (e.g. &quot;earn $100 in 5 minutes!&quot;).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "audit-verification",
      title: "3. Audit Checks & Commission Holds",
      icon: Shield,
      content: (
        <>
          <p>
            All referral commissions are subject to rigorous real-time and manual audit checks. We reserve the right to temporarily hold, reverse, or cancel referral earnings if:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-400">
            <li>Your referee completes tasks using forbidden networks (such as proxies, emulators, or VPNs).</li>
            <li>An advertiser reverses or chargebacks the task completion rewards due to non-compliance or poor response quality.</li>
            <li>Your affiliate profile is flagged for high-volume conversion anomalies (e.g., hundreds of signups with zero task completion rates).</li>
          </ul>
        </>
      ),
    },
    {
      id: "termination",
      title: "4. Program Suspension",
      icon: Scale,
      content: (
        <>
          <p>
            Violations of this Affiliate Policy will result in immediate consequences determined at our sole discretion.
          </p>
          <p className="mt-2 text-zinc-400">
            Action can include reducing your commission rate to 0%, deleting your linked referral network, deleting your accumulated referral earnings, or permanently terminating your main TapCash profile.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      <Header />

      {/* Background radial glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.14),transparent_30%),linear-gradient(180deg,rgba(8,12,24,0.96),rgba(4,6,14,0.98))] p-6 sm:p-8 lg:p-10 mb-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 right-0 h-56 w-56 rounded-full bg-[#3a7bff]/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-[#00e6c3]/10 blur-3xl" />
          </div>

          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-start">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 text-[#8cf8e9] text-[10px] font-black uppercase tracking-[0.28em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Referral policy
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-[0.22em]">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                  Commission rules
                </span>
              </div>

              <div className="max-w-2xl space-y-3">
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  Affiliate policy that protects growth and keeps the program sustainable.
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  TapCash’s referral engine is designed to drive growth without compromising fairness. This page explains how commissions, audits, and limits work.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                >
                  Join TapCash
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.07] transition-colors"
                >
                  Open dashboard
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-white/6 bg-[#07101b]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Policy date</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xl font-black text-white">{lastUpdated}</p>
                    <p className="text-sm text-zinc-400">Current program terms</p>
                  </div>
                  <RefreshCw className="w-5 h-5 text-[#00e6c3] animate-spin-slow" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Referral bonus</p>
                  <p className="mt-2 text-2xl font-black text-white">5%</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Enforcement</p>
                  <p className="mt-2 text-2xl font-black text-white">Audited</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4 text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest leading-none">
            <Award className="w-3.5 h-3.5 animate-pulse" />
            <span>Referral Program Terms</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Affiliate Policy
          </h2>
          <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-600 animate-spin-slow" />
            <span>Last Updated: {lastUpdated}</span>
          </p>
        </div>

        {/* Informative notice banner */}
        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-3xl p-6 sm:p-8 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
          <h2 className="text-lg font-bold text-emerald-400 mb-2">Build Your Passive Stream</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We highly value active creators and promoters. When you build an audience and share TapCash ethically, you help us grow. This Affiliate Policy ensures that everyone plays by the same fair rules, keeping our rewards pool sustainable and safe for everyone.
          </p>
        </div>

        <div className="mb-12">
          <ConversionStrip
            eyebrow="Grow earnings"
            title="Use your affiliate link to turn traffic into recurring rewards."
            description="TapCash lets referrals generate passive commission while still keeping the product clean, transparent, and compliant."
            primaryHref="/auth/signup"
            primaryLabel="Join TapCash"
            secondaryHref="/dashboard"
            secondaryLabel="Open dashboard"
            bullets={["Fast signup flow", "Referral tracking built in", "Passive earning through offers"]}
          />
        </div>

        {/* Dynamic Legal sections list */}
        <div className="space-y-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className="bg-zinc-950/30 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-4 hover:border-zinc-800 transition duration-300"
              >
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">{section.title}</h3>
                </div>
                <div className="text-sm sm:text-base text-zinc-300 leading-relaxed space-y-4">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal Footer Note */}
        <div className="mt-16 pt-8 border-t border-zinc-900 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider space-y-2">
          <p>Are you a high-traffic influencer or website owner seeking custom commission tiers?</p>
          <p>
            Apply for our Elite Partner status at{" "}
            <a href="mailto:HELLO@TAPCASH.ONLINE" className="text-emerald-400 hover:underline">
              HELLO@TAPCASH.ONLINE
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-[#080808] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} TapCash. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/" className="hover:text-emerald-500 transition">Dashboard</Link>
            <Link href="/terms" className="hover:text-emerald-500 transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-emerald-500 transition">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
