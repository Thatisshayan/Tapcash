// src/app/cookies/page.tsx
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ConversionStrip from "@/components/ConversionStrip";
import { Shield, Eye, Lock, FileText, CheckCircle2, RefreshCw, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

import { MotionWrap } from "@/components/PremiumUi";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

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
          <p className="mt-2 text-[rgba(245,243,239,0.5)]">
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
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[rgba(245,243,239,0.5)]">
            <li>
              <strong className="text-[#F5F3EF]">Strictly Necessary &amp; Security:</strong> Required for the base application to function. These allow you to log in via Firebase Authentication and maintain your active wallet. They are also used for browser fingerprinting and multi-account checking, which are essential for maintaining anti-fraud shields.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Task &amp; Postback Conversion:</strong> Used by our offerwall networks (Lootably, HangMyAd, Wyzia) to track when you download a game or start a survey. These cookies match up clicks on our site with callbacks from advertiser servers. Without these, your offer completions cannot be credited.
            </li>
            <li>
              <strong className="text-[#F5F3EF]">Preferences &amp; Analytics:</strong> Remember your interface preferences (such as dark mode preferences and daily spin timings) and help us analyze site traffic anonymously.
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
              <div key={gIdx} className="overflow-hidden" style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}>
                <h4 className="text-xs font-bold text-[#D9B678] uppercase tracking-widest pt-6 pb-2">{group.category}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="text-[rgba(245,243,239,0.4)] font-bold uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
                        <th className="px-2 py-3">Cookie Name</th>
                        <th className="px-2 py-3">Provider</th>
                        <th className="px-2 py-3">Purpose</th>
                        <th className="px-2 py-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.cookies.map((cookie, cIdx) => (
                        <tr key={cIdx} style={{ borderBottom: "1px solid rgba(245,243,239,0.06)" }}>
                          <td className="px-2 py-3 font-mono text-[#D9B678] font-bold">{cookie.name}</td>
                          <td className="px-2 py-3 text-[#F5F3EF] font-medium">{cookie.provider}</td>
                          <td className="px-2 py-3 text-[rgba(245,243,239,0.5)] leading-relaxed min-w-[200px]">{cookie.purpose}</td>
                          <td className="px-2 py-3 text-[rgba(245,243,239,0.4)] font-semibold uppercase">{cookie.duration}</td>
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
          <p className="mt-2 text-[rgba(245,243,239,0.5)]">
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
          <p className="mt-2 text-[rgba(245,243,239,0.5)]">
            Please note that if you choose to fully block or delete all cookies and local storage tokens, your active session on TapCash will be invalidated. Additionally, **our postback link matching will fail to recognize task completions**, meaning you will not receive Coins for completing surveys or downloading applications.
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
            Cookie controls &middot; Offer attribution
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Cookie policy that keeps the funnel measurable and secure.
          </h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)] mb-8">
            We use storage, session tokens, and tracking keys to keep sign-in, offer attribution, and fraud controls working together.
          </p>
          <div className="grid gap-6 sm:grid-cols-3 py-6" style={{ borderTop: "1px solid rgba(245,243,239,0.09)", borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
            {[
              { label: "Tracking scope", value: "Visible and controlled" },
              { label: "Auth", value: "Secure, Firebase-backed" },
              { label: "Match", value: "Reliable, postback-safe" },
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
              Join TapCash <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
              style={{ borderColor: "rgba(245,243,239,0.18)" }}
            >
              Open dashboard
            </a>
          </div>
        </MotionWrap>

        <div className="space-y-4 text-center mt-16 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: GOLD_BRIGHT }}>
            <FileText className="w-3.5 h-3.5" />
            <span>Tracking Disclosures</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F5F3EF] tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-[rgba(245,243,239,0.4)] text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[rgba(245,243,239,0.28)]" />
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
          <p>Have questions about how our cookies trace your survey clicks?</p>
          <p>
            Contact us directly at{" "}
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
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/" className="hover:text-[#D9B678] transition">Dashboard</Link>
            <Link href="/terms" className="hover:text-[#D9B678] transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#D9B678] transition">Privacy</Link>
            <Link href="/affiliate" className="hover:text-[#D9B678] transition">Affiliates</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
