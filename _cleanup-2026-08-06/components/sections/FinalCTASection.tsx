'use client';

import { useReducedMotion, motion } from 'framer-motion';
import Link from 'next/link';
import { scaleIn } from '@/lib/motion';

export function FinalCTASection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: '#0a0f0d' }}
    >
      {/* Mesh background — same as hero */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,201,127,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 100%, rgba(0,245,155,0.04) 0%, transparent 60%)',
            animation: prefersReduced ? undefined : 'hueShift 12s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          variants={prefersReduced ? undefined : scaleIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-6"
        >
          <h2
            className="font-bold text-white"
            style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
            }}
          >
            Start earning in 60 seconds.
          </h2>
          <p className="text-lg text-white/50">No credit card. No catch. Cancel anytime.</p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 rounded-xl bg-[#00C97F] text-[#0a0f0d] font-semibold text-base hover:scale-[1.02] hover:bg-[#00F59B] transition-all focus-visible:ring-2 focus-visible:ring-[#00C97F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f0d] outline-none"
            style={{ boxShadow: '0 0 24px rgba(0,201,127,0.35)' }}
          >
            Create free account
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTASection;
