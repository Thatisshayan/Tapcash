'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Gamepad2, Target, CheckCircle2, Wallet, ArrowRight } from 'lucide-react';
import { cashPathSteps } from '@/styles/theme';

const iconMap = {
  gamepad: Gamepad2,
  target: Target,
  check: CheckCircle2,
  wallet: Wallet,
};

export default function CashPathLivePremium() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <section className="model-u-page mt-16 lg:mt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-gradient-to-r from-white/8 to-white/4 backdrop-blur-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-[#31F06F] animate-pulse" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Transparent Process</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
          Your Cashout Flow
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          From offer selection to cash in your pocket—transparent, tracked, and secure. Every step verified.
        </p>
      </motion.div>

      {/* Step-by-Step Flow */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cashPathSteps.map(({ step, title, text, icon }, index) => {
            const Icon = iconMap[icon as keyof typeof iconMap] || Gamepad2;
            const isLast = index === cashPathSteps.length - 1;
            
            return (
              <motion.div
                key={step}
                variants={itemVariants}
                className="relative group"
              >
                {/* Connecting Arrow (hidden on mobile, visible on larger screens) */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-[#18D9FF] to-transparent -translate-y-1/2 z-10" />
                )}

                {/* Card */}
                <div className="relative h-full p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
                  
                  {/* Glow on Hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#18D9FF]/10 via-transparent to-[#7C3DFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

                  {/* Step Number Badge */}
                  <motion.div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#31F06F] to-[#18D9FF] flex items-center justify-center mb-4 font-black text-white text-sm shadow-lg shadow-[#31F06F]/40 border border-white/20"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.3 }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7C3DFF]/20 to-[#18D9FF]/10 flex items-center justify-center mb-4 border border-white/10 group-hover:border-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon size={32} className="text-[#18D9FF]" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-black text-white mb-2 text-lg group-hover:text-[#31F06F] transition-colors duration-300">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed mb-4 flex-1">
                    {text}
                  </p>

                  {/* Timeline indicator */}
                  <div className="w-full h-1 bg-gradient-to-r from-[#31F06F]/0 via-[#31F06F] to-[#31F06F]/0 rounded-full mt-auto" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Timeline Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mb-16"
      >
        <div className="relative p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Glow Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#31F06F]/5 via-transparent to-[#18D9FF]/5 rounded-2xl -z-10" />

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-6">Typical Timeline</h3>
            
            <div className="space-y-4">
              {[
                { label: 'Complete Offer', time: '5-15 min', icon: '✓' },
                { label: 'Verification', time: '1-24 hours', icon: '⏱️' },
                { label: 'Approval', time: '1-48 hours', icon: '✓' },
                { label: 'Payout', time: '1-5 business days', icon: '💰' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#31F06F] to-[#18D9FF] flex items-center justify-center text-white font-bold text-sm">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-white/50">{item.time}</p>
                  </div>
                  {idx < 3 && (
                    <ArrowRight size={16} className="text-white/30" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-center"
      >
        <p className="text-white/60 text-sm mb-6">
          Every step is tracked and verified. No hidden fees. No surprises.
        </p>
        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg border border-white/15 bg-gradient-to-r from-white/8 to-white/4 backdrop-blur-sm">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Ledger-backed balances</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Verified provider tracking</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Secure payouts</span>
        </div>
      </motion.div>
    </section>
  );
}
