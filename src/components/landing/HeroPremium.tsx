'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroPremium() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left: Text Content */}
          <motion.div className="space-y-8" variants={itemVariants}>
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full"
              variants={itemVariants}
            >
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Earn Real Money, Real Fast
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl lg:text-6xl font-bold text-white leading-tight"
              variants={itemVariants}
            >
              Play Games.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-green-400">
                Earn Cash.
              </span>
              <span className="block text-white">Cash Out Instantly.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg text-slate-300 max-w-md leading-relaxed"
              variants={itemVariants}
            >
              Join thousands of users earning real rewards by completing offers, playing games, and watching videos. Verified payouts. No BS.
            </motion.p>

            {/* Features */}
            <motion.div className="space-y-4" variants={itemVariants}>
              {[
                { icon: TrendingUp, text: 'Real earnings from day one' },
                { icon: Shield, text: 'Secure & verified payouts' },
                { icon: Zap, text: 'Instant cash out options' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-3"
                  variants={itemVariants}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-slate-200 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={itemVariants}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Start Earning Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-700/50 transition-all duration-300"
              >
                See How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Hero Image */}
          <motion.div
            className="relative h-full flex items-center justify-center"
            variants={imageVariants}
          >
            <div className="relative w-full max-w-md">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-2xl blur-2xl" />

              {/* Image container */}
              <motion.div
                className="relative z-10"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Image
                  src="/images/assets/ChatGPTImageJun14,2026,05_12_45PM.png"
                  alt="TapCash User Earning"
                  width={400}
                  height={600}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>

              {/* Floating neon badges */}
              <motion.div
                className="absolute top-10 -left-10 w-24 h-24"
                animate={{
                  rotate: 360,
                  y: [0, 20, 0],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Image
                  src="/images/assets/ChatGPTImageJun14,2026,05_12_34PM(6).png"
                  alt="Reward Badge"
                  width={96}
                  height={96}
                  className="w-full h-auto"
                />
              </motion.div>

              <motion.div
                className="absolute bottom-20 -right-10 w-20 h-20"
                animate={{
                  rotate: -360,
                  y: [0, -20, 0],
                }}
                transition={{
                  rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
                  y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Image
                  src="/images/assets/ChatGPTImageJun14,2026,05_12_34PM(9).png"
                  alt="Cash Out"
                  width={80}
                  height={80}
                  className="w-full h-auto"
                />
              </motion.div>

              <motion.div
                className="absolute top-1/2 -right-20 w-16 h-16"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Image
                  src="/images/assets/ChatGPTImageJun14,2026,05_12_34PM(8).png"
                  alt="Wallet"
                  width={64}
                  height={64}
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          className="grid grid-cols-3 gap-6 mt-20 pt-20 border-t border-slate-700/50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { number: '50K+', label: 'Active Users' },
            { number: '$2.5M+', label: 'Paid Out' },
            { number: '98%', label: 'Satisfaction' },
          ].map((stat, idx) => (
            <motion.div key={idx} className="text-center" variants={itemVariants}>
              <div className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm lg:text-base mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
