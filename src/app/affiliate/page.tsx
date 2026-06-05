// src/app/affiliate/page.tsx
"use client";

import Header from "@/components/Header";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, Users, Award, AlertTriangle, RefreshCw, Scale, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

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
        <MotionWrap>
          <PageShell
            eyebrow="Referral policy"
            title="Affiliate policy that protects growth and keeps the program sustainable."
            description="TapCash’s referral engine is designed to drive growth without compromising fairness. This page explains how commissions, audits, and limits work."
            kicker={
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Referral policy
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-300">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                  Commission rules
                </div>
              </>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Policy date" value="Updated" detail={lastUpdated} />
              <StatCard label="Referral bonus" value="5%" detail="Lifetime per referee" />
              <StatCard label="Enforcement" value="Audited" detail="Real-time + manual" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/auth/signup" label="Join TapCash" variant="gradient" />
              <CTAButton href="/dashboard" label="Open dashboard" variant="secondary" />
            </div>
          </PageShell>
        </MotionWrap>

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
