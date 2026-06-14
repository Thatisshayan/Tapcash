'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Shield, Users, TrendingUp, Award, CheckCircle } from 'lucide-react';

const trustItems = [
  { 
    icon: Shield, 
    title: 'Verified Offers', 
    subtitle: 'Every offer tracked', 
    metric: '100%',
    color: '#31F06F',
    description: 'All offers verified by our team'
  },
  { 
    icon: Users, 
    title: '50K+ Users', 
    subtitle: 'Active community', 
    metric: '50K+',
    color: '#18D9FF',
    description: 'Growing daily'
  },
  { 
    icon: TrendingUp, 
    title: '$2.5M+ Paid', 
    subtitle: 'Total payouts', 
    metric: '$2.5M+',
    color: '#FFC442',
    description: 'Real money, real rewards'
  },
  { 
    icon: Award, 
    title: 'Top Rated', 
    subtitle: '4.8/5 stars', 
    metric: '4.8★',
    color: '#7C3DFF',
    description: 'User satisfaction'
  },
];

const recentPayouts = [
  { user: 'Alex M.', amount: '$125', time: '2 hours ago' },
  { user: 'Jordan L.', amount: '$89', time: '4 hours ago' },
  { user: 'Casey R.', amount: '$156', time: '6 hours ago' },
  { user: 'Morgan T.', amount: '$92', time: '8 hours ago' },
];

export default function TrustStripPremium() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
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
        <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
          Trusted by Thousands
        </h2>
        <p className="text-white/60 text-lg">
          Real users. Real rewards. Real payouts.
        </p>
      </motion.div>

      {/* Trust Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
      >
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.title}
              variants={itemVariants}
              whileHover={{
                y: -12,
                transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
              }}
              className="group relative"
            >
              {/* Glow Background on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

              {/* Card */}
              <div className="relative h-full p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
                
                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
                </div>

                {/* Icon Container */}
                <motion.div
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6 border border-white/15 group-hover:border-white/25 transition-all duration-300"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    size={32}
                    style={{ color: item.color }}
                    strokeWidth={1.5}
                  />
                </motion.div>

                {/* Metric */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="text-4xl font-black mb-3"
                  style={{ color: item.color }}
                >
                  {item.metric}
                </motion.div>

                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#31F06F] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/60">
                    {item.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-white/50 leading-relaxed">
                  {item.description}
                </p>

                {/* Verification Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm"
                >
                  <CheckCircle size={14} style={{ color: item.color }} />
                  <span className="text-xs font-semibold text-white/70">Verified</span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Payouts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mb-16"
      >
        <div className="p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl overflow-hidden relative">
          
          {/* Glow Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#31F06F]/5 via-transparent to-[#18D9FF]/5 rounded-2xl -z-10" />

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#31F06F] animate-pulse" />
              Recent Payouts
            </h3>
            
            <div className="space-y-3">
              {recentPayouts.map((payout, idx) => (
                <motion.div
                  key={payout.user}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#31F06F]/20 to-[#18D9FF]/10 flex items-center justify-center border border-white/10">
                      <span className="text-sm font-bold text-white/70">{payout.user.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{payout.user}</p>
                      <p className="text-xs text-white/50">{payout.time}</p>
                    </div>
                  </div>
                  <motion.div
                    className="text-right"
                    whileHover={{ scale: 1.1 }}
                  >
                    <p className="font-bold text-[#31F06F] text-sm">{payout.amount}</p>
                    <p className="text-xs text-white/50">Paid out</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Trust Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/60">
          <span className="flex items-center gap-2">
            <CheckCircle size={16} className="text-[#31F06F]" />
            Ledger-backed balances
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <span className="flex items-center gap-2">
            <CheckCircle size={16} className="text-[#18D9FF]" />
            Verified provider tracking
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <span className="flex items-center gap-2">
            <CheckCircle size={16} className="text-[#FFC442]" />
            Secure payouts
          </span>
        </div>
      </motion.div>
    </section>
  );
}
