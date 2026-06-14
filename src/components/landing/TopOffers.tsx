'use client';

import { motion } from 'framer-motion';
import { Flame, ChevronRight, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { sampleOffers } from '@/styles/theme';
import Image from 'next/image';

function Badge({ children, icon: Icon }: { children: React.ReactNode; icon: any }) {
  return (
    <span className="inline-flex gap-1.5 items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/8 transition-colors">
      <Icon size={13} />
      {children}
    </span>
  );
}

export default function TopOffers() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeInOut" as any },
    },
  };

  return (
    <section className="model-u-card mt-8">
      {/* Section Header */}
      <div className="model-u-section-head">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FF2F42]/10 flex items-center justify-center">
            <Flame className="text-[#FF2F42]" size={18} />
          </div>
          <span>Top Offers</span>
        </motion.h2>
        <motion.a
          href="#all"
          className="flex items-center gap-2 text-[#DBE7FF] font-semibold text-sm hover:text-[#18D9FF] transition-colors"
          whileHover={{ x: 4 }}
        >
          View all <ChevronRight size={18} />
        </motion.a>
      </div>

      {/* Offers Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6"
      >
        {sampleOffers.map((offer, index) => (
          <motion.article
            key={offer.id}
            variants={itemVariants}
            whileHover={{
              y: -8,
              boxShadow: '0 20px 60px rgba(24, 217, 255, 0.15)',
            }}
            className="relative group p-5 border border-[var(--model-u-line)] bg-gradient-to-br from-[rgba(9,16,31,0.8)] to-[rgba(5,10,20,0.6)] rounded-2xl cursor-pointer transition-all hover:border-[rgba(24,217,255,0.4)]"
          >
            {/* HOT Badge */}
            {offer.hot && (
              <motion.div
                className="absolute -top-3 left-5 z-10"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
              >
                <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF2F42] to-[#FF5555] px-3 py-1.5 shadow-lg shadow-[#FF2F42]/30">
                  <Flame className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    HOT
                  </span>
                </div>
              </motion.div>
            )}

            {/* Offer Image/Icon */}
            <motion.div
              className="h-32 rounded-xl bg-gradient-to-br from-[rgba(124,61,255,0.2)] to-[rgba(24,217,255,0.1)] flex items-center justify-center mb-4 overflow-hidden relative group/image"
              whileHover={{ scale: 1.05 }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.2)] to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity" />
              
              <span className="text-6xl drop-shadow-lg group-hover/image:scale-110 transition-transform">
                {offer.image}
              </span>
            </motion.div>

            {/* Title */}
            <h3 className="text-lg font-bold mb-3 text-white line-clamp-2">
              {offer.title}
            </h3>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-4">
              {offer.tags.map((tag) => (
                <Badge key={tag} icon={tag === 'Easy' ? CheckCircle : Zap}>
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Metadata Row */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div>
                <p className="text-xs text-[#9AA8C6] uppercase font-semibold">
                  {offer.platform}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#9AA8C6]">TapScore</span>
                <p className="text-[#31F06F] font-bold text-sm">{offer.tapScore}%</p>
              </div>
            </div>

            {/* Payout & CTA */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#9AA8C6]">Earn</span>
                <strong className="block text-[#31F06F] text-xl font-black">
                  {offer.payout}
                </strong>
              </div>
              <motion.button
                className="flex-1 model-u-gradient-cyan-purple border-0 rounded-lg text-white py-2.5 font-bold text-sm hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start
              </motion.button>
            </div>

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
