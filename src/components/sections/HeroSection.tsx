'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, BarChart3, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DashboardMockup } from '@/components/ui/DashboardMockup';
import { fadeUp, stagger, wordReveal } from '@/lib/motion';

function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,201,127,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(0,245,155,0.05) 0%, transparent 60%)',
          animation: 'hueShift 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 60% 40%, rgba(255,171,0,0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}

function EarningsCounter() {
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const target = 2547382;
    if (prefersReduced) {
      if (displayRef.current) displayRef.current.textContent = `$${target.toLocaleString()} paid out`;
      return;
    }
    const controls = animate(motionVal, target, {
      duration: 2.5,
      ease: 'easeOut',
      onUpdate(v) {
        if (displayRef.current) {
          displayRef.current.textContent = `$${Math.floor(v).toLocaleString()} paid out`;
        }
      },
    });
    return () => controls.stop();
  }, [motionVal, prefersReduced]);

  return (
    <span
      ref={displayRef}
      className="text-[#00C97F]"
      style={{
        fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
        fontSize: '48px',
        fontWeight: 700,
        lineHeight: 1,
        animation: prefersReduced ? undefined : 'earningsPulse 4s ease-in-out infinite',
      }}
    >
      $0 paid out
    </span>
  );
}

const HEADLINE_LINES = ['Play games.', 'Earn cash.', 'Cash out cleanly.'];

function WordSplitHeadline() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.h1
      variants={prefersReduced ? undefined : stagger}
      initial="hidden"
      animate="show"
      className="font-bold leading-[1.05] tracking-tight text-white"
      style={{
        fontFamily: 'var(--font-syne), Syne, sans-serif',
        fontSize: 'clamp(40px, 6vw, 72px)',
      }}
    >
      {HEADLINE_LINES.map((line, li) => (
        <span key={li} className="block">
          {line.split(' ').map((word, wi) => (
            <motion.span
              key={wi}
              variants={prefersReduced ? undefined : wordReveal}
              style={{ display: 'inline-block', marginRight: '0.28em' }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
}

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Verified Offers' },
  { icon: BarChart3, label: 'Ledger-Backed' },
  { icon: Clock, label: '24/7 Tracking' },
];

function FloatingDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      style={prefersReduced ? undefined : { y }}
      className="w-full max-w-sm mx-auto"
    >
      <DashboardMockup
        className="max-w-sm"
        style={prefersReduced ? undefined : { animation: 'float 6s ease-in-out infinite' }}
      />
    </motion.div>
  );
}

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center py-24 lg:py-32">
      <MeshBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — copy */}
          <motion.div
            variants={prefersReduced ? undefined : stagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <WordSplitHeadline />

            <motion.p
              variants={prefersReduced ? undefined : fadeUp}
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Verified offers. A transparent ledger. Real payouts — with a clear path from play to payout.
            </motion.p>

            {/* Earnings counter */}
            <motion.div variants={prefersReduced ? undefined : fadeUp}>
              <EarningsCounter />
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={prefersReduced ? undefined : fadeUp}
              className="flex flex-wrap gap-2"
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-white/70 bg-white/[0.05] rounded-full px-3 py-1"
                >
                  <Icon size={13} className="text-[#00C97F]" />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={prefersReduced ? undefined : fadeUp}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00C97F] text-[#0a0f0d] font-semibold text-sm hover:scale-[1.02] hover:bg-[#00F59B] transition-all focus-visible:ring-2 focus-visible:ring-[#00C97F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f0d] outline-none"
                style={{ boxShadow: '0 0 24px rgba(0,201,127,0.35)' }}
              >
                Start earning free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white/90 border border-white/[0.08] hover:border-white/[0.15] transition-all focus-visible:ring-2 focus-visible:ring-[#00C97F] outline-none"
              >
                See how it works
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={prefersReduced ? undefined : fadeUp}
              className="flex flex-wrap gap-4 items-center text-[13px] text-white/50"
              style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
            >
              <span>50K+ users</span>
              <span className="text-white/20">·</span>
              <span>$2.5M+ paid</span>
              <span className="text-white/20">·</span>
              <span>98% verified</span>
            </motion.div>
          </motion.div>

          {/* Right — dashboard mockup */}
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <FloatingDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
