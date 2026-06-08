'use client';

import { motion } from 'framer-motion';
import { Flame, ChevronRight, Zap } from 'lucide-react';
import { sampleOffers } from '@/styles/theme';

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="model-u-badge">
      <Zap size={13} />
      {children}
    </span>
  );
}

export default function TopOffers() {
  return (
    <section className="model-u-card mt-6">
      <div className="model-u-section-head">
        <h2>
          <Flame className="text-[#FF2F42]" />
          Top Offers
        </h2>
        <a href="#all" className="hover:text-[#18D9FF] transition-colors">
          View all <ChevronRight size={18} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {sampleOffers.map((offer, index) => (
          <motion.article
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="relative p-4 border border-[var(--model-u-line)] bg-[rgba(5,10,20,0.62)] rounded-[18px] cursor-pointer transition-all hover:border-[rgba(24,217,255,0.3)]"
          >
            {offer.hot && (
              <mark className="model-u-hot-badge">HOT</mark>
            )}

            {/* Offer Art */}
            <div className="h-[142px] rounded-[14px] bg-[radial-gradient(circle_at_60%_40%,rgba(124,61,255,0.35),transparent_60%),#0C1324] flex items-center justify-center text-[70px] mb-4">
              {offer.image}
            </div>

            {/* Title */}
            <h3 className="text-[21px] font-bold mb-2">{offer.title}</h3>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-2">
              {offer.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>

            {/* Platform */}
            <p className="text-[#AAB4C9] text-sm mb-2">{offer.platform}</p>

            {/* TapScore */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[#9AA8C6]">TapScore</span>
              <span className="text-[#31F06F] font-bold">{offer.tapScore}%</span>
            </div>

            {/* Payout */}
            <strong className="block text-[#7BFF4D] text-right text-[20px] font-black mb-2">
              {offer.payout}
            </strong>

            {/* CTA Button */}
            <button className="w-full model-u-gradient-cyan-purple border-0 rounded-xl text-white py-3 font-extrabold hover:opacity-90 transition-opacity">
              Start Offer
            </button>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// Made with Bob
