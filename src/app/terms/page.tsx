// src/app/terms/page.tsx
"use client";

import Header from "@/components/Header";
import { Shield, FileText, CheckCircle2, AlertTriangle, Scale, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  const lastUpdated = "May 22, 2026";

  const sections = [
    {
      id: "eligibility",
      title: "1. Eligibility & Registration",
      icon: Scale,
      content: (
        <>
          <p>
            By creating an account on TapCash, you represent and warrant that you are at least 13 years of age. If you are under 18 years of age, you must have the permission of a parent or legal guardian to access and use the platform.
          </p>
          <p className="mt-2 text-zinc-400">
            You agree to provide accurate, current, and complete registration data. You are solely responsible for protecting your account credentials and maintaining the absolute confidentiality of your login session.
          </p>
        </>
      ),
    },
    {
      id: "prohibited-activities",
      title: "2. Anti-Fraud & Prohibited Activities",
      icon: AlertTriangle,
      content: (
        <>
          <p className="text-emerald-400 font-bold">
            TapCash enforces a strict, zero-tolerance policy against fraudulent activities to protect our network partners and community.
          </p>
          <p className="mt-2">
            The following actions are strictly prohibited and will result in the **immediate, permanent termination** of your account, forfeiture of all accumulated coins, and a permanent ban from our services:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
            <li>Using Virtual Private Networks (VPNs), Proxy servers, or Tor exit nodes to mask your real IP address or location.</li>
            <li>Operating multiple accounts per person, household, device, or payment destination address.</li>
            <li>Employing headless browsers, automated scripts, bots, scrapers, emulation software, or any third-party automation tools.</li>
            <li>Attempting to forge, spoof, or inject offer completion notifications (postbacks) or client click streams.</li>
            <li>Providing false or manipulated data on surveys, offer validations, or redemption requests.</li>
          </ul>
        </>
      ),
    },
    {
      id: "points-currency",
      title: "3. Coin Accumulation & Valuation",
      icon: Shield,
      content: (
        <>
          <p>
            The virtual currency of TapCash is measured in &quot;Coins&quot;. Coins are virtual points with no intrinsic cash value and are not legal tender.
          </p>
          <p className="mt-2 text-zinc-400">
            Coins are credited to your account solely upon the successful completion and advertiser-validated approval of eligible tasks, offer walls, or gamified daily tasks. The standard valuation rate is configured as:
          </p>
          <div className="my-3 p-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl flex items-center justify-center gap-4 text-center">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">10 Coins</p>
              <p className="text-lg font-extrabold text-emerald-400">$0.01 USD (1 Cent)</p>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">1,000 Coins</p>
              <p className="text-lg font-extrabold text-emerald-400">$1.00 USD</p>
            </div>
          </div>
          <p className="text-zinc-400">
            We reserve the right to modify, adjust, or revoke coin balances if advertisers reverse their task completions due to fraud, chargebacks, or non-compliance.
          </p>
        </>
      ),
    },
    {
      id: "redemptions",
      title: "4. Withdrawals & Payout Processing",
      icon: CheckCircle2,
      content: (
        <>
          <p>
            To request a withdrawal from your balance, you must meet our minimum payout requirement of **2,000 Coins ($2.00 USD equivalent)**.
          </p>
          <p className="mt-2 text-zinc-400">
            Additionally, we require all accounts to meet our **Minimum Engagement Threshold** before executing payouts. This requires a minimum of **2 completed offerwall tasks** (surveys, downloads, or signups). Earnings from Daily Spins or referral commissions alone are not sufficient to unlock payouts.
          </p>
          <p className="mt-2 text-zinc-400">
            Withdrawal requests are processed in the order received and undergo manual security audits. Most payments are completed within 24 to 72 business hours. TapCash reserves the right to hold, reject, or void payments if fraudulent activity is flagged during audit reviews.
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
        <div className="space-y-4 text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest leading-none">
            <FileText className="w-3.5 h-3.5 animate-pulse" />
            <span>Platform Agreement</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-600 animate-spin-slow" />
            <span>Last Updated: {lastUpdated}</span>
          </p>
        </div>

        {/* Legal notice banner */}
        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-3xl p-6 sm:p-8 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
          <h2 className="text-lg font-bold text-emerald-400 mb-2">Please Read Carefully</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            By creating an account, logging in, or completing tasks on **TapCash**, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you are not authorized to access or use our applications, site, or payout services.
          </p>
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
          <p>Have questions about our Terms or partner offerwalls?</p>
          <p>
            Contact support directly at{" "}
            <a href="mailto:support@tapcash.online" className="text-emerald-400 hover:underline">
              support@tapcash.online
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-[#080808] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} TapCash. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-emerald-500 transition">Dashboard</Link>
            <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
