'use client';

import { motion, type Variants } from 'framer-motion';
import { Smartphone, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function AppPreview() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  } satisfies Variants;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" as any },
    },
  } satisfies Variants;

  return (
    <section className="mt-12 lg:mt-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#18D9FF]/10 flex items-center justify-center">
            <Smartphone size={20} className="text-[#18D9FF]" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black">See It In Action</h2>
        </div>
        <p className="text-[#D7DEEF] text-lg max-w-2xl">
          Track offers, view your balance, and cash out—all from your phone. Available on iOS and Android.
        </p>
      </motion.div>

      {/* Hero Visual - Person with Phone */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        <motion.div
          variants={itemVariants}
          className="relative rounded-3xl overflow-hidden"
        >
          <Image
            src="/images/hero/hero-character-modern.png"
            alt="TapCash App Preview"
            width={1440}
            height={900}
            priority
            className="w-full h-auto rounded-3xl shadow-2xl"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,8,19,0.4)] via-transparent to-transparent rounded-3xl pointer-events-none" />
        </motion.div>

        {/* Floating Feature Cards */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-8 right-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              title: 'Real-Time Tracking',
              description: 'See exactly where your rewards are',
              icon: '📊',
            },
            {
              title: 'Instant Notifications',
              description: 'Get alerts when rewards are approved',
              icon: '🔔',
            },
            {
              title: 'Fast Cashout',
              description: 'Multiple payout methods available',
              icon: '⚡',
            },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(24, 217, 255, 0.2)' }}
              className="model-u-card backdrop-blur-xl bg-[rgba(9,16,31,0.9)]"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h4 className="font-bold text-white mb-1">{feature.title}</h4>
              <p className="text-xs text-[#9AA8C6]">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <motion.button
          className="model-u-btn-primary"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          Download App <ArrowRight size={20} />
        </motion.button>
        <motion.button
          className="model-u-btn-secondary"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          whileTap={{ scale: 0.97 }}
        >
          Learn More
        </motion.button>
      </motion.div>
    </section>
  );
}
