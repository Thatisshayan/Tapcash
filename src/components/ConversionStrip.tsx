"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";

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
    <section className={`tap-card rounded-[2rem] p-5 md:p-6 ${dark ? "bg-[#08101f]" : ""}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full tap-badge text-[10px] font-black uppercase tracking-[0.28em] text-zinc-300">
            {dark ? <ShieldCheck className="w-3.5 h-3.5 text-[#00e6c3]" /> : <Sparkles className="w-3.5 h-3.5 text-[#00e6c3]" />}
            {eyebrow}
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white font-display">{title}</h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-5 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
          >
            {primaryLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full tap-badge px-5 py-3.5 text-sm font-bold text-zinc-200 hover:text-white"
            >
              {secondaryLabel}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {!!bullets.length && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {bullets.map((item) => (
            <div key={item} className="rounded-2xl bg-white/4 border border-white/6 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#00e6c3] shrink-0" />
              <p className="text-sm text-zinc-200 font-medium leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
