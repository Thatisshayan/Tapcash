'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Target, Clock3, CheckCircle2, Wallet } from 'lucide-react';
import { cashPathSteps } from '@/styles/theme';

const iconMap = {
  gamepad: Gamepad2,
  target: Target,
  clock: Clock3,
  check: CheckCircle2,
  wallet: Wallet,
};

export default function CashPathLive() {
  return (
    <section className="model-u-card mt-6 col-span-full">
      <h2 className="text-[#7CFF42] uppercase flex items-center gap-2 font-black text-xl mb-6">
        CashPath™ Live
        <i className="w-[10px] h-[10px] rounded-full bg-[#31F06F] animate-pulse" />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {cashPathSteps.map(({ step, title, text, icon }, index) => {
          const Icon = iconMap[icon as keyof typeof iconMap] || Gamepad2;
          
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Icon */}
              <div className="w-[74px] h-[74px] mx-auto mb-3 rounded-full grid place-items-center bg-[radial-gradient(circle,#7C3DFF,#0B1427)] border border-[rgba(255,255,255,0.18)]">
                <Icon size={30} className="text-white" />
              </div>

              {/* Title */}
              <b className="block font-black text-white">{title}</b>

              {/* Description */}
              <span className="block text-[#AEB9D0] text-sm mt-1">{text}</span>

              {/* Connecting Line */}
              {index < cashPathSteps.length - 1 && (
                <div className="hidden lg:block absolute right-[-26px] top-[35px] w-[52px] h-[2px] bg-gradient-to-r from-[#18D9FF] to-[#31F06F]" />
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center text-[#CBD4E8] text-lg"
      >
        Track every step. See your reward hit your account.
      </motion.p>
    </section>
  );
}

// Made with Bob
