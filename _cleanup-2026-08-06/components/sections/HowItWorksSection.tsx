'use client';

import { useReducedMotion, motion } from 'framer-motion';
import { Search, Activity, Clock, CheckCircle, Banknote } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

const STEPS = [
  { icon: Search, title: 'Choose an offer', desc: 'Browse verified offers sorted by payout and reliability.' },
  { icon: Activity, title: 'We track it live', desc: 'Every action logged to your ledger in real time.' },
  { icon: Clock, title: 'Reward pending', desc: 'Offer partner confirms completion — usually within 24 hrs.' },
  { icon: CheckCircle, title: 'Approved', desc: 'TapScore verified. Balance updated. Ready to cash out.' },
  { icon: Banknote, title: 'Paid to you', desc: 'Transfer to PayPal, Interac, or gift card — your choice.' },
];

const TIMELINE = [
  { label: 'Complete offer', time: '5–15 min' },
  { label: 'Verification', time: '1–24 hrs' },
  { label: 'Approval', time: '1–48 hrs' },
  { label: 'Payout', time: '1–5 days' },
];

export function HowItWorksSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: '#0e1a15' }}>
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
            The Process
          </motion.p>
          <motion.h2
            variants={prefersReduced ? undefined : fadeUp}
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)' }}
          >
            From offer to cash — every step tracked.
          </motion.h2>
        </motion.div>

        {/* Steps — desktop horizontal, mobile vertical */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 items-start lg:items-stretch">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex lg:flex-col flex-1 group">
                  {/* Step block */}
                  <motion.div
                    initial={prefersReduced ? undefined : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex lg:flex-col items-start gap-4 p-5 flex-1"
                  >
                    {/* Number + icon */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#00C97F] shrink-0"
                        style={{ border: '1px solid rgba(0,201,127,0.3)', backgroundColor: 'rgba(0,201,127,0.06)' }}
                      >
                        {i + 1}
                      </div>
                      <Icon size={18} className="text-[#00C97F] lg:hidden" />
                    </div>
                    <Icon size={20} className="text-[#00C97F] hidden lg:block mt-1" />

                    <div className="space-y-1">
                      <p className="text-[15px] font-medium text-white">{step.title}</p>
                      <p className="text-[13px] text-white/50 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>

                  {/* Connector */}
                  {i < STEPS.length - 1 && (
                    <>
                      {/* Desktop horizontal connector */}
                      <div className="hidden lg:block self-start mt-[22px] flex-shrink-0 w-px lg:w-auto lg:h-px">
                        <motion.svg
                          width="40"
                          height="2"
                          viewBox="0 0 40 2"
                          className="overflow-visible"
                          initial={prefersReduced ? undefined : { opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                        >
                          <motion.line
                            x1="0"
                            y1="1"
                            x2="40"
                            y2="1"
                            stroke="rgba(0,201,127,0.3)"
                            strokeWidth="1.5"
                            strokeDasharray="40"
                            initial={prefersReduced ? undefined : { strokeDashoffset: 40 }}
                            whileInView={{ strokeDashoffset: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 + 0.3, duration: 0.6 }}
                          />
                        </motion.svg>
                      </div>
                      {/* Mobile vertical connector */}
                      <div
                        className="lg:hidden absolute left-[22px] ml-0 w-px bg-gradient-to-b from-[#00C97F]/20 to-transparent"
                        style={{ height: '40px', top: `${(i + 1) * 100}%` }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline — desktop only */}
        <div className="hidden lg:flex gap-0 mt-8 border-t border-white/[0.05] pt-6">
          {TIMELINE.map((item, i) => (
            <div key={item.label} className="flex-1 px-5 border-r border-white/[0.05] last:border-0">
              <p className="text-[12px] text-white/40 mb-1">{item.label}</p>
              <p
                className="text-[13px] text-[#00C97F] font-medium"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {item.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
