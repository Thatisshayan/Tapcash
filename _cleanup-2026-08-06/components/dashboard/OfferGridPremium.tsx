'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Clock, Zap, ArrowRight, TrendingUp } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  provider: string;
  category: string;
  payoutCoins: number;
  estimateMinutes: number;
  image?: string;
  accent?: string;
  tapScore?: number;
}

interface OfferGridProps {
  offers: Offer[];
  onOfferClick?: (offerId: string) => void;
}

export default function OfferGridPremium({ offers, onOfferClick }: OfferGridProps) {
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {offers.map((offer, index) => (
        <motion.article
          key={offer.id}
          variants={itemVariants}
          whileHover={{
            x: 8,
            transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
          }}
          onClick={() => onOfferClick?.(offer.id)}
          className="group relative cursor-pointer"
        >
          {/* Glow Background on Hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#18D9FF]/10 via-transparent to-[#7C3DFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

          {/* Card Container */}
          <div className="relative p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 overflow-hidden">
            
            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
            </div>

            {/* Content Grid */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left: Offer Details */}
              <div className="flex-1 min-w-0">
                {/* Provider Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-gradient-to-r from-white/8 to-white/4 backdrop-blur-sm mb-3"
                >
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    {offer.provider}
                  </span>
                  <span className="text-xs text-white/60">•</span>
                  <span className="text-xs text-white/60 uppercase tracking-wider">
                    {offer.category}
                  </span>
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#31F06F] transition-colors duration-300">
                  {offer.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/60 line-clamp-2 mb-4">
                  {offer.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock size={16} className="text-[#18D9FF]" />
                    <span className="text-sm font-medium">Est. {offer.estimateMinutes} min</span>
                  </div>
                  {offer.tapScore && (
                    <div className="flex items-center gap-2 text-white/70">
                      <TrendingUp size={16} className="text-[#31F06F]" />
                      <span className="text-sm font-medium">TapScore {offer.tapScore}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Payout & CTA */}
              <div className="flex flex-col items-end gap-4 md:min-w-max">
                {/* Payout Box */}
                <motion.div
                  className="p-4 rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-right"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-white/60 uppercase font-semibold tracking-wider mb-1">
                    Earn
                  </p>
                  <motion.p
                    className="text-3xl font-black text-[#31F06F]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    +{offer.payoutCoins.toLocaleString()}
                  </motion.p>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#18D9FF] to-[#7C3DFF] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#18D9FF]/30 transition-all duration-300 border border-white/10 whitespace-nowrap"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 12px 40px rgba(24, 217, 255, 0.25)',
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  Open Offer
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </motion.div>
  );
}
