'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Flame, ChevronRight, Zap, CheckCircle, Clock, Award } from 'lucide-react';
import { sampleOffers } from '@/styles/theme';

function Badge({ children, icon: Icon }: { children: React.ReactNode; icon: any }) {
  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className="inline-flex gap-1.5 items-center rounded-full border border-white/15 bg-gradient-to-r from-white/8 to-white/4 px-3 py-1.5 text-xs font-semibold text-white/90 hover:border-white/25 hover:bg-gradient-to-r hover:from-white/12 hover:to-white/8 transition-all duration-200 backdrop-blur-sm"
    >
      <Icon size={13} className="text-white/70" />
      {children}
    </motion.span>
  );
}

export default function TopOffersPremium() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <section className="model-u-page">
      {/* Section Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF2F42]/20 to-[#FF5555]/10 flex items-center justify-center border border-[#FF2F42]/30 backdrop-blur-sm">
              <Flame className="text-[#FF2F42]" size={24} />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-white">Top Offers</h2>
              <p className="text-sm text-white/60 mt-1">Highest paying offers right now</p>
            </div>
          </div>
          <motion.a
            href="#all-offers"
            whileHover={{ x: 6 }}
            className="flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm transition-colors group"
          >
            View all
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
        <p className="text-white/50 text-sm">Complete these verified offers and earn rewards instantly</p>
      </div>

      {/* Offers Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {sampleOffers.map((offer, index) => (
          <motion.article
            key={offer.id}
            variants={itemVariants}
            whileHover={{
              y: -12,
              transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
            }}
            className="group relative h-full"
          >
            {/* Glow Background on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#18D9FF]/10 via-transparent to-[#7C3DFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

            {/* Card Container */}
            <div className="relative h-full p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col overflow-hidden">
              
              {/* Shine Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
              </div>

              {/* HOT Badge */}
              {offer.hot && (
                <motion.div
                  className="absolute -top-3 left-6 z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF2F42] to-[#FF5555] px-3 py-1.5 shadow-lg shadow-[#FF2F42]/40 border border-[#FF2F42]/50">
                    <Flame className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      HOT
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Offer Image/Icon Container */}
              <motion.div
                className="h-40 rounded-xl bg-gradient-to-br from-[rgba(124,61,255,0.15)] via-[rgba(24,217,255,0.08)] to-[rgba(49,240,111,0.05)] flex items-center justify-center mb-5 overflow-hidden relative group/image border border-white/5"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.3 }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.15)] to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                
                <motion.span 
                  className="text-7xl drop-shadow-lg"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {offer.image}
                </motion.span>
              </motion.div>

              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-lg font-bold mb-3 text-white line-clamp-2 group-hover:text-[#18D9FF] transition-colors duration-300">
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
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/8">
                  <div>
                    <p className="text-xs text-white/50 uppercase font-semibold tracking-wide">
                      {offer.platform}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/50">TapScore</span>
                    <motion.p 
                      className="text-[#31F06F] font-bold text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {offer.tapScore}%
                    </motion.p>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="flex items-center gap-2 mb-5 text-white/60 text-sm">
                  <Clock size={16} className="text-[#18D9FF]" />
                  <span>Est. {offer.tapScore >= 80 ? '15' : '8'} min</span>
                </div>

                {/* Payout & CTA */}
                <div className="flex items-center justify-between gap-3 mt-auto">
                  <div>
                    <span className="text-xs text-white/50 uppercase font-semibold tracking-wide">Earn</span>
                    <motion.strong 
                      className="block text-[#31F06F] text-2xl font-black"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      {offer.payout}
                    </motion.strong>
                  </div>
                  <motion.button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#18D9FF] to-[#7C3DFF] text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-[#18D9FF]/30 transition-all duration-300 border border-white/10"
                    whileHover={{ 
                      scale: 1.04,
                      boxShadow: '0 12px 40px rgba(24, 217, 255, 0.25)',
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Start Offer
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-white/60 text-sm mb-4">
          ✓ All offers verified • ✓ Real payouts • ✓ Instant tracking
        </p>
        <motion.a
          href="#all-offers"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#31F06F]/20 to-[#18D9FF]/20 border border-white/15 text-white font-semibold rounded-lg hover:border-white/30 hover:bg-gradient-to-r hover:from-[#31F06F]/30 hover:to-[#18D9FF]/30 transition-all duration-300 backdrop-blur-sm"
        >
          View All Offers
          <ChevronRight size={18} />
        </motion.a>
      </motion.div>
    </section>
  );
}
