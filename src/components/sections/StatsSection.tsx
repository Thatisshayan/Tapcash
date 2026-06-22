'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate, useReducedMotion, useInView } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { stagger, fadeUp } from '@/lib/motion';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  display: string;
}

const STATS: Stat[] = [
  { value: 50000, suffix: '+', label: 'Users active', display: '50,000+' },
  { value: 2.5, suffix: 'M+', label: 'Total paid out', display: '$2.5M+' },
  { value: 98, suffix: '%', label: 'Offer verification rate', display: '98%' },
  { value: 4.8, suffix: '', label: 'User satisfaction', display: '4.8 / 5' },
];

function StatCard({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) {
      if (displayRef.current) displayRef.current.textContent = stat.display;
      return;
    }
    const controls = animate(motionVal, stat.value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate(v) {
        if (!displayRef.current) return;
        if (stat.value < 10) {
          displayRef.current.textContent =
            stat.suffix === ''
              ? `${v.toFixed(1)} / 5`
              : `$${v.toFixed(1)}${stat.suffix}`;
        } else if (stat.value < 100) {
          displayRef.current.textContent = `${Math.floor(v)}${stat.suffix}`;
        } else {
          displayRef.current.textContent = `${Math.floor(v).toLocaleString()}${stat.suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [inView, motionVal, stat, prefersReduced]);

  return (
    <GlassCard variant="elevated" className="p-6 relative">
      <BadgeCheck
        size={16}
        className="absolute top-4 right-4 text-[#00C97F]"
        aria-hidden
      />
      <span
        ref={displayRef}
        className="block text-white"
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '44px',
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: '8px',
        }}
      >
        {stat.display}
      </span>
      <span className="text-[14px] text-white/50">{stat.label}</span>
    </GlassCard>
  );
}

export function StatsSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: '#0e1a15' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          variants={prefersReduced ? undefined : stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14 space-y-3"
        >
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00C97F]"
          >
            By the Numbers
          </motion.p>
          <motion.h2
            variants={prefersReduced ? undefined : fadeUp}
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)' }}
          >
            Numbers that matter.
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
