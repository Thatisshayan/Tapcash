"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { Card } from "@/components/ui/Card";
import { tapCashFaqs } from "@shared/tapcash-content";
import { ChevronDown, Sparkles } from "lucide-react";

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Quick answers to the most common questions about TapCash."
            kicker={
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                <Sparkles className="w-3.5 h-3.5" />
                {tapCashFaqs.length} questions
              </div>
            }
          />
        </MotionWrap>

        <div className="mt-10 space-y-3">
          {tapCashFaqs.map((faq, i) => {
            const isOpen = open === faq.question;
            return (
              <MotionWrap key={faq.question} delay={i * 0.06}>
                <Card variant="default" className="overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : faq.question)}
                    className="w-full flex items-center justify-between gap-4 text-left"
                  >
                    <span className="text-sm font-bold text-white">{faq.question}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-white/30 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-200 ${
                      isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm text-white/50 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </Card>
              </MotionWrap>
            );
          })}
        </div>

        <MotionWrap className="mt-12 text-center">
          <p className="text-sm text-white/30 mb-3">Didn&apos;t find your answer?</p>
          <CTAButton href="/contact" label="Contact support" />
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
