// src/app/privacy/page.tsx
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, Lock, Eye, CheckCircle2, AlertTriangle, Scale, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

import { MotionWrap } from "@/components/PremiumUi";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

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
          <p className="mt-2 text-[rgba(245,243,239,0.5)]">
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
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[rgba(245,243,239,0.5)]">
            <li>
              <strong className="text-[#F5F3EF]">Account Credentials:</strong> When you register, we collect your email address, referral association, and secure password hashes managed securely through Firebase Authentication.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Telemetry &amp; Connectivity Data:</strong> To safeguard our systems, we automatically collect your IP address, browser user-agent, operating system details, screen resolution, and approximate location (country/region).
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Fraud Prevention Logs:</strong> We collect and store device identifiers, local storage sessions, and cryptographic browser fingerprints to prevent Sybil attacks and automated bot behavior.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Ledgers &amp; Transaction Details:</strong> We log every single coin credit, daily spin participation, payout request, and reward withdrawal address to ensure account audits are verifiable.
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
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[rgba(245,243,239,0.5)]">
            <li>
              <strong className="text-[#F5F3EF]">Performance of a Contract:</strong> We require your email and account history to track task eligibility, calculate coin balances (10 coins = $0.01 USD), and issue rewards.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Legitimate Interests:</strong> We utilize real-time automated fraud detection via ProxyCheck.io to examine IP safety profiles. Client IPs that are identified as VPNs, TOR nodes, or malicious proxies are flagged, blocked, and saved securely inside <code className="text-[#D9B678]">/fraud_logs</code>. This is vital to protect our advertisers and maintain financial solvency.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Legal Obligations:</strong> To prevent money laundering, verify the absolute legitimacy of withdrawals, and coordinate with taxation rules.
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
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[rgba(245,243,239,0.5)]">
            <li>
              <strong className="text-[#F5F3EF]">Offerwall Partners (Lootably, HangMyAd, Wyzia):</strong> When you click on an external offer, we transmit a randomized unique session identifier (e.g., your Firebase User ID) so our partners can report successful conversions via server postbacks. No real-world emails or billing information are shared with offerwalls.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Anti-Fraud Databases:</strong> Your IP address is queried securely through proxy-checking endpoints (such as ProxyCheck.io) to analyze proxy signatures.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Infrastructure Providers:</strong> Our database and back-end logic are fully hosted inside Google Firebase and Cloud Functions, operating under strict corporate data processing terms.
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
          <p className="mt-2 text-[rgba(245,243,239,0.5)]">
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
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[rgba(245,243,239,0.5)]">
            <li>
              <strong className="text-[#F5F3EF]">Right of Access &amp; Portability:</strong> You can request a copy of the specific account details and ledger statements we hold.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You may request the permanent deletion of your account and all associated transaction records.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Right to Opt-Out:</strong> If you reside in California (under CCPA/CPRA), you have the right to request that we do not share or distribute information to external parties.
            </li>
          </ul>
          <p className="mt-3">
            To invoke any of these statutory rights, please send an explicit inquiry from your registered email address to <a href="mailto:HELLO@TAPCASH.ONLINE" className="text-[#D9B678] hover:underline">HELLO@TAPCASH.ONLINE</a>. We will process and confirm your request within 30 days.
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
            Privacy-first &middot; Secure backend flow
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Privacy that feels like a real product, not an afterthought.
          </h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)] mb-8">
            We keep your data handling clear, security-forward, and compatible with the ledger-first rewards experience.
          </p>
          <div className="grid gap-6 sm:grid-cols-3 py-6" style={{ borderTop: "1px solid rgba(245,243,239,0.09)", borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
            {[
              { label: "Trust signals", value: "Security & transparency" },
              { label: "Tracking", value: "Clear, nothing hidden" },
              { label: "Controls", value: "Visible, user-accessible" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[rgba(245,243,239,0.4)] mb-1">{s.label}</p>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
            >
              Create account <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
              style={{ borderColor: "rgba(245,243,239,0.18)" }}
            >
              View dashboard
            </a>
          </div>
        </MotionWrap>

        <div className="space-y-4 text-center mt-16 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: GOLD_BRIGHT }}>
            <Shield className="w-3.5 h-3.5" />
            <span>Data Security Standards</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F5F3EF] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-[rgba(245,243,239,0.4)] text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[rgba(245,243,239,0.28)]" />
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

        {/* Legal sections -- hairline-divided, no bordered card wrapper */}
        <div>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} id={section.id} className="py-10 space-y-4" style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}>
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
          <p>Have questions about your data, cookies, or GDPR requests?</p>
          <p>
            Contact our designated Data Protection Officer at{" "}
            <a href="mailto:HELLO@TAPCASH.ONLINE" className="text-[#D9B678] hover:underline">
              HELLO@TAPCASH.ONLINE
            </a>
          </p>
        </div>
      </main>
      <Footer />

      <footer className="border-t border-[rgba(245,243,239,0.09)] bg-[#0A0A0D] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[rgba(245,243,239,0.28)] uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} TapCash. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-[#D9B678] transition">Dashboard</Link>
            <Link href="/terms" className="hover:text-[#D9B678] transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
