"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

type ConversionStripProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  bullets?: string[];
  variant?: "public" | "private";
};

export default function ConversionStrip({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  bullets = [],
  variant = "public",
}: ConversionStripProps) {
  const dark = variant === "private";

  return (
    <section className="py-10" style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: GOLD_BRIGHT }}
          >
            {dark ? <ShieldCheck className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {eyebrow}
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h2>
            <p className="text-sm md:text-base text-[rgba(245,243,239,0.5)] leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
          >
            {primaryLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
              style={{ borderColor: "rgba(245,243,239,0.18)" }}
            >
              {secondaryLabel}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {!!bullets.length && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {bullets.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
              <p className="text-sm text-[rgba(245,243,239,0.68)] font-medium leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
