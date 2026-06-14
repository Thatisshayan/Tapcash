'use client';

import { motion, type Variants } from 'framer-motion';
import { Shield, Users, TrendingUp, Award } from 'lucide-react';

const trustItems = [
  { 
    icon: Shield, 
    title: 'Verified Offers', 
    subtitle: 'Every offer tracked', 
    metric: '100%',
    color: '#31F06F'
  },
  { 
    icon: Users, 
    title: '50K+ Users', 
    subtitle: 'Active community', 
    metric: '50K+',
    color: '#18D9FF'
  },
  { 
    icon: TrendingUp, 
    title: '$2M+ Paid', 
    subtitle: 'Total payouts', 
    metric: '$2M+',
    color: '#FFC442'
  },
  { 
    icon: Award, 
    title: 'Top Rated', 
    subtitle: '4.8/5 stars', 
    metric: '4.8★',
    color: '#7C3DFF'
  },
];

export default function TrustStrip() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } satisfies Variants;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeInOut" as any },
    },
  } satisfies Variants;

  return (
    <section className="mt-12 lg:mt-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl lg:text-4xl font-black mb-2">
          Trusted by Thousands
        </h2>
        <p className="text-[#D7DEEF] text-lg">
          Real users. Real rewards. Real payouts.
        </p>
      </motion.div>

      {/* Trust Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.title}
              variants={itemVariants}
              whileHover={{ y: -4, borderColor: item.color }}
              className="card-elevated rounded-2xl p-6 text-center space-y-4"
            >
              {/* Icon */}
              <motion.div
                className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.02)] flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon
                  size={28}
                  style={{ color: item.color }}
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Metric */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                className="text-3xl font-black"
                style={{ color: item.color }}
              >
                {item.metric}
              </motion.div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-[#9AA8C6]">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom Trust Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 text-center"
      >
        <p className="text-[#9AA8C6] text-sm">
          Ledger-backed balances • Verified provider tracking • Secure payouts
        </p>
      </motion.div>
    </section>
  );
}
