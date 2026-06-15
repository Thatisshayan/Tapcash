'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Target, Clock3, CheckCircle2, Wallet } from 'lucide-react';
import { cashPathSteps } from '@/styles/theme';
import Image from 'next/image';

const iconMap = {
  gamepad: Gamepad2,
  target: Target,
  clock: Clock3,
  check: CheckCircle2,
  wallet: Wallet,
};

export default function CashPathLive() {
  return (
    <section className="mt-12 lg:mt-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl lg:text-4xl font-black mb-2 flex items-center justify-center gap-3">
          <span>Your Cashout Flow</span>
          <i className="w-2.5 h-2.5 rounded-full bg-[#31F06F] animate-pulse" />
        </h2>
        <p className="text-[#D7DEEF] text-lg">
          From offer selection to cash in your pocket—transparent, tracked, and secure.
        </p>
      </motion.div>

      {/* Premium Visual Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative rounded-3xl overflow-hidden mb-8"
      >
        <Image
          src="/images/hero/cashout-flow-visual.png"
          alt="TapCash Cashout Flow"
          width={2560}
          height={1440}
          priority
          className="w-full h-auto rounded-3xl shadow-2xl"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(5,8,19,0.3)] rounded-3xl pointer-events-none" />
      </motion.div>

      {/* Step Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {cashPathSteps.map(({ step, title, text, icon }, index) => {
          const Icon = iconMap[icon as keyof typeof iconMap] || Gamepad2;
          
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="model-u-card text-center"
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-3 rounded-full grid place-items-center bg-gradient-to-br from-[#7C3DFF] to-[#18D9FF] border border-[rgba(255,255,255,0.18)]">
                <Icon size={24} className="text-white" />
              </div>

              {/* Title */}
              <b className="block font-black text-white">{title}</b>

              {/* Description */}
              <span className="block text-[#AEB9D0] text-xs mt-1">{text}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center text-[#CBD4E8] text-sm"
      >
        Every step is tracked and verified. No hidden fees. No surprises.
      </motion.p>
    </section>
  );
}

// Made with Bob
