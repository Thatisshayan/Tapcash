'use client';

import { motion, Variants } from 'framer-motion';
import { CheckCircle2, ChevronRight, Clock, Users } from 'lucide-react';
import Image from 'next/image';

/**
 * HeroV3Offers: Offers/surveys-focused hero variant.
 * Emphasizes quick tasks, surveys, and diverse earning opportunities.
 * Targets users seeking flexible, quick earning methods.
 */
export default function HeroV3Offers() {
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
      {/* Left Column - Offers-Focused Copy & CTAs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 z-10"
      >
        {/* Micro Badge - Offers Focus */}
        <motion.div variants={itemVariants} className="model-u-micro w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#7C3DFF]">
          <CheckCircle2 size={16} />
          <span>Quick tasks. Real money. Verified payouts.</span>
        </motion.div>

        {/* Main Headline - Offers Angle */}
        <motion.div variants={itemVariants}>
          <h1 className="text-5xl lg:text-7xl leading-[1.1] tracking-tight font-black">
            Earn Money
            <br />
            <span className="model-u-text-gradient-green">Your Way</span>
            <br />
            In Minutes.
          </h1>
        </motion.div>

        {/* Subheadline - Offers Focus */}
        <motion.p
          variants={itemVariants}
          className="text-lg lg:text-xl leading-relaxed text-[#D7DEEF] max-w-[540px]"
        >
          Complete surveys, sign-ups, app installs, and quick tasks. Flexible earning that fits your schedule.
        </motion.p>

        {/* CTA Buttons - Offers Focus */}
        <motion.div variants={itemVariants} className="flex gap-4 flex-wrap pt-4">
          <motion.button
            className="model-u-btn-primary"
            whileHover={{ y: -3, boxShadow: '0 24px 60px rgba(24, 217, 255, 0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            Browse Tasks <ChevronRight size={20} />
          </motion.button>
          <motion.button
            className="model-u-btn-secondary"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.97 }}
          >
            How It Works
          </motion.button>
        </motion.div>

        {/* Offers Trust Indicators */}
        <motion.div variants={itemVariants} className="flex gap-6 flex-wrap pt-4">
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#7C3DFF]/40 flex items-center justify-center bg-[#7C3DFF]/5">
              <Clock size={16} className="text-[#7C3DFF]" />
            </div>
            <span>5-30 Min Tasks</span>
          </div>
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#18D9FF]/40 flex items-center justify-center bg-[#18D9FF]/5">
              <CheckCircle2 size={16} className="text-[#18D9FF]" />
            </div>
            <span>Instant Approval</span>
          </div>
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#31F06F]/40 flex items-center justify-center bg-[#31F06F]/5">
              <Users size={16} className="text-[#31F06F]" />
            </div>
            <span>No Experience</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Center Column - Offers Hero Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative h-[600px] flex items-center justify-center"
      >
        {/* Animated Background Glow - Offers Colors */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3DFF]/20 via-[#18D9FF]/20 to-[#31F06F]/20 blur-3xl"
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

        {/* Floating Accent Orbs - Offers Style */}
        <motion.div
          className="absolute top-12 left-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3DFF] to-[#18D9FF] opacity-40 blur-2xl"
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as any }}
        />
        <motion.div
          className="absolute bottom-16 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-[#31F06F] to-[#18D9FF] opacity-30 blur-3xl"
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as any }}
        />

        {/* Offers Hero Visual */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="relative z-10 drop-shadow-2xl"
        >
          <Image
            src="/images/hero/hero-offers-focus-v2.png"
            alt="TapCash Offers & Surveys"
            width={400}
            height={500}
            priority
            className="w-96 h-auto rounded-3xl"
          />
        </motion.div>
      </motion.div>

      {/* Right Column - Offers Stats & CTA */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="grid gap-4 h-fit"
      >
        {/* Quick Earnings Card */}
        <motion.div
          className="model-u-card"
          whileHover={{ y: -4, borderColor: 'rgba(124, 61, 255, 0.3)' }}
        >
          <span className="uppercase text-[#B9C5DF] text-xs font-extrabold tracking-wide">
            Average Earnings
          </span>
          <motion.strong
            className="block text-4xl my-3 text-[#7C3DFF]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            $15-50
          </motion.strong>
          <em className="text-[#7C3DFF] font-bold not-italic text-sm">Per completed survey</em>

          {/* Progress Bar */}
          <div className="model-u-progress-bar my-4">
            <motion.i
              className="model-u-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ delay: 0.8, duration: 1, ease: "easeInOut" as any }}
              style={{ background: 'linear-gradient(90deg, #7C3DFF, #18D9FF)' }}
            />
          </div>

          <div className="flex justify-between items-center mb-4 text-xs text-[#C1C9DD]">
            <small>Completion Rate</small>
            <small className="text-white font-bold">72%</small>
          </div>

          <motion.button
            className="w-full mt-4 model-u-gradient-cyan-purple border-0 rounded-xl text-white py-3 font-extrabold text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Earning Today
          </motion.button>
        </motion.div>

        {/* Task Types Card */}
        <motion.div
          className="model-u-card"
          whileHover={{ y: -4, borderColor: 'rgba(24, 217, 255, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <b className="text-[#18D9FF] uppercase text-xs font-black tracking-wide">
            Available Tasks
          </b>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#D7DEEF]">Surveys</span>
              <span className="font-black text-[#7C3DFF]">1,200+</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#D7DEEF]">Sign-ups</span>
              <span className="font-black text-[#18D9FF]">850+</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#D7DEEF]">App Installs</span>
              <span className="font-black text-[#31F06F]">450+</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
