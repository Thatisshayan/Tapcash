'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Gamepad2, Target, Wallet, ChevronRight, CreditCard, Gift, Bitcoin, Banknote } from 'lucide-react';

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_0.9fr_0.78fr] gap-6 items-center min-h-[500px] py-8">
      {/* Left Column - Copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="space-y-6"
      >
        <div className="model-u-micro">
          <ShieldCheck size={18} />
          Real offers. Tracked rewards. Clean cashout.
        </div>

        <h1 className="text-[86px] leading-[0.98] tracking-[-4px] font-black">
          Play.
          <br />
          <span className="model-u-text-gradient-green">Earn.</span>
          <br />
          Cash Out.
        </h1>

        <p className="text-[22px] leading-[1.45] text-[#E4EAFF] max-w-[540px]">
          Complete verified offers. Track every step. Cash out when rewards clear.
        </p>

        <div className="flex gap-4 flex-wrap">
          <motion.button
            className="model-u-btn-primary"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Start My Sweet Offer <ChevronRight size={20} />
          </motion.button>
          <button className="model-u-btn-secondary">See How It Works</button>
        </div>

        <div className="flex gap-8 items-center flex-wrap">
          <span className="flex gap-2 items-center text-[#EAF1FF]">
            <div className="w-8 h-8 rounded-full border border-[rgba(49,240,111,0.45)] flex items-center justify-center">
              <Gamepad2 size={16} className="text-[#31F06F]" />
            </div>
            Play Games
          </span>
          <span className="flex gap-2 items-center text-[#EAF1FF]">
            <div className="w-8 h-8 rounded-full border border-[rgba(49,240,111,0.45)] flex items-center justify-center">
              <Target size={16} className="text-[#31F06F]" />
            </div>
            Earn Rewards
          </span>
          <span className="flex gap-2 items-center text-[#EAF1FF]">
            <div className="w-8 h-8 rounded-full border border-[rgba(49,240,111,0.45)] flex items-center justify-center">
              <Wallet size={16} className="text-[#31F06F]" />
            </div>
            Cash Out Fast & Secure
          </span>
        </div>
      </motion.div>

      {/* Center Column - Hero Character */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative h-[530px] flex items-end justify-center"
      >
        {/* Floating Elements */}
        <motion.div
          className="absolute top-[20px] left-[60px] w-12 h-12 rounded-full bg-gradient-to-br from-[#31F06F] to-[#18D9FF] opacity-80 blur-[2px]"
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[100px] right-[50px] w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3DFF] to-[#18D9FF] opacity-70"
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[80px] left-[40px] w-10 h-10 rounded-full bg-gradient-to-br from-[#31F06F] to-[#FF2F42] opacity-75"
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full border-2 border-[var(--model-u-purple-glow)] opacity-40"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <div className="model-u-halo top-[38px]" />
        <div className="relative w-[360px] h-[430px] rounded-[45%_45%_16%_16%] bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] flex items-center justify-center flex-col"
          style={{ filter: 'drop-shadow(0 38px 60px rgba(0,0,0,0.42))' }}
        >
          <div className="text-[140px]">😊</div>
          <div className="mt-[-28px] border border-[var(--model-u-line)] bg-[#060B16] rounded-[18px] px-6 py-10 text-[#18D9FF] font-black text-2xl">
            TC
          </div>
        </div>
      </motion.div>

      {/* Right Column - Balance & Safe Offer Cards */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="grid gap-4"
      >
        {/* Balance Card */}
        <div className="model-u-card">
          <span className="uppercase text-[#B9C5DF] text-[13px] font-extrabold">YOUR BALANCE</span>
          <strong className="block text-[44px] my-2">$12.50</strong>
          <em className="text-[#31F06F] font-extrabold not-italic">+14.3% today</em>
          <div className="model-u-progress-bar my-4">
            <i className="model-u-progress-fill" style={{ width: '62%' }} />
          </div>
          <div className="flex justify-between items-center mb-4">
            <small className="text-[#C1C9DD]">Pts. 820 to withdraw</small>
            <small className="text-white font-bold">$12.50 / $20</small>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--model-u-line)] flex items-center justify-center">
              <CreditCard size={18} className="text-[#31F06F]" />
            </div>
            <div className="flex-1 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--model-u-line)] flex items-center justify-center">
              <Gift size={18} className="text-[#18D9FF]" />
            </div>
            <div className="flex-1 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--model-u-line)] flex items-center justify-center">
              <Bitcoin size={18} className="text-[#FFC442]" />
            </div>
            <div className="flex-1 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--model-u-line)] flex items-center justify-center">
              <Banknote size={18} className="text-[#7C3DFF]" />
            </div>
          </div>
        </div>

        {/* Safe Offer Card */}
        <div className="model-u-card">
          <b className="text-[#31F06F] uppercase text-sm font-black">New to TapCash?</b>
          <h3 className="text-[28px] my-2 font-black">Start with our Safest Offer</h3>
          <p className="text-[16px] text-[#D7DEEF]">No purchase · high tracking · fast payout</p>
          <div className="border-l-[3px] border-[#31F06F] pl-3 text-[#D6E4FF] my-4">
            TapScore <strong className="text-[28px] text-[#31F06F]">94%</strong>
          </div>
          <button className="w-full mt-4 model-u-gradient-cyan-purple border-0 rounded-xl text-white py-3 font-extrabold">
            Start Safely
          </button>
        </div>
      </motion.div>
    </section>
  );
}

// Made with Bob
