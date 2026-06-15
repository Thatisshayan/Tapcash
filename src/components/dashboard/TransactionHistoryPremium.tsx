'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  method?: string;
  timestamp: string;
  description: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  filter?: string;
  onFilterChange?: (filter: string) => void;
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
  rejected: {
    icon: XCircle,
    color: '#FF6B6B',
    bg: 'from-[#FF6B6B]/10 to-[#FF6B6B]/5',
    border: 'border-[#FF6B6B]/30',
    label: 'Rejected',
  },
};

export default function TransactionHistoryPremium({
  transactions,
  filter = 'all',
  onFilterChange,
}: TransactionHistoryProps) {
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

  const filters = ['all', 'completed', 'pending', 'rejected'];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <Filter size={18} className="text-white/60 flex-shrink-0" />
        <div className="flex gap-2">
          {filters.map((f) => (
            <motion.button
              key={f}
              onClick={() => onFilterChange?.(f)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                filter === f
                  ? 'bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-[#050813] shadow-lg shadow-[#31F06F]/30'
                  : 'bg-white/10 border border-white/15 text-white/70 hover:border-white/30 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 px-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <ArrowUpRight size={32} className="text-white/40" />
          </div>
          <p className="text-white font-semibold mb-2">No transactions yet</p>
          <p className="text-white/60 text-sm">
            Complete offers or request a payout to populate your transaction history.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {transactions.map((tx, index) => {
            const config = statusConfig[tx.status];
            const StatusIcon = config.icon;
            const isCredit = tx.type.includes('credit') || tx.amount > 0;

            return (
              <motion.div
                key={tx.id}
                variants={itemVariants}
                whileHover={{
                  x: 8,
                  transition: { duration: 0.3 },
                }}
                className="group relative"
              >
                {/* Glow Background on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />

                {/* Transaction Row */}
                <div className={`relative p-4 border ${config.border} bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex items-center justify-between gap-4 overflow-hidden`}>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
                  </div>

                  {/* Left: Icon & Details */}
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
                          {tx.description}
                        </p>
                        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider flex-shrink-0">
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{tx.timestamp}</span>
                        {tx.method && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/30" />
                            <span>{tx.method}</span>
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
                    <div className="flex items-center gap-1 justify-end">
                      {isCredit ? (
                        <ArrowDownLeft size={16} className="text-[#31F06F]" />
                      ) : (
                        <ArrowUpRight size={16} className="text-[#FF6B6B]" />
                      )}
                      <span
                        className="text-lg font-black"
                        style={{
                          color: isCredit ? '#31F06F' : '#FF6B6B',
                        }}
                      >
                        {isCredit ? '+' : '-'}
                        {Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
