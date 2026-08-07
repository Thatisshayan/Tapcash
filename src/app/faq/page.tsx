"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { tapCashFaqs } from "@shared/tapcash-content";
import { ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
                FAQ
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Frequently asked questions</h1>
              <p className="text-base text-[rgba(245,243,239,0.68)]">Quick answers to the most common questions about TapCash.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GOLD_BRIGHT }}>
              <Sparkles className="w-3.5 h-3.5" />
              {tapCashFaqs.length} questions
            </div>
          </div>
        </MotionWrap>

        <div>
          {tapCashFaqs.map((faq, i) => {
            const isOpen = open === faq.question;
            return (
              <MotionWrap key={faq.question} delay={i * 0.06}>
                <div style={{ borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : faq.question)}
                    className="w-full flex items-center justify-between gap-4 text-left py-5"
                  >
                    <span className="text-sm font-bold">{faq.question}</span>
                    <ChevronDown
                      size={16}
                      className="shrink-0 transition-transform duration-200"
                      style={{ color: isOpen ? GOLD : "rgba(245,243,239,0.3)", transform: isOpen ? "rotate(180deg)" : undefined }}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm text-[rgba(245,243,239,0.5)] leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </MotionWrap>
            );
          })}
        </div>

        <MotionWrap className="mt-14 text-center">
          <p className="text-sm text-[rgba(245,243,239,0.3)] mb-4">Didn&apos;t find your answer?</p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
          >
            Contact support
          </Link>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
