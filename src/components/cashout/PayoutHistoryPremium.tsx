'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { CheckCircle, Clock, XCircle, ArrowUpRight, Calendar, DollarSign } from 'lucide-react';

interface PayoutRecord {
  id: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  estimatedDate?: string;
  reference?: string;
}

interface PayoutHistoryProps {
  payouts: PayoutRecord[];
  emptyMessage?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: '#31F06F',
    bg: 'from-[#31F06F]/10 to-[#31F06F]/5',
    border: 'border-[#31F06F]/30',
    label: 'Completed',
  },
  pending: {
    icon: Clock,
    color: '#FFC442',
    bg: 'from-[#FFC442]/10 to-[#FFC442]/5',
    border: 'border-[#FFC442]/30',
    label: 'Pending',
  },
  failed: {
    icon: XCircle,
    color: '#FF6B6B',
    bg: 'from-[#FF6B6B]/10 to-[#FF6B6B]/5',
    border: 'border-[#FF6B6B]/30',
    label: 'Failed',
  },
};

export default function PayoutHistoryPremium({
  payouts,
  emptyMessage = 'No payout history yet. Complete offers and request a withdrawal to get started.',
}: PayoutHistoryProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Payout History</h2>
        <p className="text-white/60">Track all your previous withdrawals and their status</p>
      </div>

      {payouts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <DollarSign size={32} className="text-white/40" />
          </div>
          <p className="text-white font-semibold mb-2">No Payouts Yet</p>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            {emptyMessage}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {payouts.map((payout, index) => {
            const config = statusConfig[payout.status];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={payout.id}
                variants={itemVariants}
                whileHover={{
                  x: 8,
                  transition: { duration: 0.3 },
                }}
                className="group relative"
              >
                {/* Glow Background on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />

                {/* Payout Row */}
                <div className={`relative p-4 border ${config.border} bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex items-center justify-between gap-4 overflow-hidden`}>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
                  </div>

                  {/* Left: Status & Details */}
                  <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0">
                    {/* Status Icon */}
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0 border border-white/15"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StatusIcon size={24} style={{ color: config.color }} strokeWidth={1.5} />
                    </motion.div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white truncate">
                          {payout.method}
                        </p>
                        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider flex-shrink-0">
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Calendar size={12} />
                        <span>{payout.date}</span>
                        {payout.estimatedDate && payout.status === 'pending' && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/30" />
                            <span>Est. {payout.estimatedDate}</span>
                          </>
                        )}
                        {payout.reference && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/30" />
                            <span className="font-mono text-xs">Ref: {payout.reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <motion.div
                    className="relative z-10 flex-shrink-0 text-right"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <ArrowUpRight size={16} style={{ color: config.color }} />
                      <span
                        className="text-lg font-black"
                        style={{
                          color: config.color,
                        }}
                      >
                        -{payout.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/50">coins</p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Info Section */}
      {payouts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl backdrop-blur-xl"
        >
          <h3 className="font-bold text-white mb-3">Understanding Your Payouts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
            <div>
              <p className="font-semibold text-white mb-1">✓ Completed</p>
              <p>Funds have been transferred to your account</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">⏱️ Pending</p>
              <p>Payout is being processed and verified</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">✗ Failed</p>
              <p>Payout was unsuccessful. Contact support for help</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
