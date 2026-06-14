'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Wallet, TrendingUp, Lock, ArrowRight } from 'lucide-react';

interface BalanceSummaryProps {
  balance: string;
  balanceUSD: string;
  pending: string;
  pendingDetail: string;
  onContinue?: () => void;
}

export default function BalanceSummaryPremium({
  balance,
  balanceUSD,
  pending,
  pendingDetail,
  onContinue,
}: BalanceSummaryProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Main Balance Card */}
      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -8,
          transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
        }}
        className="group relative"
      >
        {/* Glow Background on Hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#31F06F]/15 via-transparent to-[#18D9FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />

        {/* Card Container */}
        <div className="relative p-8 lg:p-10 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-3xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 overflow-hidden">
          
          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">
                  Available Balance
                </p>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#31F06F] to-[#18D9FF] leading-tight"
                >
                  {balance}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-white/80 mt-2 font-semibold"
                >
                  {balanceUSD}
                </motion.p>
              </div>

              {/* Icon */}
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#31F06F]/20 to-[#18D9FF]/10 flex items-center justify-center border border-white/15"
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Wallet size={32} className="text-[#31F06F]" />
              </motion.div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
              <div>
                <p className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2">
                  Ready to Withdraw
                </p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-black text-[#31F06F]"
                >
                  ✓ Yes
                </motion.p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2">
                  Account Status
                </p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-black text-[#18D9FF]"
                >
                  Verified
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pending & Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Rewards */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -8,
            transition: { duration: 0.3 },
          }}
          className="group relative"
        >
          {/* Glow Background on Hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FFC442]/10 to-[#FF8C42]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

          {/* Card */}
          <div className="relative p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex items-center gap-4">
            
            {/* Icon */}
            <motion.div
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC442]/20 to-[#FF8C42]/10 flex items-center justify-center flex-shrink-0 border border-white/15"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <TrendingUp size={24} className="text-[#FFC442]" />
            </motion.div>

            {/* Content */}
            <div>
              <p className="text-xs text-white/60 uppercase font-semibold tracking-wider mb-1">
                Pending Rewards
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-[#FFC442]"
              >
                {pending}
              </motion.p>
              <p className="text-xs text-white/50 mt-1">{pendingDetail}</p>
            </div>
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -8,
            transition: { duration: 0.3 },
          }}
          className="group relative"
        >
          {/* Glow Background on Hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7C3DFF]/10 to-[#18D9FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

          {/* Card */}
          <div className="relative p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex items-center gap-4">
            
            {/* Icon */}
            <motion.div
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7C3DFF]/20 to-[#18D9FF]/10 flex items-center justify-center flex-shrink-0 border border-white/15"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Lock size={24} className="text-[#7C3DFF]" />
            </motion.div>

            {/* Content */}
            <div>
              <p className="text-xs text-white/60 uppercase font-semibold tracking-wider mb-1">
                Ledger-Backed
              </p>
              <p className="text-sm font-bold text-white mb-1">
                100% Verified
              </p>
              <p className="text-xs text-white/50">Server-approved withdrawals</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4"
      >
        <motion.button
          onClick={onContinue}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#31F06F]/30 transition-all duration-300 border border-white/10"
        >
          Continue to Cashout
          <ArrowRight size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-8 py-4 border border-white/15 bg-gradient-to-r from-white/8 to-white/4 text-white font-semibold rounded-lg hover:border-white/30 hover:bg-gradient-to-r hover:from-white/12 hover:to-white/8 transition-all duration-300 backdrop-blur-sm"
        >
          View Details
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
