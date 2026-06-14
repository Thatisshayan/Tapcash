'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface CashoutFormProps {
  maxAmount: number;
  minAmount: number;
  onSubmit?: (amount: number) => void;
  isLoading?: boolean;
}

export default function CashoutFormPremium({
  maxAmount,
  minAmount,
  onSubmit,
  isLoading = false,
}: CashoutFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setError('');

    if (value && !isNaN(Number(value))) {
      const numValue = Number(value);
      if (numValue < minAmount) {
        setError(`Minimum amount is ${minAmount} coins`);
      } else if (numValue > maxAmount) {
        setError(`Maximum amount is ${maxAmount} coins`);
      }
    }
  };

  const handleQuickSelect = (percent: number) => {
    const quickAmount = Math.floor((maxAmount * percent) / 100);
    setAmount(quickAmount.toString());
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    const numAmount = Number(amount);
    if (numAmount < minAmount) {
      setError(`Minimum amount is ${minAmount} coins`);
      return;
    }
    if (numAmount > maxAmount) {
      setError(`Maximum amount is ${maxAmount} coins`);
      return;
    }

    setSubmitted(true);
    onSubmit?.(numAmount);
  };

  const isValid = amount && !isNaN(Number(amount)) && Number(amount) >= minAmount && Number(amount) <= maxAmount;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold text-white mb-2">Request Payout</h2>
        <p className="text-white/60">Enter the amount you want to withdraw from your balance</p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Amount Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white">
            Withdrawal Amount
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold text-lg">
              💰
            </div>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount in coins"
              min={minAmount}
              max={maxAmount}
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white placeholder-white/40 font-bold text-lg focus:outline-none focus:border-[#31F06F]/50 focus:ring-2 focus:ring-[#31F06F]/20 transition-all duration-300"
            />
          </div>

          {/* Amount Info */}
          <div className="flex items-center justify-between text-xs text-white/60 px-1">
            <span>Min: {minAmount} coins</span>
            <span>Max: {maxAmount} coins</span>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Quick Select</p>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <motion.button
                key={percent}
                type="button"
                onClick={() => handleQuickSelect(percent)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="py-2 px-3 rounded-lg border border-white/15 bg-white/5 text-white font-semibold text-sm hover:border-white/30 hover:bg-white/10 transition-all duration-300"
              >
                {percent}%
              </motion.button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/10 backdrop-blur-sm"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}

        {/* Summary */}
        {isValid && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg border border-[#31F06F]/30 bg-[#31F06F]/10 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/70">Withdrawal Summary</span>
              <CheckCircle size={18} className="text-[#31F06F]" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Amount</span>
                <span className="font-bold text-white">{Number(amount).toLocaleString()} coins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Processing Fee</span>
                <span className="font-bold text-white">0 coins</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                <span className="font-semibold text-white">You'll Receive</span>
                <span className="text-lg font-black text-[#31F06F]">
                  {Number(amount).toLocaleString()} coins
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-lg border border-white/10 bg-white/[0.05]"
        >
          <p className="text-xs text-white/60 leading-relaxed">
            By requesting a payout, you confirm that:
            <br />
            • Your balance is accurate and verified
            <br />
            • You have completed all necessary verification steps
            <br />
            • You understand the payout timeline for your selected method
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isValid || isLoading}
          whileHover={isValid && !isLoading ? { scale: 1.05 } : {}}
          whileTap={isValid && !isLoading ? { scale: 0.95 } : {}}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold transition-all duration-300 border ${
            isValid && !isLoading
              ? 'bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-white border-white/10 hover:shadow-lg hover:shadow-[#31F06F]/30'
              : 'bg-white/10 text-white/50 border-white/15 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Request Payout
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Info Box */}
      <motion.div
        variants={itemVariants}
        className="p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl backdrop-blur-xl"
      >
        <h3 className="font-bold text-white mb-3">Processing Information</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-[#31F06F] font-bold mt-0.5">✓</span>
            <span>All payouts are processed within 1-5 business days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#31F06F] font-bold mt-0.5">✓</span>
            <span>Your balance is verified server-side before processing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#31F06F] font-bold mt-0.5">✓</span>
            <span>You'll receive a confirmation email with tracking details</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
