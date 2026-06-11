'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';

export default function TapScoreSection() {
  const features = [
    { icon: '⚡', label: 'Fast payout', color: '#31F06F' },
    { icon: '🎯', label: 'High tracking', color: '#18D9FF' },
    { icon: '🛡️', label: 'No purchase', color: '#FFC442' },
    { icon: '✨', label: 'Easy to complete', color: '#7C3DFF' },
  ];

  return (
    <section className="mt-12 lg:mt-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl lg:text-4xl font-black mb-2">
          TapScore™ Explained
        </h2>
        <p className="text-[#D7DEEF] text-lg">
          Know the safest offers before you start. Higher score = better odds.
        </p>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Animated Background Glow */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#31F06F]/30 to-[#18D9FF]/30 blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Score Ring */}
            <motion.div
              className="model-u-score-ring relative z-10"
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ opacity: 0.5 }}
            />

            {/* Static Score Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-5xl font-black text-[#31F06F]">94%</div>
                <div className="text-xs text-[#9AA8C6] mt-1 font-semibold">
                  Safe Offer
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-2xl font-bold mb-2 text-white">
              What Makes an Offer Safe?
            </h3>
            <p className="text-[#D7DEEF] text-base">
              TapScore rates offers based on real user data and provider tracking accuracy.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="card-glass rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-sm font-semibold text-white">
                  {feature.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-full model-u-btn-secondary mt-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn More About TapScore
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
