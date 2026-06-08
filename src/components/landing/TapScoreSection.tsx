'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function TapScoreSection() {
  return (
    <section className="model-u-card mt-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-center">
      {/* Score Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="model-u-score-ring mx-auto"
      >
        <motion.strong
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          94%
        </motion.strong>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h2 className="text-[25px] font-black mb-2">TapScore™</h2>
        <p className="text-[#C8D2E8] mb-4">
          Know the safest offers before you start.
        </p>
        <ul className="list-none p-0 m-0 space-y-3">
          {[
            'Fast payout',
            'High tracking',
            'No purchase',
            'Easy to complete'
          ].map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2 text-[#E4EAFF]"
            >
              <CheckCircle size={18} className="text-[#31F06F]" />
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

// Made with Bob
