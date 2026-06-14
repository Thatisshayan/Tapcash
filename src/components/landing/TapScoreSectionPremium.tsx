'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Zap, Shield, TrendingUp, Award, CheckCircle } from 'lucide-react';

const tiers = [
  { name: 'Bronze', minScore: 0, color: '#A0522D', benefits: ['Basic offers', 'Standard payouts'] },
  { name: 'Silver', minScore: 60, color: '#C0C0C0', benefits: ['Premium offers', 'Faster payouts'] },
  { name: 'Gold', minScore: 80, color: '#FFD700', benefits: ['Exclusive offers', 'Priority support'] },
  { name: 'Platinum', minScore: 95, color: '#E5E4E2', benefits: ['VIP offers', 'Instant payouts'] },
];

const features = [
  { icon: Zap, label: 'Fast payout', color: '#31F06F', description: 'Rewards verified within 24 hours' },
  { icon: TrendingUp, label: 'High tracking', color: '#18D9FF', description: 'Real-time completion tracking' },
  { icon: Shield, label: 'No purchase', color: '#FFC442', description: 'Never required to buy anything' },
  { icon: CheckCircle, label: 'Easy to complete', color: '#7C3DFF', description: 'Simple, straightforward tasks' },
];

export default function TapScoreSectionPremium() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
          <Award size={16} className="text-[#FFC442]" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">TapScore™ System</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
          Know the Safest Offers
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Higher score = better odds. Our TapScore™ system rates offers based on real user data and provider tracking accuracy.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        {/* Left: Score Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center lg:justify-start"
        >
          <div className="relative w-full max-w-sm">
            {/* Animated Background Glow */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#31F06F]/30 to-[#18D9FF]/30 blur-3xl"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Score Ring Container */}
            <div className="relative z-10 aspect-square flex items-center justify-center">
              {/* Outer Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-8 border-transparent bg-gradient-to-r from-[#31F06F] via-[#18D9FF] to-[#7C3DFF] p-1"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <div className="w-full h-full rounded-full bg-[#050813]" />
              </motion.div>

              {/* Inner Ring - Secondary */}
              <motion.div
                className="absolute inset-6 rounded-full border-4 border-transparent bg-gradient-to-r from-[#18D9FF]/50 to-[#7C3DFF]/50"
                animate={{ rotate: -180 }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative z-20 text-center"
              >
                <motion.div
                  className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#31F06F] to-[#18D9FF]"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  94%
                </motion.div>
                <div className="text-sm text-white/70 mt-2 font-semibold">Safe Offer</div>
              </motion.div>
            </div>

            {/* Score Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-12 space-y-2"
            >
              {[
                { label: 'Completion Rate', value: 96, color: '#31F06F' },
                { label: 'Tracking Accuracy', value: 94, color: '#18D9FF' },
                { label: 'User Satisfaction', value: 91, color: '#7C3DFF' },
              ].map((item, idx) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70 font-medium">{item.label}</span>
                    <span className="font-bold" style={{ color: item.color }}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.8 + idx * 0.1, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Features & Tiers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="space-y-8"
        >
          {/* Features */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">What Makes an Offer Safe?</h3>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.label}
                    variants={itemVariants}
                    whileHover={{ x: 8 }}
                    className="flex items-start gap-4 p-4 rounded-lg border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.02] hover:border-white/20 transition-all duration-300 group cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-white/20 transition-all duration-300"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Icon size={20} style={{ color: feature.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-[#31F06F] transition-colors duration-300">
                        {feature.label}
                      </p>
                      <p className="text-sm text-white/50 mt-1">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Tier Badges */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Your Tier Benefits</h3>
            <div className="grid grid-cols-2 gap-3">
              {tiers.map((tier, idx) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-4 rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className="font-bold text-white text-sm">{tier.name}</span>
                  </div>
                  <p className="text-xs text-white/60">Score {tier.minScore}+</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-center"
      >
        <p className="text-white/60 text-sm mb-6">
          Start earning and watch your TapScore™ grow with every completed offer
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#31F06F]/30 transition-all duration-300 border border-white/10"
        >
          Learn More About TapScore™
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </section>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
