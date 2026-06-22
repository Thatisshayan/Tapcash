'use client';

import { useReducedMotion, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeUp, stagger } from '@/lib/motion';

const METRICS = [
  { label: 'Completion Rate', value: 96 },
  { label: 'Tracking Accuracy', value: 94 },
  { label: 'User Satisfaction', value: 91 },
];

const TIERS = [
  { name: 'Bronze', threshold: '0+', benefit: 'Access to all standard offers', color: '#CD7F32' },
  { name: 'Silver', threshold: '60+', benefit: 'Priority offer queue + faster tracking', color: '#C0C0C0' },
  { name: 'Gold', threshold: '80+', benefit: 'Bonus payouts + early access to premium offers', color: '#FFAB00' },
  { name: 'Platinum', threshold: '95+', benefit: 'Dedicated support + highest payout rates', color: '#E5E4E2' },
];

const SAFETY_POINTS = [
  'Fast payout history',
  'High tracking reliability',
  'No purchase required',
  'Simple to complete',
];

function GaugeChart() {
  const circumference = 2 * Math.PI * 88; // r=88 for 200px diameter viewBox
  const prefersReduced = useReducedMotion();
  const progress = 0.94;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* SVG gauge */}
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg viewBox="0 0 200 200" width="200" height="200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#00C97F"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * (1 - progress) }}
            viewport={{ once: true }}
            transition={prefersReduced ? { duration: 0 } : { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ rotate: -90, transformOrigin: '100px 100px' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-white"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '48px', fontWeight: 700, lineHeight: 1 }}
          >
            94
          </span>
          <span className="text-white/50 text-[12px] mt-1">TapScore™</span>
        </div>
      </div>

      {/* Metric bars */}
      <div className="w-full max-w-xs space-y-4">
        {METRICS.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-white/60">{m.label}</span>
              <span className="text-[#00C97F]" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                {m.value}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#00C97F]"
                initial={{ width: 0 }}
                whileInView={{ width: `${m.value}%` }}
                viewport={{ once: true }}
                transition={prefersReduced ? { duration: 0 } : { duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TapScoreSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={prefersReduced ? undefined : stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 space-y-3"
        >
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00C97F]"
          >
            Trust Score
          </motion.p>
          <motion.h2
            variants={prefersReduced ? undefined : fadeUp}
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)' }}
          >
            Your TapScore reflects how safe an offer is.
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — gauge */}
          <GaugeChart />

          {/* Right — tiers + safety */}
          <div className="space-y-4">
            {TIERS.map((tier) => (
              <GlassCard
                key={tier.name}
                className="p-4 flex items-center gap-4"
                style={{ borderLeft: `2px solid ${tier.color}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12px] font-semibold text-white">{tier.name}</span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: tier.color }}
                    >
                      {tier.threshold}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/50 truncate">{tier.benefit}</p>
                </div>
              </GlassCard>
            ))}

            {/* Safety points */}
            <div className="pt-4 space-y-3">
              <p className="text-[13px] font-medium text-white/70">What makes an offer safe?</p>
              {SAFETY_POINTS.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(0,201,127,0.15)' }}
                  >
                    <Check size={11} className="text-[#00C97F]" />
                  </div>
                  <span className="text-[13px] text-white/60">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TapScoreSection;
