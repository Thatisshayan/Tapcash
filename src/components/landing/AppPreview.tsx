'use client';

import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

export default function AppPreview() {
  return (
    <section className="model-u-card mt-6 grid grid-cols-1 md:grid-cols-[0.6fr_1.4fr] gap-6">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-[25px] font-black mb-2">See It In Action</h2>
        <p className="text-[#C8D2E8] mb-4">
          Track offers, view your balance, and cash out—all from your phone.
        </p>
        <div className="flex items-center gap-2 text-[#9AA8C6]">
          <Smartphone size={20} className="text-[#18D9FF]" />
          <span>Available on iOS and Android</span>
        </div>
      </motion.div>

      {/* Phone Mockups */}
      <div className="flex gap-4 items-end overflow-x-auto pb-4">
        {[
          { title: 'Offer Details', balance: '$12.50', action: 'Start Offer' },
          { title: 'Your Balance', balance: '$45.20', action: 'Cash Out' },
          { title: 'Activity', balance: '$78.90', action: 'View All' }
        ].map((screen, index) => (
          <motion.div
            key={screen.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="model-u-phone flex-shrink-0"
          >
            <b className="block text-[22px] mb-6 text-white">{screen.title}</b>
            <span className="block text-[#AEB8CF] mb-2">Balance</span>
            <span className="block text-[32px] font-black text-[#31F06F] mb-4">
              {screen.balance}
            </span>
            <div className="model-u-mini-line mb-4" />
            <button className="w-full border-0 rounded-[10px] bg-[#7C3DFF] text-white py-2 font-bold">
              {screen.action}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Made with Bob
