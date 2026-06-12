// src/app/terms/page.tsx
"use client";

import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, FileText, CheckCircle2, AlertTriangle, Scale, RefreshCw, Landmark, HelpCircle, Clock, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

export default function TermsOfServicePage() {
  const lastUpdated = "May 22, 2026";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: Scale,
      content: (
        <>
          <p>
            These Website Terms of Service constitute a legally binding agreement entered into by and between you and TapCash (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These terms govern your access to and use of our platform, including any content, features, emails, transaction processes, and mobile or web-based applications offered on or through TapCash.
          </p>
          <p className="mt-2 text-zinc-400">
            Please read these Terms of Service carefully before creating an account. By using the platform or clicking to agree when this option is made available, you accept and agree to be bound by these Terms and our Privacy Policy, which is incorporated here by reference. If you do not agree to these terms, you must not access or use the platform.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "2. Eligibility & Account Rules",
      icon: CheckCircle2,
      content: (
        <>
          <p>
            This platform is offered and available to users who are at least 16 years of age or older. If you are between 13 and 16 years old, you may only use this platform under the direct supervision of a parent or legal guardian who agrees to be bound by these terms. If you are under 13, you are strictly prohibited from creating an account.
          </p>
          <div className="mt-4 p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl">
            <h4 className="text-sm font-bold text-emerald-400 mb-1">Strict Account Limits:</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Participation on TapCash is strictly limited to **one (1) account per person** and **one (1) account per household/IP address**. Registering or logging into multiple accounts under the same household, device, or payment address is a material breach and will result in the immediate lock of all related accounts.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "rewards",
      title: "3. Rewards & Coin Valuation",
      icon: Shield,
      content: (
        <>
          <p>
            TapCash offers rewards in the form of virtual points known as &quot;Coins&quot;. You agree and acknowledge that unredeemed Coins in your account are virtual tokens with **no cash, monetary, or other intrinsic value**, and remain the sole property of TapCash. They are only redeemable for digital gift cards, crypto rewards, or other prizes as offered in our cashout dashboard.
          </p>
          <p className="mt-2 text-zinc-400">
            Coins are credited only upon successful completion and advertiser-validated approval of eligible tasks, survey walls, or games. The standard conversion valuation rate is defined as:
          </p>
          <div className="my-3 p-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl flex items-center justify-center gap-4 text-center">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">10 Coins</p>
              <p className="text-lg font-extrabold text-emerald-400">$0.01 USD</p>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">1,000 Coins</p>
              <p className="text-lg font-extrabold text-emerald-400">$1.00 USD</p>
            </div>
          </div>
          <p className="text-zinc-400 mt-2">
            We reserve the right temporarily to **hold any offer credits for up to 90 days** after an offer has been completed if the advertiser flags the conversion for manual review, audit checks, or chargeback safety reviews.
          </p>
        </>
      ),
    },
    {
      id: "prohibited-activities",
      title: "4. Anti-Fraud & Prohibited Activities",
      icon: AlertTriangle,
      content: (
        <>
          <p className="text-red-400 font-bold">
            TapCash operates a sophisticated, zero-tolerance anti-fraud system. Any account utilizing automated exploits or masks will be banned permanently.
          </p>
          <p className="mt-2">
            The following behaviors are strictly prohibited and constitute grounds for immediate account closure and complete forfeiture of all accumulated Coins:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
            <li>Using Virtual Private Networks (VPNs), Proxies, or Tor exit nodes to obscure your physical location or spoof geolocations.</li>
            <li>Employing emulator platforms, automated bot scripts, macros, auto-clickers, or scraping tools to simulate human interaction.</li>
            <li>Registering fake, disposable, or temporary email accounts or phone verification numbers.</li>
            <li>Submitting dishonest, random, or auto-completed answers during surveys, or forging postback signals.</li>
            <li>Linking the same withdrawal payment destination address (e.g., PayPal account or crypto wallet) across multiple profiles.</li>
          </ul>
        </>
      ),
    },
    {
      id: "payouts-identity",
      title: "5. Withdrawals & Identity Verification (KYC)",
      icon: Landmark,
      content: (
        <>
          <p>
            Redemptions and payouts are subject to identity and eligibility verification. We reserve the absolute right to verify your identity to our complete satisfaction prior to allowing the withdrawal of any Rewards.
          </p>
          <p className="mt-2 text-zinc-400">
            To satisfy our security procedures, we may require you (either directly or through a secure third-party provider) to undergo a Know Your Customer (KYC) check. This can involve uploading a clear, valid copy of your state-issued photo ID, passport, or driver&apos;s license, or verifying your physical mobile phone number.
          </p>
          <p className="mt-2 text-zinc-400">
            Our minimum payout is **2,000 Coins ($2.00 USD equivalent)**. Additionally, we enforce an **Engagement Threshold Lock**, requiring a minimum of **2 completed offerwall tasks** before redemptions can be approved. Earned points from referrals or spin wheels alone are not redeemable without active task verification.
          </p>
        </>
      ),
    },
    {
      id: "inactivity",
      title: "6. Inactive Accounts & Expiration",
      icon: Clock,
      content: (
        <>
          <p>
            Any account that has not been logged into for a continuous period of **one (1) year (365 days) or longer** will be considered inactive. Inactive accounts will be automatically closed by our system.
          </p>
          <p className="mt-2 text-zinc-400">
            Upon closure due to inactivity, all unredeemed Coins, referral links, pending payouts, and cashback bonuses will immediately expire and be forfeited without any compensation or liability to you. TapCash will notify you via your registered email address 30 days prior to final closure to provide an opportunity to keep the profile active.
          </p>
        </>
      ),
    },
    {
      id: "taxes",
      title: "7. Taxes & Liability",
      icon: HelpCircle,
      content: (
        <>
          <p>
            You acknowledge and agree that we do not have the ability, in every instance, to determine whether your redeemed Rewards represent reportable income or taxable earnings in your local jurisdiction.
          </p>
          <p className="mt-2 text-zinc-400">
            You are solely responsible for any and all tax liabilities, filings, and duties arising from your use of TapCash, including liability arising from the accrual or redemption of Coins. We recommend consulting a qualified tax expert to determine your local filing requirements.
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
          <PageShell
            eyebrow="Platform rules"
            title="Terms that protect the product and keep the funnel credible."
            description="Clear rules help users convert with confidence and give the payout system the guardrails it needs."
            kicker={
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Platform rules
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-300">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                  Clear payout policy
                </div>
              </>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard label="Rules summary" value="Safe, clear, reviewable" detail="The rules protect the ledger, the user experience, and the payout queue." />
              <StatCard label="Payouts" value="Manual" detail="Human-reviewed approval queue" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/auth/signup" label="Create account" variant="gradient" />
              <CTAButton href="/rapidoreach" label="Open offers" variant="secondary" />
            </div>
          </PageShell>
        </MotionWrap>

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

        <ConversionStrip
          eyebrow="Start earning"
          title="Clear rules make a better rewards funnel."
          description="Users convert faster when the payout rules, anti-fraud policy, and offer flow are easy to find."
          primaryHref="/auth/signup"
          primaryLabel="Create account"
          secondaryHref="/rapidoreach"
          secondaryLabel="Open offers"
          bullets={["Manual payout approval", "Transparent coin valuation", "Fraud controls in place"]}
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
          <p>Have questions about our Terms, policies, or KYC procedures?</p>
          <p>
            Contact support directly at{" "}
            <a href="mailto:HELLO@TAPCASH.ONLINE" className="text-emerald-400 hover:underline">
              HELLO@TAPCASH.ONLINE
            </a>
          </p>
        </div>
      </main>
      <PremiumFooter />

      <footer className="border-t border-zinc-900 bg-[#080808] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <span>TapCash © 2026</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
