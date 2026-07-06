"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { tapCashFaqs } from "@shared/tapcash-content";
import { MotionWrap } from "@/components/PremiumUi";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-[#040913] py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <MotionWrap>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#18d9ff]">FAQ</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Got questions?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-zinc-400">
              Everything you need to know about earning and cashing out on TapCash.
            </p>
          </div>
        </MotionWrap>

        <div className="mt-10 space-y-2">
          {tapCashFaqs.slice(0, 6).map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <MotionWrap key={faq.question} delay={i * 0.04}>
                <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-colors hover:border-white/12">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-bold text-white sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/6 px-5 pb-4 pt-3">
                      <p className="text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
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
