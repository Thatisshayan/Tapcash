'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Wallet, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

interface BalanceCardsProps {
  balance: string;
  balanceUSD: string;
  pending: string;
  status: string;
  statusDetail: string;
}

export default function BalanceCardsPremium({
  balance,
  balanceUSD,
  pending,
  status,
  statusDetail,
}: BalanceCardsProps) {
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

  const cards = [
    {
      icon: Wallet,
      label: 'Available Balance',
      value: balance,
      detail: balanceUSD,
      color: '#31F06F',
      bgGradient: 'from-[#31F06F]/10 to-[#18D9FF]/5',
      borderColor: 'border-[#31F06F]/30',
    },
    {
      icon: TrendingUp,
      label: 'Pending Rewards',
      value: pending,
      detail: 'Under verification',
      color: '#FFC442',
      bgGradient: 'from-[#FFC442]/10 to-[#FF8C42]/5',
      borderColor: 'border-[#FFC442]/30',
    },
    {
      icon: CheckCircle,
      label: 'Account Status',
      value: status,
      detail: statusDetail,
      color: '#18D9FF',
      bgGradient: 'from-[#18D9FF]/10 to-[#7C3DFF]/5',
      borderColor: 'border-[#18D9FF]/30',
    },
    {
      icon: ArrowRight,
      label: 'Next Action',
      value: 'Cashout',
      detail: 'Ready to withdraw',
      color: '#7C3DFF',
      bgGradient: 'from-[#7C3DFF]/10 to-[#31F06F]/5',
      borderColor: 'border-[#7C3DFF]/30',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{
              y: -8,
              transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
            }}
            className="group relative"
          >
            {/* Glow Background on Hover */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />

            {/* Card Container */}
            <div className={`relative h-full p-6 border ${card.borderColor} bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/30 transition-all duration-300 flex flex-col overflow-hidden group`}>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
              </div>

              {/* Icon Container */}
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 border border-white/15 group-hover:border-white/25 transition-all duration-300"
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Icon size={24} style={{ color: card.color }} strokeWidth={1.5} />
              </motion.div>

              {/* Label */}
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                {card.label}
              </p>

              {/* Value */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="mb-2"
              >
                <h3 className="text-3xl font-black text-white group-hover:text-[#31F06F] transition-colors duration-300">
                  {card.value}
                </h3>
              </motion.div>

              {/* Detail */}
              <p className="text-sm text-white/50 leading-relaxed flex-1">
                {card.detail}
              </p>

              {/* Bottom Accent Line */}
              <motion.div
                className="mt-4 h-1 bg-gradient-to-r rounded-full"
                style={{
                  backgroundImage: `linear-gradient(to right, ${card.color}20, ${card.color}80, ${card.color}20)`,
                }}
                whileHover={{ scaleX: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
