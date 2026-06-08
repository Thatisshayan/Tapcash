'use client';

import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp, Award } from 'lucide-react';

const trustItems = [
  { icon: Shield, title: 'Verified Offers', subtitle: 'Every offer tracked' },
  { icon: Users, title: '50K+ Users', subtitle: 'Active community' },
  { icon: TrendingUp, title: '$2M+ Paid', subtitle: 'Total payouts' },
  { icon: Award, title: 'Top Rated', subtitle: '4.8/5 stars' },
];

export default function TrustStrip() {
  return (
    <section className="model-u-card mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {trustItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === trustItems.length - 1;
        
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`grid grid-cols-[50px_1fr] gap-3 items-center ${
              !isLast ? 'border-r border-[var(--model-u-line)] pr-4' : ''
            }`}
          >
            <Icon
              size={42}
              className="text-[#31F06F] row-span-2"
              strokeWidth={1.5}
            />
            <b className="text-[18px] font-black text-white">{item.title}</b>
            <span className="text-[#AEB8CF] text-sm">{item.subtitle}</span>
          </motion.div>
        );
      })}
    </section>
  );
}

// Made with Bob
