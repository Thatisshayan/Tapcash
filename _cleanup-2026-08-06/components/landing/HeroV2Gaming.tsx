'use client';

import { motion, Variants } from 'framer-motion';
import { Gamepad2, ChevronRight, Zap, Trophy } from 'lucide-react';
import Image from 'next/image';

/**
 * HeroV2Gaming: Gaming-focused hero variant.
 * Emphasizes the gaming experience and competitive rewards.
 * Targets gamers and mobile game enthusiasts.
 */
export default function HeroV2Gaming() {
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
      transition: { duration: 0.7, ease: "easeInOut" as any },
    },
  };

  const floatingVariants: Variants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as any,
      },
    },
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_0.9fr] gap-8 items-center min-h-[600px] py-12 lg:py-20">
      {/* Left Column - Gaming-Focused Copy & CTAs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 z-10"
      >
        {/* Micro Badge - Gaming Focus */}
        <motion.div variants={itemVariants} className="model-u-micro w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#FF6B6B]">
          <Gamepad2 size={16} />
          <span>Play your favorite games. Get rewarded.</span>
        </motion.div>

        {/* Main Headline - Gaming Angle */}
        <motion.div variants={itemVariants}>
          <h1 className="text-5xl lg:text-7xl leading-[1.1] tracking-tight font-black">
            Level Up
            <br />
            <span className="model-u-text-gradient-green">Your Earnings</span>
            <br />
            While You Play.
          </h1>
        </motion.div>

        {/* Subheadline - Gaming Focus */}
        <motion.p
          variants={itemVariants}
          className="text-lg lg:text-xl leading-relaxed text-[#D7DEEF] max-w-[540px]"
        >
          Play Monopoly GO, RAID, Call of Duty, and 500+ games. Earn real cash and gift cards. No purchase required.
        </motion.p>

        {/* CTA Buttons - Gaming Focus */}
        <motion.div variants={itemVariants} className="flex gap-4 flex-wrap pt-4">
          <motion.button
            className="model-u-btn-primary"
            whileHover={{ y: -3, boxShadow: '0 24px 60px rgba(24, 217, 255, 0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            Browse Games <ChevronRight size={20} />
          </motion.button>
          <motion.button
            className="model-u-btn-secondary"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.97 }}
          >
            Top Earners
          </motion.button>
        </motion.div>

        {/* Gaming Trust Indicators */}
        <motion.div variants={itemVariants} className="flex gap-6 flex-wrap pt-4">
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#FF6B6B]/40 flex items-center justify-center bg-[#FF6B6B]/5">
              <Gamepad2 size={16} className="text-[#FF6B6B]" />
            </div>
            <span>500+ Games</span>
          </div>
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#FFD700]/40 flex items-center justify-center bg-[#FFD700]/5">
              <Trophy size={16} className="text-[#FFD700]" />
            </div>
            <span>Leaderboards</span>
          </div>
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#31F06F]/40 flex items-center justify-center bg-[#31F06F]/5">
              <Zap size={16} className="text-[#31F06F]" />
            </div>
            <span>Instant Rewards</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Center Column - Gaming Hero Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative h-[600px] flex items-center justify-center"
      >
        {/* Animated Background Glow - Gaming Colors */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B6B]/20 via-[#FFD700]/20 to-[#31F06F]/20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut" as any,
          }}
        />

        {/* Floating Accent Orbs - Gaming Style */}
        <motion.div
          className="absolute top-12 left-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD700] opacity-40 blur-2xl"
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as any }}
        />
        <motion.div
          className="absolute bottom-16 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-[#31F06F] to-[#18D9FF] opacity-30 blur-3xl"
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as any }}
        />

        {/* Gaming Hero Visual */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="relative z-10 drop-shadow-2xl"
        >
          <Image
            src="/images/hero/hero-gaming-focus-v2.png"
            alt="TapCash Gaming Rewards"
            width={400}
            height={500}
            priority
            className="w-96 h-auto rounded-3xl"
          />
        </motion.div>
      </motion.div>

      {/* Right Column - Gaming Stats & CTA */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="grid gap-4 h-fit"
      >
        {/* Top Earner Card */}
        <motion.div
          className="model-u-card"
          whileHover={{ y: -4, borderColor: 'rgba(255, 107, 107, 0.3)' }}
        >
          <span className="uppercase text-[#B9C5DF] text-xs font-extrabold tracking-wide">
            This Month's Top Earner
          </span>
          <motion.strong
            className="block text-4xl my-3 text-[#FFD700]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            $2,450
          </motion.strong>
          <em className="text-[#FFD700] font-bold not-italic text-sm">Playing Monopoly GO</em>

          {/* Progress Bar */}
          <div className="model-u-progress-bar my-4">
            <motion.i
              className="model-u-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ delay: 0.8, duration: 1, ease: "easeInOut" as any }}
              style={{ background: 'linear-gradient(90deg, #FF6B6B, #FFD700)' }}
            />
          </div>

          <div className="flex justify-between items-center mb-4 text-xs text-[#C1C9DD]">
            <small>Top 1% of players</small>
            <small className="text-white font-bold">Rank #1</small>
          </div>

          <motion.button
            className="w-full mt-4 model-u-gradient-cyan-purple border-0 rounded-xl text-white py-3 font-extrabold text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Join the Leaderboard
          </motion.button>
        </motion.div>

        {/* Quick Stats Card */}
        <motion.div
          className="model-u-card"
          whileHover={{ y: -4, borderColor: 'rgba(24, 217, 255, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <b className="text-[#31F06F] uppercase text-xs font-black tracking-wide">
            Community Stats
          </b>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#D7DEEF]">Active Players</span>
              <span className="font-black text-[#18D9FF]">2.3M+</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#D7DEEF]">Total Paid Out</span>
              <span className="font-black text-[#31F06F]">$42M+</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#D7DEEF]">Avg. Earnings</span>
              <span className="font-black text-[#FFD700]">$285/mo</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
