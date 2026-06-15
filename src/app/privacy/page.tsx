// src/app/privacy/page.tsx
"use client";

import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, Lock, Eye, CheckCircle2, AlertTriangle, Scale, RefreshCw, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 22, 2026";

  const sections = [
    {
      id: "data-controller",
      title: "1. Data Controller & Introduction",
      icon: Scale,
      content: (
        <>
          <p>
            TapCash (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, store, process, share, and protect your personal data when you visit and use the TapCash platform, applications, and web services.
          </p>
          <p className="mt-2 text-zinc-400">
            By accessing or using TapCash, you agree to the collection and use of information in accordance with this policy. For the purposes of the General Data Protection Regulation (GDPR) and other applicable international privacy laws, TapCash acts as both a Data Controller (for your registration credentials and platform analytics) and a Data Processor (when translating your offer completions from third-party networks into virtual reward points).
          </p>
        </>
      ),
    },
    {
      id: "data-collection",
      title: "2. Information We Collect",
      icon: Eye,
      content: (
        <>
          <p>
            To provide our rewards platform and maintain operational integrity, we collect several categories of information:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-400">
            <li>
              <strong className="text-white">Account Credentials:</strong> When you register, we collect your email address, referral association, and secure password hashes managed securely through Firebase Authentication.
            </li>
            <li>
              <strong className="text-white">Telemetry &amp; Connectivity Data:</strong> To safeguard our systems, we automatically collect your IP address, browser user-agent, operating system details, screen resolution, and approximate location (country/region).
            </li>
            <li>
              <strong className="text-white">Fraud Prevention Logs:</strong> We collect and store device identifiers, local storage sessions, and cryptographic browser fingerprints to prevent Sybil attacks and automated bot behavior.
            </li>
            <li>
              <strong className="text-white">Ledgers &amp; Transaction Details:</strong> We log every single coin credit, daily spin participation, payout request, and reward withdrawal address to ensure account audits are verifiable.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "legal-basis",
      title: "3. Legal Basis & How We Use Your Data",
      icon: Lock,
      content: (
        <>
          <p>
            We process your personal data under the following legal foundations as outlined in the General Data Protection Regulation (GDPR Article 6):
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-400">
            <li>
              <strong className="text-white">Performance of a Contract:</strong> We require your email and account history to track task eligibility, calculate coin balances (10 coins = $0.01 USD), and issue rewards.
            </li>
            <li>
              <strong className="text-white">Legitimate Interests:</strong> We utilize real-time automated fraud detection via ProxyCheck.io to examine IP safety profiles. Client IPs that are identified as VPNs, TOR nodes, or malicious proxies are flagged, blocked, and saved securely inside <code className="text-emerald-400">/fraud_logs</code>. This is vital to protect our advertisers and maintain financial solvency.
            </li>
            <li>
              <strong className="text-white">Legal Obligations:</strong> To prevent money laundering, verify the absolute legitimacy of withdrawals, and coordinate with taxation rules.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "third-party-sharing",
      title: "4. Third-Party Data Disclosures",
      icon: AlertTriangle,
      content: (
        <>
          <p>
            TapCash never sells your personal data. However, to operate our service, we share anonymized or specific operational indicators with third parties:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-400">
            <li>
              <strong className="text-white">Offerwall Partners (Lootably, HangMyAd, Wyzia):</strong> When you click on an external offer, we transmit a randomized unique session identifier (e.g., your Firebase User ID) so our partners can report successful conversions via server postbacks. No real-world emails or billing information are shared with offerwalls.
            </li>
            <li>
              <strong className="text-white">Anti-Fraud Databases:</strong> Your IP address is queried securely through proxy-checking endpoints (such as ProxyCheck.io) to analyze proxy signatures.
            </li>
            <li>
              <strong className="text-white">Infrastructure Providers:</strong> Our database and back-end logic are fully hosted inside Google Firebase and Cloud Functions, operating under strict corporate data processing terms.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "cookies-fingerprinting",
      title: "5. Cookies & Tracking Technologies",
      icon: Shield,
      content: (
        <>
          <p>
            We use persistent local storage, browser session states, and tracking cookies to keep you securely signed in and prevent system exploitation.
          </p>
          <p className="mt-2 text-zinc-400">
            These cookies let us record user-specific device settings and keep track of security validation sessions. If you choose to completely block all cookie tracking via browser utilities, certain parts of the TapCash earning mechanism, such as postback links and active sessions, may fail to function correctly.
          </p>
        </>
      ),
    },
    {
      id: "gdpr-ccpa-rights",
      title: "6. GDPR & CCPA/CPRA Privacy Rights",
      icon: CheckCircle2,
      content: (
        <>
          <p>
            Depending on your physical residency (including the European Economic Area, United Kingdom, and the State of California), you possess specific, legally binding rights regarding your personal information:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-400">
            <li>
              <strong className="text-white">Right of Access &amp; Portability:</strong> You can request a copy of the specific account details and ledger statements we hold.
            </li>
            <li>
              <strong className="text-white">Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You may request the permanent deletion of your account and all associated transaction records.
            </li>
            <li>
              <strong className="text-white">Right to Opt-Out:</strong> If you reside in California (under CCPA/CPRA), you have the right to request that we do not share or distribute information to external parties.
            </li>
          </ul>
          <p className="mt-3">
            To invoke any of these statutory rights, please send an explicit inquiry from your registered email address to <a href="mailto:HELLO@TAPCASH.ONLINE" className="text-emerald-400 hover:underline">HELLO@TAPCASH.ONLINE</a>. We will process and confirm your request within 30 days.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      <PremiumHeader />

      {/* Background radial glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <MotionWrap>
          <section className="rounded-[2rem] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.14),transparent_30%),linear-gradient(180deg,rgba(8,12,24,0.96),rgba(4,6,14,0.98))] p-6 sm:p-8 lg:p-10 mb-12">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-start">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 text-[#8cf8e9] text-[10px] font-black uppercase tracking-[0.28em]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Privacy-first
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-[0.22em]">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                    Secure backend flow
                  </span>
                </div>
                <div className="max-w-2xl space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    Privacy that feels like a real product, not an afterthought.
                  </h1>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    We keep your data handling clear, security-forward, and compatible with the ledger-first rewards experience.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]">
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/7 transition-colors">
                    View dashboard
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <StatCard label="Trust signals" value="Security & transparency" detail="Your rewards, logs, and sessions are handled with server-side controls." />
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Tracking" value="Clear" detail="Nothing hidden" />
                  <StatCard label="Controls" value="Visible" detail="User-accessible" />
                </div>
              </div>
            </div>
          </section>
        </MotionWrap>

        <div className="space-y-4 text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest leading-none">
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            <span>Data Security Standards</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-600 animate-spin-slow" />
            <span>Last Updated: {lastUpdated}</span>
          </p>
        </div>

        <ConversionStrip
          eyebrow="Start earning"
          title="A privacy-first rewards flow can still convert well."
          description="TapCash keeps user trust visible while routing offers, referrals, and cashout controls through the backend."
          primaryHref="/auth/signup"
          primaryLabel="Create account"
          secondaryHref="/dashboard"
          secondaryLabel="View dashboard"
          bullets={["Server-side session handling", "Ledger-backed balance tracking", "Fraud-aware offer logging"]}
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
          <p>Have questions about your data, cookies, or GDPR requests?</p>
          <p>
            Contact our designated Data Protection Officer at{" "}
            <a href="mailto:HELLO@TAPCASH.ONLINE" className="text-emerald-400 hover:underline">
              HELLO@TAPCASH.ONLINE
            </a>
          </p>
        </div>
      </main>
      <PremiumFooter />

      <footer className="border-t border-zinc-900 bg-[#080808] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} TapCash. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-emerald-500 transition">Dashboard</Link>
            <Link href="/terms" className="hover:text-emerald-500 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
