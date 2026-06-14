"use client";

import { motion, type Variants } from 'framer-motion';
import { CreditCard, Gift, Bitcoin, Banknote, TrendingUp } from 'lucide-react';

interface WithdrawMethod {
  id: string;
  label: string;
  iconColor: string;
}

interface BalanceCardProps {
  balance: number;
  growthPercent: number;
  pointsToWithdraw: number;
  currentAmount: number;
  targetAmount: number;
  withdrawMethods?: WithdrawMethod[];
}

export default function BalanceCard({ 
  balance, 
  growthPercent, 
  pointsToWithdraw, 
  currentAmount, 
  targetAmount,
  withdrawMethods = [
    { id: 'paypal', label: 'PayPal', iconColor: '#31F06F' },
    { id: 'giftcard', label: 'Gift Card', iconColor: '#18D9FF' },
    { id: 'crypto', label: 'Crypto', iconColor: '#FFC442' },
    { id: 'bank', label: 'Bank', iconColor: '#7C3DFF' }
  ]
}: BalanceCardProps) {
  const progress = (currentAmount / targetAmount) * 100;
  
  const icons = {
    paypal: CreditCard,
    giftcard: Gift,
    crypto: Bitcoin,
    bank: Banknote
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } satisfies Variants;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  } satisfies Variants;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="card-elevated rounded-2xl p-6 space-y-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <span className="uppercase text-[#B9C5DF] text-xs font-extrabold tracking-wide">
          Your Balance
        </span>
      </motion.div>

      {/* Balance Amount */}
      <motion.div variants={itemVariants} className="space-y-2">
        <motion.strong
          className="block text-5xl font-black text-[#31F06F]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          ${balance.toFixed(2)}
        </motion.strong>
        
        {/* Growth Indicator */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 text-sm text-[#31F06F] font-bold"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp size={16} />
          </motion.div>
          <span>+{growthPercent}% today</span>
        </motion.div>
      </motion.div>

      {/* Progress Section */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="relative model-u-progress-bar h-2 rounded-full overflow-hidden">
          <motion.i
            className="model-u-progress-fill absolute top-0 left-0 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ delay: 0.4, duration: 1.2 }}
          />
        </div>
        
        {/* Progress Labels */}
        <div className="flex justify-between items-center text-xs text-[#C1C9DD]">
          <span>
            <strong className="text-white">{pointsToWithdraw}</strong> pts to withdraw
          </span>
          <span className="text-white font-bold">
            ${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}
          </span>
        </div>
      </motion.div>

      {/* Withdraw Methods */}
      <motion.div variants={itemVariants} className="space-y-2">
        <p className="text-xs text-[#9AA8C6] font-semibold uppercase tracking-wide">
          Withdraw via
        </p>
        <div className="grid grid-cols-4 gap-2">
          {withdrawMethods.map((method, idx) => {
            const Icon = icons[method.id as keyof typeof icons] || CreditCard;
            return (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.08, duration: 0.3 }}
                whileHover={{ scale: 1.08, borderColor: method.iconColor }}
                whileTap={{ scale: 0.95 }}
                className="h-12 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--model-u-line)] flex items-center justify-center transition-all hover:bg-[rgba(255,255,255,0.06)]"
                title={method.label}
              >
                <Icon size={18} style={{ color: method.iconColor }} />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        variants={itemVariants}
        className="w-full model-u-gradient-cyan-purple border-0 rounded-lg text-white py-3 font-bold text-sm mt-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Cash Out Now
      </motion.button>
    </motion.div>
  );
}
