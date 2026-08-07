"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { User, Wallet, Shield, FileText, ArrowRight } from "lucide-react";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

const TOPICS = [
  { icon: User, title: "Account & Profile", description: "Sign up, verify email, manage your profile.", href: "/faq" },
  { icon: Wallet, title: "Earning Coins", description: "How offers work, completion tracking, and tips.", href: "/how-it-works" },
  { icon: Shield, title: "Payouts & Cashout", description: "Minimums, methods, timelines, and troubleshooting.", href: "/cashout" },
  { icon: FileText, title: "Policies", description: "Privacy, terms, cookies, and affiliate policy.", href: "/privacy" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
            Help center
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">How can we help?</h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)]">
            Find answers to common questions and learn how to use TapCash.
          </p>
        </MotionWrap>

        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 mt-14">
          {TOPICS.map((topic) => (
            <MotionWrap key={topic.title} delay={0.05}>
              <Link href={topic.href} className="flex items-start gap-4 group">
                <topic.icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
                <div className="flex-1">
                  <h3 className="text-sm font-bold">{topic.title}</h3>
                  <p className="mt-0.5 text-xs text-[rgba(245,243,239,0.4)]">{topic.description}</p>
                </div>
                <ArrowRight size={14} className="text-[rgba(245,243,239,0.2)] shrink-0 mt-0.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-16 text-center">
          <div style={{ borderTop: "1px solid rgba(245,243,239,0.09)", paddingTop: "3.5rem" }}>
            <h3 className="text-lg font-bold">Still need help?</h3>
            <p className="mt-1 text-sm text-[rgba(245,243,239,0.5)]">Our support team is available 9am–5pm PST, Monday–Friday.</p>
            <div className="mt-6 inline-flex gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
              >
                Contact us
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
                style={{ borderColor: "rgba(245,243,239,0.18)" }}
              >
                View FAQ
              </Link>
            </div>
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
