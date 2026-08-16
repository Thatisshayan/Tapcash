'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, Zap, X, Star, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { fadeUp, stagger, tiltSpring } from '@/lib/motion';

interface Offer {
  name: string;
  image: string;
  tags: string[];
  platform: string;
  price: number;
  hot?: boolean;
  subtitle?: string;
}

// NOTE: this list is static demo/placeholder content, not fetched from a live
// offers feed. Pre-existing before this Aurora reskin pass -- flagged in
// docs/governance/DEFERRED_WORK.md rather than "fixed" as a scope-creep side
// quest (visual-only pass per task scope).
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

// Aurora semantic accents only -- no green/no neon (packages/tokens/tokens.json semantic block).
const TAG_COLORS: Record<string, string> = {
  'High Paying': 'var(--color-brand-green)', // Aurora gold D9B678
  'Fast Payout': 'var(--color-brand-cyan)', // Aurora blue 3E6FD9
  'Easy': 'var(--color-brand-purple)', // Aurora violet 6C5CE0
  'Easy Tasks': 'var(--color-brand-purple)',
  'No Purchase': 'var(--color-brand-cyan)',
  'Popular': 'var(--color-hot-red)',
};

function TagPill({ label }: { label: string }) {
  const color = TAG_COLORS[label] ?? 'var(--color-text-primary)';
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm"
      style={{ background: 'rgba(10,10,13,0.55)', color }}
    >
      {label}
    </span>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const prefersReduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), tiltSpring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), tiltSpring);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: prefersReduced ? 0 : rotateX,
        rotateY: prefersReduced ? 0 : rotateY,
        transformPerspective: 900,
        boxShadow: 'var(--shadow-card-elevated)',
      }}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden will-change-transform"
    >
      {/* Image-led tile: no card fill, no border box -- the photo IS the card */}
      <Image
        src={offer.image}
        alt={offer.name}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-black/5" />

      {offer.hot && (
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <span
            className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
            style={{ background: 'var(--color-hot-red)' }}
          >
            HOT
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {offer.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>

        <div>
          <p className="text-[15px] font-semibold text-white leading-snug drop-shadow-sm">{offer.name}</p>
          {offer.subtitle && (
            <p className="text-[11px] text-white/50 mt-0.5">{offer.subtitle}</p>
          )}
        </div>

        <p className="text-[11px] text-white/40">{offer.platform}</p>

        <div className="flex items-center justify-between pt-1">
          <span
            className="text-[22px] font-semibold bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              backgroundImage: 'linear-gradient(100deg, #F0CE97, #D9B678 60%, #B98F4C)',
            }}
          >
            ${offer.price.toFixed(2)}
          </span>
        </div>

        <Link
          href="/auth/signup"
          className="w-full text-center py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #F0CE97, #D9B678)',
            color: 'var(--color-bg-base)',
          }}
        >
          Start Offer
        </Link>
      </div>
    </motion.div>
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
    <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--color-bg-base)' }}>
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
              style={{ color: 'var(--color-brand-green)' }}
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
                className="shrink-0 flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]"
                style={{
                  background: isActive ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  color: isActive ? 'var(--color-bg-base)' : 'rgba(255,255,255,0.55)',
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
