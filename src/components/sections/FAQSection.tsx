"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { tapCashFaqs } from "@shared/tapcash-content";
import { MotionWrap } from "@/components/PremiumUi";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-20" style={{ backgroundColor: "#0A0A0D" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <MotionWrap>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_BRIGHT }}>FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#F5F3EF] sm:text-4xl">
              Got questions?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-[rgba(245,243,239,0.5)]">
              Everything you need to know about earning and cashing out on TapCash.
            </p>
          </div>
        </MotionWrap>

        <div className="mt-10">
          {tapCashFaqs.slice(0, 6).map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <MotionWrap key={faq.question} delay={i * 0.04}>
                <div style={{ borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="text-sm font-bold text-[#F5F3EF] sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 transition-transform duration-200"
                      style={{ color: isOpen ? GOLD : "rgba(245,243,239,0.4)", transform: isOpen ? "rotate(180deg)" : undefined }}
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-4">
                      <p className="text-sm leading-relaxed text-[rgba(245,243,239,0.5)]">{faq.answer}</p>
                    </div>
                  )}
                </div>
              </MotionWrap>
            );
          })}
        </div>
      </div>
    </section>
  );
}
