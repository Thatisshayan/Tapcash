'use client';

import { motion, Variants } from 'framer-motion';
import { ShieldCheck, ChevronRight, CreditCard, Gift, Bitcoin, Banknote } from 'lucide-react';
import Image from 'next/image';

/**
 * HeroV1Balanced: The original balanced hero variant.
 * Emphasizes the complete TapCash experience: Play, Earn, Cash Out.
 * Targets users seeking a comprehensive rewards platform.
 */
export default function HeroV1Balanced() {
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
      {/* Left Column - Copy & CTAs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 z-10"
      >
        {/* Micro Badge */}
        <motion.div variants={itemVariants} className="model-u-micro w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#18D9FF]">
          <ShieldCheck size={16} />
          <span>Real offers. Tracked rewards. Clean cashout.</span>
        </motion.div>

        {/* Main Headline */}
        <motion.div variants={itemVariants}>
          <h1 className="text-5xl lg:text-7xl leading-[1.1] tracking-tight font-black">
            Play.
            <br />
            <span className="model-u-text-gradient-green">Earn.</span>
            <br />
            Cash Out.
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg lg:text-xl leading-relaxed text-[#D7DEEF] max-w-[540px]"
        >
          Complete verified offers. Track every step. Cash out when rewards clear.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex gap-4 flex-wrap pt-4">
          <motion.button
            className="model-u-btn-primary"
            whileHover={{ y: -3, boxShadow: '0 24px 60px rgba(24, 217, 255, 0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            Start My Sweet Offer <ChevronRight size={20} />
          </motion.button>
          <motion.button
            className="model-u-btn-secondary"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.97 }}
          >
            See How It Works
          </motion.button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div variants={itemVariants} className="flex gap-6 flex-wrap pt-4">
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#31F06F]/40 flex items-center justify-center bg-[#31F06F]/5">
              <span className="text-[#31F06F] font-bold">✓</span>
            </div>
            <span>Play Games</span>
          </div>
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#18D9FF]/40 flex items-center justify-center bg-[#18D9FF]/5">
              <span className="text-[#18D9FF] font-bold">✓</span>
            </div>
            <span>Earn Rewards</span>
          </div>
          <div className="flex gap-2 items-center text-sm text-[#D7DEEF]">
            <div className="w-8 h-8 rounded-full border border-[#7C3DFF]/40 flex items-center justify-center bg-[#7C3DFF]/5">
              <span className="text-[#7C3DFF] font-bold">✓</span>
            </div>
            <span>Cash Out Fast</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Center Column - Premium Hero Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative h-[600px] flex items-center justify-center"
      >
        {/* Animated Background Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#18D9FF]/20 via-[#7C3DFF]/20 to-[#31F06F]/20 blur-3xl"
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

        {/* Floating Accent Orbs */}
        <motion.div
          className="absolute top-12 left-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#31F06F] to-[#18D9FF] opacity-40 blur-2xl"
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as any }}
        />
        <motion.div
          className="absolute bottom-16 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3DFF] to-[#FF2F42] opacity-30 blur-3xl"
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as any }}
        />

        {/* Premium Phone Mockup */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="relative z-10 drop-shadow-2xl"
        >
          <Image
            src="/images/hero/phone-dashboard-3d.png"
            alt="TapCash Dashboard"
            width={320}
            height={640}
            priority
            className="w-80 h-auto rounded-3xl"
          />
        </motion.div>
      </motion.div>

      {/* Right Column - Balance & Trust Cards */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="grid gap-4 h-fit"
      >
        {/* Balance Card */}
        <motion.div
          className="model-u-card"
          whileHover={{ y: -4, borderColor: 'rgba(24, 217, 255, 0.3)' }}
        >
          <span className="uppercase text-[#B9C5DF] text-xs font-extrabold tracking-wide">
            Your Balance
          </span>
          <motion.strong
            className="block text-5xl my-3 text-[#31F06F]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            $12.50
          </motion.strong>
          <em className="text-[#31F06F] font-bold not-italic text-sm">+14.3% today</em>

          {/* Progress Bar */}
          <div className="model-u-progress-bar my-4">
            <motion.i
              className="model-u-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: '62%' }}
              transition={{ delay: 0.8, duration: 1, ease: "easeInOut" as any }}
            />
          </div>

          <div className="flex justify-between items-center mb-4 text-xs text-[#C1C9DD]">
            <small>Pts. 820 to withdraw</small>
            <small className="text-white font-bold">$12.50 / $20</small>
          </div>

          {/* Payout Method Icons */}
          <div className="flex gap-3">
            {[
              { Icon: CreditCard, color: '#31F06F', label: 'Card' },
              { Icon: Gift, color: '#18D9FF', label: 'Gift' },
              { Icon: Bitcoin, color: '#FFC442', label: 'Crypto' },
              { Icon: Banknote, color: '#7C3DFF', label: 'Cash' },
            ].map(({ Icon, color, label }, idx) => (
              <motion.div
                key={label}
                className="flex-1 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--model-u-line)] flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.06)]"
                whileHover={{ scale: 1.05, borderColor: color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
              >
                <Icon size={18} style={{ color }} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Safe Offer Card */}
        <motion.div
          className="model-u-card"
          whileHover={{ y: -4, borderColor: 'rgba(24, 217, 255, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <b className="text-[#31F06F] uppercase text-xs font-black tracking-wide">
            New to TapCash?
          </b>
          <h3 className="text-2xl my-2 font-black">Start with our Safest Offer</h3>
          <p className="text-sm text-[#D7DEEF]">
            No purchase · high tracking · fast payout
          </p>

          <div className="border-l-4 border-[#31F06F] pl-3 text-[#D6E4FF] my-4">
            TapScore{' '}
            <strong className="text-2xl text-[#31F06F] block">94%</strong>
          </div>

          <motion.button
            className="w-full mt-4 model-u-gradient-cyan-purple border-0 rounded-xl text-white py-3 font-extrabold text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Safely
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
