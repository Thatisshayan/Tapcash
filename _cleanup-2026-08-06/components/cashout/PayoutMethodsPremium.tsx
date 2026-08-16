'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { CheckCircle, Clock, DollarSign, Gift, Zap, Shield } from 'lucide-react';

interface PayoutMethod {
  id: string;
  label: string;
  subtitle: string;
  audience: string;
  minAmount: string;
  eta: string;
  icon: 'dollar' | 'gift' | 'zap';
  color: string;
  features: string[];
  recommended?: boolean;
}

interface PayoutMethodsProps {
  methods: PayoutMethod[];
  selectedMethod?: string;
  onSelectMethod?: (methodId: string) => void;
}

const iconMap = {
  dollar: DollarSign,
  gift: Gift,
  zap: Zap,
};

export default function PayoutMethodsPremium({
  methods,
  selectedMethod,
  onSelectMethod,
}: PayoutMethodsProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Payout Methods</h2>
        <p className="text-white/60">Choose how you want to receive your earnings</p>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method, index) => {
          const Icon = iconMap[method.icon];
          const isSelected = selectedMethod === method.id;

          return (
            <motion.div
              key={method.id}
              variants={itemVariants}
              whileHover={{
                y: -12,
                transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
              }}
              onClick={() => onSelectMethod?.(method.id)}
              className={`group relative cursor-pointer ${isSelected ? 'ring-2 ring-[#31F06F]' : ''}`}
            >
              {/* Glow Background on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

              {/* Card Container */}
              <div className={`relative h-full p-6 border ${isSelected ? 'border-[#31F06F]/50 bg-[#31F06F]/5' : 'border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02]'} rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col`}>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
                </div>

                {/* Recommended Badge */}
                {method.recommended && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                    className="absolute -top-3 right-6 z-10"
                  >
                    <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#31F06F] to-[#18D9FF] px-3 py-1.5 shadow-lg shadow-[#31F06F]/40 border border-white/20">
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Recommended
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Header */}
                <div className="relative z-10 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/15 group-hover:border-white/25 transition-all duration-300"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon size={24} style={{ color: method.color }} strokeWidth={1.5} />
                    </motion.div>
                    {isSelected && (
                      <CheckCircle size={24} className="text-[#31F06F]" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#31F06F] transition-colors duration-300">
                    {method.label}
                  </h3>
                  <p className="text-sm text-white/60">{method.subtitle}</p>
                </div>

                {/* Audience Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10 inline-flex w-fit px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm mb-4"
                >
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    {method.audience}
                  </span>
                </motion.div>

                {/* Features */}
                <div className="relative z-10 space-y-2 mb-6 flex-1">
                  {method.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-[#31F06F] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60 uppercase font-semibold tracking-wider">Minimum</span>
                    <span className="font-bold text-white">{method.minAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/60 uppercase font-semibold tracking-wider">
                      <Clock size={14} />
                      Timing
                    </div>
                    <span className="font-bold text-white">{method.eta}</span>
                  </div>
                </div>

                {/* Select Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative z-10 mt-6 w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-white shadow-lg shadow-[#31F06F]/30'
                      : 'border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Method'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl backdrop-blur-xl"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#7C3DFF]/20 flex items-center justify-center flex-shrink-0 border border-white/15">
            <Shield size={20} className="text-[#7C3DFF]" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">All Payouts Are Secure</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Every withdrawal is verified server-side and ledger-backed. We never process payments without confirming your balance and eligibility. Your account is protected with industry-standard security.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
