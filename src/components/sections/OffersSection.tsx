'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, Zap, X, Star, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';

interface Offer {
  name: string;
  image: string;
  tags: string[];
  platform: string;
  price: number;
  hot?: boolean;
  subtitle?: string;
}

const OFFERS: Offer[] = [
  { name: 'Mythic Heroes Quest', image: '/images/offers/offer-1.png', tags: ['High Paying', 'Popular'], platform: 'Android', price: 120, hot: true },
  { name: 'Coin Master', image: '/images/offers/offer-2.png', tags: ['Easy', 'Fast Payout'], platform: 'Both', price: 35, subtitle: 'Village level 15' },
  { name: 'Tycoon Go!', image: '/images/offers/offer-3.png', tags: ['Easy', 'No Purchase'], platform: 'iOS', price: 25 },
  { name: 'Vegas Slots 777', image: '/images/offers/offer-4.png', tags: ['Fast Payout', 'High Paying'], platform: 'Android', price: 20, hot: true },
  { name: 'Controller Quest', image: '/images/offers/offer-5.png', tags: ['Easy'], platform: 'Both', price: 18, subtitle: 'Reach level 50' },
  { name: 'Match Masters', image: '/images/offers/offer-6.png', tags: ['Easy Tasks'], platform: 'iOS', price: 15 },
  { name: 'Quick Surveys', image: '/images/offers/offer-7.png', tags: ['Easy', 'Fast Payout'], platform: 'Any', price: 3.5, subtitle: 'Complete surveys' },
  { name: 'App Tasks', image: '/images/offers/offer-8.png', tags: ['Easy Tasks', 'No Purchase'], platform: 'Any', price: 2, subtitle: 'Easy tasks' },
];

const FILTER_TABS = [
  { label: 'All Offers', key: 'all', icon: null },
  { label: 'High Paying', key: 'High Paying', icon: Flame },
  { label: 'Fast Payout', key: 'Fast Payout', icon: Zap },
  { label: 'No Purchase', key: 'No Purchase', icon: X },
  { label: 'Easy Tasks', key: 'Easy Tasks', icon: Star },
];

const TAG_COLORS: Record<string, string> = {
  'High Paying': '#F5A623',
  'Fast Payout': '#00FF85',
  'Easy': '#7B5CF0',
  'Easy Tasks': '#7B5CF0',
  'No Purchase': '#00D4FF',
  'Popular': '#FF4444',
};

function TagPill({ label }: { label: string }) {
  const color = TAG_COLORS[label] ?? '#ffffff';
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: '#13132b', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Artwork image */}
      <div className="relative w-full h-40 overflow-hidden">
        <Image
          src={offer.image}
          alt={offer.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {offer.hot && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
            <span
              className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
              style={{ background: '#FF4444' }}
            >
              HOT
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-[15px] font-semibold text-white leading-snug">{offer.name}</p>
          {offer.subtitle && (
            <p className="text-[11px] text-white/40 mt-0.5">{offer.subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {offer.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>

        <p className="text-[11px] text-white/35">{offer.platform}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className="text-[22px] font-semibold"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              color: '#00FF85',
            }}
          >
            ${offer.price.toFixed(2)}
          </span>
        </div>

        <Link
          href="/auth/signup"
          className="w-full text-center py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors btn-purple"
        >
          Start Offer
        </Link>
      </div>
    </div>
  );
}

export function OffersSection() {
  const [activeTab, setActiveTab] = useState('all');
  const prefersReduced = useReducedMotion();

  const filtered =
    activeTab === 'all'
      ? OFFERS
      : OFFERS.filter((o) => o.tags.some((t) => t === activeTab));

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={prefersReduced ? undefined : stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex items-end justify-between mb-8 gap-4"
        >
          <div className="space-y-2">
            <motion.p
              variants={prefersReduced ? undefined : fadeUp}
              className="text-[11px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: '#00FF85' }}
            >
              Top Offers
            </motion.p>
            <motion.h2
              variants={prefersReduced ? undefined : fadeUp}
              className="font-bold text-white"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(26px, 4vw, 38px)' }}
            >
              Hand-picked offers with the best payouts
            </motion.h2>
          </div>
          <Link
            href="/games"
            className="shrink-0 hidden sm:flex items-center gap-1 text-[13px] font-medium text-white/50 hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/[0.08] hover:border-white/15"
          >
            View All <ChevronRight size={14} />
          </Link>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          variants={prefersReduced ? undefined : fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none"
        >
          {FILTER_TABS.map(({ label, key, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="shrink-0 flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00FF85]"
                style={{
                  background: isActive ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#0d0d1a' : 'rgba(255,255,255,0.55)',
                  border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {Icon && <Icon size={12} />}
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* Offers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((offer) => (
            <OfferCard key={offer.name} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default OffersSection;
