"use client";

import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function MotionWrap({ children, delay = 0, className = "" }: PropsWithChildren<{ delay?: number; className?: string }>) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageShell({ children, eyebrow, title, description, kicker }: PropsWithChildren<{ eyebrow: string; title: string; description: string; kicker?: ReactNode }>) {
  return (
    <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">{eyebrow}</p>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-[15px]">{description}</p>
        </div>
        {kicker}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-400">{detail}</p>
    </div>
  );
}

export function CTAButton({ href, label, variant = "primary" }: { href: string; label: string; variant?: "primary" | "secondary" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-black transition-colors";
  if (variant === "secondary") {
    return (
      <Link href={href} className={`${base} border border-white/10 bg-white/5 text-white hover:bg-white/10`}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <Link href={href} className={`${base} bg-[#00e6c3] text-[#04101d] hover:bg-[#26edd1]`}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
