// src/app/affiliate/page.tsx
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, Users, Award, AlertTriangle, RefreshCw, Scale, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MotionWrap } from "@/components/PremiumUi";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

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
          <div className="my-6 py-5 flex items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(245,243,239,0.09)", borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
            <div>
              <h4 className="text-sm font-bold" style={{ color: GOLD_BRIGHT }}>Standard Affiliate Commission</h4>
              <p className="text-xs text-[rgba(245,243,239,0.5)] mt-1">Earn on every single offer wall, survey, and task your referral completes.</p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: GOLD_BRIGHT }}>20%</p>
              <p className="text-[9px] font-bold uppercase text-[rgba(245,243,239,0.4)] tracking-wider">Passive Rate</p>
            </div>
          </div>
          <p className="text-[rgba(245,243,239,0.5)] text-sm">
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
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[rgba(245,243,239,0.5)] text-sm sm:text-base">
            <li>
              <strong className="text-[#F5F3EF]">Self-Referral:</strong> Creating multiple accounts yourself and linking them to your main affiliate link is strictly prohibited. Doing so will result in an immediate permanent ban on all associated accounts.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Search Engine Hijacking:</strong> Bidding on trademarked search terms (e.g., &quot;TapCash&quot;, &quot;TapCash Codes&quot;, &quot;TapCash App&quot;) on search ad networks (Google Ads, Bing Ads, Yahoo) is strictly prohibited.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Spamming:</strong> Posting your referral link inside irrelevant subreddits, comment sections of YouTube/TikTok, public chat channels, or sending unsolicited emails.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Incentivized Signups:</strong> Paying other users to sign up using your link or promising separate payouts or cash rewards outside our platform.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Misrepresentation:</strong> Advertising TapCash using false, misleading, or hyper-inflated earning promises (e.g. &quot;earn $100 in 5 minutes!&quot;).
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
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[rgba(245,243,239,0.5)]">
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
          <p className="mt-2 text-[rgba(245,243,239,0.5)]">
            Action can include reducing your commission rate to 0%, deleting your linked referral network, deleting your accumulated referral earnings, or permanently terminating your main TapCash profile.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <MotionWrap>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
            Referral policy
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Affiliate policy that protects growth and keeps the program sustainable.
          </h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)] mb-8">
            TapCash&rsquo;s referral engine is designed to drive growth without compromising fairness. This page explains how commissions, audits, and limits work.
          </p>
          <div className="grid gap-6 sm:grid-cols-3 py-6" style={{ borderTop: "1px solid rgba(245,243,239,0.09)", borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
            {[
              { label: "Policy date", value: lastUpdated },
              { label: "Referral bonus", value: "5% lifetime per referee" },
              { label: "Enforcement", value: "Audited, real-time + manual" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[rgba(245,243,239,0.4)] mb-1">{s.label}</p>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
            >
              Join TapCash <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
              style={{ borderColor: "rgba(245,243,239,0.18)" }}
            >
              Open dashboard
            </Link>
          </div>
        </MotionWrap>

        <div className="space-y-4 text-center mt-16 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: GOLD_BRIGHT }}>
            <Award className="w-3.5 h-3.5" />
            <span>Referral Program Terms</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#F5F3EF] tracking-tight">
            Affiliate Policy
          </h2>
          <p className="text-[rgba(245,243,239,0.4)] text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[rgba(245,243,239,0.28)]" />
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

        {/* Legal sections -- hairline-divided, no bordered card wrapper */}
        <div>
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`py-10 space-y-4 ${i === 0 ? "" : ""}`}
                style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                  <h3 className="text-xl font-extrabold text-[#F5F3EF] tracking-tight">{section.title}</h3>
                </div>
                <div className="text-sm sm:text-base text-[rgba(245,243,239,0.68)] leading-relaxed space-y-4">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal Footer Note */}
        <div className="mt-6 pt-10 text-center text-xs font-semibold text-[rgba(245,243,239,0.28)] uppercase tracking-wider space-y-2" style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}>
          <p>Are you a high-traffic influencer or website owner seeking custom commission tiers?</p>
          <p>
            Apply for our Elite Partner status at{" "}
            <a href="mailto:HELLO@TAPCASH.ONLINE" className="hover:underline" style={{ color: GOLD }}>
              HELLO@TAPCASH.ONLINE
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
