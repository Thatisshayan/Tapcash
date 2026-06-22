// src/app/cookies/page.tsx
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, Eye, Lock, FileText, CheckCircle2, RefreshCw, Layers, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

export default function CookiePolicyPage() {
  const lastUpdated = "May 22, 2026";

  const cookieInventory = [
    {
      category: "Strictly Necessary",
      cookies: [
        { name: "__session", provider: "Firebase Auth", purpose: "Keeps you securely authenticated to your TapCash dashboard.", duration: "1 Year" },
        { name: "recaptcha", provider: "Google reCAPTCHA", purpose: "Verifies you are a human and protects against bot registration attacks.", duration: "Session" },
        { name: "device_fingerprint", provider: "TapCash Core", purpose: "Utilized by our anti-fraud firewall to log multi-account violations.", duration: "Persistent" }
      ]
    },
    {
      category: "Earning & Conversion Tracking",
      cookies: [
        { name: "_tap_click_id", provider: "TapCash Platform", purpose: "Correlates external task offer clicks with advertiser server callbacks (postbacks).", duration: "30 Days" },
        { name: "loot_session / loot_click", provider: "Lootably", purpose: "Tracks offer wall game installs, app downloads, and completed surveys.", duration: "90 Days" },
        { name: "hangmyad_tracking", provider: "HangMyAd", purpose: "Secures user identification for ad clicks and game progression credits.", duration: "90 Days" },
        { name: "wyzia_click", provider: "Wyzia", purpose: "Tracks offers and microtasks to trigger credit payouts seamlessly.", duration: "90 Days" }
      ]
    },
    {
      category: "Performance & Analytics",
      cookies: [
        { name: "_ga, _gid", provider: "Google Analytics", purpose: "Collects anonymous platform telemetry, page load speeds, and session statistics.", duration: "2 Years / 24h" },
        { name: "spin_lock", provider: "TapCash Wheel", purpose: "Manages local client cooldown states for the Daily Bonus wheel.", duration: "24 Hours" }
      ]
    }
  ];

  const sections = [
    {
      id: "what-are-cookies",
      title: "1. What Are Cookies & Local Storage?",
      icon: Eye,
      content: (
        <>
          <p>
            Cookies are small text files stored on your computer or mobile device when you browse websites. In addition to HTTP cookies, our application utilizes modern browser local storage technologies (such as HTML5 LocalStorage and SessionStorage) to store persistent, secure validation tokens.
          </p>
          <p className="mt-2 text-zinc-400">
            These files allow the platform to remember your active session, track tasks cleanly from start to finish, and prevent multiple users from farming offers on the same physical device.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "2. How We Use Cookies & Storage",
      icon: Shield,
      content: (
        <>
          <p>
            We classify our tracking elements into three core categories:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-400">
            <li>
              <strong className="text-white">Strictly Necessary &amp; Security:</strong> Required for the base application to function. These allow you to log in via Firebase Authentication and maintain your active wallet. They are also used for browser fingerprinting and multi-account checking, which are essential for maintaining anti-fraud shields.
            </li>
            <li>
              <strong className="text-white">Task &amp; Postback Conversion:</strong> Used by our offerwall networks (Lootably, HangMyAd, Wyzia) to track when you download a game or start a survey. These cookies match up clicks on our site with callbacks from advertiser servers. Without these, your offer completions cannot be credited.
            </li>
            <li>
              <strong className="text-white">Preferences &amp; Analytics:</strong> Remember your interface preferences (such as dark mode preferences and daily spin timings) and help us analyze site traffic anonymously.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "cookie-inventory",
      title: "3. Cookie & LocalStorage Inventory",
      icon: Layers,
      content: (
        <>
          <p className="mb-4">
            Below is an explicit, comprehensive breakdown of the tracking pixels, local storage keys, and cookies processed on TapCash:
          </p>
          <div className="space-y-6">
            {cookieInventory.map((group, gIdx) => (
              <div key={gIdx} className="overflow-hidden border border-zinc-900 rounded-2xl bg-zinc-950/20 backdrop-blur-sm">
                <div className="bg-zinc-950/80 px-4 py-2.5 border-b border-zinc-900">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">{group.category}</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950/10">
                        <th className="px-4 py-3">Cookie Name</th>
                        <th className="px-4 py-3">Provider</th>
                        <th className="px-4 py-3">Purpose</th>
                        <th className="px-4 py-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                      {group.cookies.map((cookie, cIdx) => (
                        <tr key={cIdx} className="hover:bg-zinc-900/10 transition">
                          <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{cookie.name}</td>
                          <td className="px-4 py-3 text-white font-medium">{cookie.provider}</td>
                          <td className="px-4 py-3 text-zinc-400 leading-relaxed min-w-[200px]">{cookie.purpose}</td>
                          <td className="px-4 py-3 text-zinc-500 font-semibold uppercase">{cookie.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "third-party",
      title: "4. Third-Party Tracker Disclosures",
      icon: Lock,
      content: (
        <>
          <p>
            When you click on surveys or install advertiser apps, our partners (such as Lootably, HangMyAd, and auxiliary payment processors) may drop their own web beacons, tracking pixels, or cookie scripts to verify task completions.
          </p>
          <p className="mt-2 text-zinc-400">
            These third-party cookies are subject to the specific privacy and cookie guidelines of those external networks. We encourage you to review their policies prior to engaging in extensive offer sequences.
          </p>
        </>
      ),
    },
    {
      id: "managing-cookies",
      title: "5. Managing and Disabling Cookies",
      icon: CheckCircle2,
      content: (
        <>
          <p>
            You can control or delete browser cookies and clear your local storage at any time through your web browser&apos;s built-in preference menus.
          </p>
          <p className="mt-2 text-zinc-400">
            Please note that if you choose to fully block or delete all cookies and local storage tokens, your active session on TapCash will be invalidated. Additionally, **our postback link matching will fail to recognize task completions**, meaning you will not receive Coins for completing surveys or downloading applications.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      <Navbar />

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
                    Cookie controls
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-[0.22em]">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                    Offer attribution
                  </span>
                </div>
                <div className="max-w-2xl space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    Cookie policy that keeps the funnel measurable and secure.
                  </h1>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    We use storage, session tokens, and tracking keys to keep sign-in, offer attribution, and fraud controls working together.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]">
                    Join TapCash
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/7 transition-colors">
                    Open dashboard
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <StatCard label="Tracking scope" value="Visible and controlled" detail="Cookies support login, offer matching, and fraud prevention." />
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Auth" value="Secure" detail="Firebase-backed" />
                  <StatCard label="Match" value="Reliable" detail="Postback-safe" />
                </div>
              </div>
            </div>
          </section>
        </MotionWrap>

        <div className="space-y-4 text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest leading-none">
            <FileText className="w-3.5 h-3.5 animate-pulse" />
            <span>Tracking Disclosures</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-600 animate-spin-slow" />
            <span>Last Updated: {lastUpdated}</span>
          </p>
        </div>

        <ConversionStrip
          eyebrow="Secure session"
          title="Tracking should support the product, not hide it."
          description="TapCash uses cookies and local storage for sign-in, offer attribution, and anti-fraud controls so the earning flow stays reliable."
          primaryHref="/auth/signup"
          primaryLabel="Join TapCash"
          secondaryHref="/dashboard"
          secondaryLabel="Open dashboard"
          bullets={["Secure auth session", "Offer attribution intact", "Fraud and duplicate protection"]}
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
          <p>Have questions about how our cookies trace your survey clicks?</p>
          <p>
            Contact us directly at{" "}
            <a href="mailto:HELLO@TAPCASH.ONLINE" className="text-emerald-400 hover:underline">
              HELLO@TAPCASH.ONLINE
            </a>
          </p>
        </div>
      </main>
      <Footer />

      <footer className="border-t border-zinc-900 bg-[#080808] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} TapCash. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/" className="hover:text-emerald-500 transition">Dashboard</Link>
            <Link href="/terms" className="hover:text-emerald-500 transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy</Link>
            <Link href="/affiliate" className="hover:text-emerald-500 transition">Affiliates</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
