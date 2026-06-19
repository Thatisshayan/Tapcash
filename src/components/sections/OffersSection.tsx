'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { Trophy, Gamepad2, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeUp, stagger } from '@/lib/motion';

type IconName = 'Trophy' | 'Gamepad2' | 'Zap';

interface Offer {
  name: string;
  icon: IconName;
  platform: string;
  score: number;
  earn: number;
  difficulty: string;
  featured?: boolean;
}

const OFFERS: Offer[] = [
  { name: 'Monopoly Go!', icon: 'Trophy', platform: 'iOS', score: 94, earn: 35, difficulty: 'Easy', featured: true },
  { name: 'Warzone Mobile', icon: 'Gamepad2', platform: 'Android', score: 87, earn: 25, difficulty: 'Medium' },
  { name: 'Bingo Blitz', icon: 'Zap', platform: 'iOS', score: 91, earn: 20, difficulty: 'Easy' },
  { name: 'Coin Master', icon: 'Trophy', platform: 'Both', score: 89, earn: 18, difficulty: 'Easy' },
  { name: 'Royal Match', icon: 'Gamepad2', platform: 'iOS', score: 93, earn: 22, difficulty: 'Easy' },
  { name: 'Merge Dragons', icon: 'Zap', platform: 'Android', score: 85, earn: 15, difficulty: 'Medium' },
];

const ICON_MAP = { Trophy, Gamepad2, Zap };

function scoreColor(score: number) {
  if (score >= 90) return '#00C97F';
  if (score >= 80) return '#FFAB00';
  return '#ef4444';
}

function TapScoreRing({ score }: { score: number }) {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = scoreColor(score);

  return (
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 32 32" className="w-8 h-8 -rotate-90">
        <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
        style={{ color, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
      >
        {score}
      </span>
    </div>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 280, damping: 28 });
  const springY = useSpring(rotateY, { stiffness: 280, damping: 28 });
  const prefersReduced = useReducedMotion();

  const Icon = ICON_MAP[offer.icon];

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(cx * 10);
    rotateX.set(-cy * 10);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      style={prefersReduced ? undefined : { rotateX: springX, rotateY: springY, transformPerspective: 800 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={prefersReduced ? undefined : { scale: 1.02, boxShadow: '0 0 30px rgba(0,201,127,0.2)' }}
      className={offer.featured ? 'row-span-2' : ''}
    >
      <GlassCard className={`p-5 h-full flex flex-col gap-4 ${offer.featured ? 'border-[#00C97F]/20' : ''}`}>
        {offer.featured && (
          <span className="self-start text-[10px] font-semibold text-[#00C97F] bg-[#00C97F]/10 rounded-full px-2.5 py-0.5 tracking-wider uppercase">
            Featured
          </span>
        )}

        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={18} className="text-[#00C97F]" />
            <div>
              <p className="text-sm font-medium text-white leading-tight">{offer.name}</p>
              <p className="text-[11px] text-white/40">{offer.platform}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <TapScoreRing score={offer.score} />
            <span className="text-[9px] text-white/30 uppercase tracking-wider">TapScore</span>
          </div>
        </div>

        {/* Earn amount */}
        <p
          className="text-[#FFAB00] leading-none"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: offer.featured ? '44px' : '36px',
            fontWeight: 700,
          }}
        >
          ${offer.earn.toFixed(2)}
        </p>

        {/* Tags */}
        <p className="text-[12px] text-white/50">
          {offer.difficulty} · ~{offer.difficulty === 'Easy' ? '15' : '30'} min
        </p>

        {/* CTA */}
        <a
          href="/auth/signup"
          className="mt-auto text-sm font-medium text-[#00C97F] hover:underline focus-visible:ring-2 focus-visible:ring-[#00C97F] rounded outline-none"
        >
          Start offer →
        </a>
      </GlassCard>
    </motion.div>
  );
}

export function OffersSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={prefersReduced ? undefined : stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14 space-y-3"
        >
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00C97F]"
          >
            Top Offers
          </motion.p>
          <motion.h2
            variants={prefersReduced ? undefined : fadeUp}
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            The highest-paying offers, right now
          </motion.h2>
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="text-white/60 text-base max-w-lg"
          >
            Every offer verified. Every payout tracked.
          </motion.p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {OFFERS.map((offer) => (
            <OfferCard key={offer.name} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default OffersSection;
