"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { Card } from "@/components/ui/Card";
import { User, Wallet, Shield, FileText, ArrowRight } from "lucide-react";

const TOPICS = [
  { icon: User, title: "Account & Profile", description: "Sign up, verify email, manage your profile.", href: "/faq" },
  { icon: Wallet, title: "Earning Coins", description: "How offers work, completion tracking, and tips.", href: "/how-it-works" },
  { icon: Shield, title: "Payouts & Cashout", description: "Minimums, methods, timelines, and troubleshooting.", href: "/cashout" },
  { icon: FileText, title: "Policies", description: "Privacy, terms, cookies, and affiliate policy.", href: "/privacy" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="Help center"
            title="How can we help?"
            description="Find answers to common questions and learn how to use TapCash."
          />
        </MotionWrap>

        <div className="grid gap-4 sm:grid-cols-2 mt-10">
          {TOPICS.map((topic) => (
            <MotionWrap key={topic.title} delay={0.05}>
              <Link href={topic.href}>
                <Card variant="interactive" className="flex items-start gap-4 h-full">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center shrink-0">
                    <topic.icon className="w-5 h-5 text-[#18D9FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{topic.title}</h3>
                    <p className="mt-0.5 text-xs text-white/40">{topic.description}</p>
                  </div>
                  <ArrowRight size={14} className="text-white/20 shrink-0" />
                </Card>
              </Link>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-12">
          <Card variant="elevated" className="text-center">
            <h3 className="text-base font-bold text-white">Still need help?</h3>
            <p className="mt-1 text-sm text-white/50">Our support team is available 9am–5pm PST, Monday–Friday.</p>
            <div className="mt-4 inline-flex gap-3">
              <CTAButton href="/contact" label="Contact us" />
              <CTAButton href="/faq" label="View FAQ" variant="secondary" />
            </div>
          </Card>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
