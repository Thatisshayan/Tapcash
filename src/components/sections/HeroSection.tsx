'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, animate, useReducedMotion } from 'framer-motion';
import { Zap, Shield, Gift, ArrowRight, Wallet, Gamepad2, Gem, DollarSign } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

const AVATAR_DATA = [
  { initials: 'A', color: '#7B5CF0' },
  { initials: 'J', color: '#00FF85' },
  { initials: 'S', color: '#00D4FF' },
  { initials: 'M', color: '#F5A623' },
];

function SocialProofBar() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        {AVATAR_DATA.map((a, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-[#0d0d1a]"
            style={{ background: a.color, marginLeft: i > 0 ? '-8px' : '0' }}
          >
            {a.initials}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-breathe-dot" />
        <span className="text-[13px] text-white/60">2,847+ users cashed out in last 24h</span>
      </div>
    </div>
  );
}

function EarningsCounter() {
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const target = 2547382;
    if (prefersReduced) {
      if (displayRef.current) displayRef.current.textContent = `$${target.toLocaleString()} paid out`;
      return;
    }
    const controls = animate(motionVal, target, {
      duration: 2.5,
      ease: 'easeOut',
      onUpdate(v) {
        if (displayRef.current) {
          displayRef.current.textContent = `$${Math.floor(v).toLocaleString()} paid out`;
        }
      },
    });
    return () => controls.stop();
  }, [motionVal, prefersReduced]);

  return (
    <span
      ref={displayRef}
      style={{
        fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
        fontSize: '28px',
        fontWeight: 700,
        lineHeight: 1,
        color: '#00FF85',
        animation: prefersReduced ? undefined : 'earningsPulse 4s ease-in-out infinite',
      }}
    >
      $0 paid out
    </span>
  );
}

const MICROBADGES = [
  { icon: Zap, label: 'Instant Payouts' },
  { icon: Shield, label: 'Secure & Verified' },
  { icon: Gift, label: '100% Free to Use' },
  { icon: DollarSign, label: 'No Hidden Fees' },
];

function FloatingGameElement({
  icon: Icon,
  color,
  className,
  delay = 0,
}: {
  icon: React.ElementType;
  color: string;
  className: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute ${className} w-10 h-10 rounded-full flex items-center justify-center`}
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        animation: `floatSlow 5s ease-in-out infinite ${delay}s`,
      }}
    >
      <Icon size={18} style={{ color }} />
    </div>
  );
}

function BalanceCard() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">Your Balance</span>
        <Wallet size={14} className="text-white/30" />
      </div>
      <div className="flex items-end gap-2">
        <span
          className="text-[32px] font-bold leading-none"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#00FF85' }}
        >
          $12.50
        </span>
        <span className="text-[12px] text-[#00FF85] mb-1">+$4.20 today ↑</span>
      </div>
      <div className="space-y-1.5">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '62.5%' }} />
        </div>
        <div className="flex justify-between text-[11px] text-white/30">
          <span>Min. $20 to withdraw</span>
          <span>$12.50 / $20</span>
        </div>
      </div>
    </div>
  );
}

function LivePayoutCard() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">Live Payout</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF85]" style={{ animation: 'breatheDot 1.5s ease-in-out infinite' }} />
          <span className="text-[10px] text-white/40">Just now</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#003087] flex items-center justify-center text-white text-[13px] font-black shrink-0">
          P
        </div>
        <div>
          <p className="text-[12px] text-white/60">Emma W. cashed out</p>
          <p
            className="text-[22px] font-bold leading-tight"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#00FF85' }}
          >
            $125.00
          </p>
          <p className="text-[11px] text-white/30">via PayPal</p>
        </div>
      </div>
    </div>
  );
}

function BonusCard() {
  return (
    <div
      className="p-4 rounded-2xl space-y-2"
      style={{
        background: '#13132b',
        border: '1px solid #F5A623',
        boxShadow: '0 0 20px rgba(245,166,35,0.12)',
      }}
    >
      <div className="flex items-center gap-2">
        <Gift size={16} style={{ color: '#F5A623' }} />
        <span className="text-[10px] font-semibold tracking-widest text-[#F5A623] uppercase">New to TapCash?</span>
      </div>
      <p className="text-[13px] text-white/70 leading-snug">
        Get <span className="font-bold text-white">$1.00 BONUS</span> when you complete your first offer.
      </p>
      <Link
        href="/auth/signup"
        className="flex items-center gap-1 text-[12px] font-semibold text-[#F5A623] hover:underline mt-1"
      >
        Claim bonus <ArrowRight size={12} />
      </Link>
    </div>
  );
}

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative min-h-[calc(100vh-64px)] flex items-center py-16 lg:py-0 overflow-hidden"
      style={{ backgroundColor: '#0d0d1a' }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(123,92,240,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(0,255,133,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_35%_25%] gap-8 lg:gap-6 items-center min-h-[calc(100vh-64px)] py-16">

          {/* LEFT COLUMN */}
          <motion.div
            variants={prefersReduced ? undefined : stagger}
            initial="hidden"
            animate="show"
            className="space-y-6 order-2 lg:order-1"
          >
            <motion.div variants={prefersReduced ? undefined : fadeUp}>
              <SocialProofBar />
            </motion.div>

            <motion.h1
              variants={prefersReduced ? undefined : fadeUp}
              className="font-bold leading-[1.05] tracking-tight"
              style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: 'clamp(42px, 5.5vw, 68px)',
              }}
            >
              <span className="block text-white">Play. Track.</span>
              <span className="block text-gradient-green-cyan">Cash Out.</span>
            </motion.h1>

            <motion.p
              variants={prefersReduced ? undefined : fadeUp}
              className="text-[17px] leading-relaxed max-w-md"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Real offers. Real rewards. Real cash in your account.
            </motion.p>

            <motion.div variants={prefersReduced ? undefined : fadeUp}>
              <EarningsCounter />
            </motion.div>

            {/* Microbadges 2×2 */}
            <motion.div
              variants={prefersReduced ? undefined : fadeUp}
              className="grid grid-cols-2 gap-2"
            >
              {MICROBADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-2 text-[12px] text-white/60 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Icon size={13} style={{ color: '#00FF85', flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={prefersReduced ? undefined : fadeUp}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full btn-primary text-[15px] font-bold"
                style={{ boxShadow: '0 0 30px rgba(0,255,133,0.3)' }}
              >
                Start My First Offer
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[14px] font-medium text-white/60 hover:text-white/90 border border-white/[0.12] hover:border-white/20 transition-all"
              >
                See How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* CENTER COLUMN — character */}
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center order-1 lg:order-2"
            style={{ minHeight: '400px' }}
          >
            {/* Purple glow behind character */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden
              style={{
                background: 'radial-gradient(ellipse 65% 70% at 50% 60%, rgba(123,92,240,0.28) 0%, transparent 70%)',
              }}
            />

            {/* Floating game elements */}
            <FloatingGameElement icon={DollarSign} color="#00FF85" className="top-8 left-4" delay={0} />
            <FloatingGameElement icon={Gamepad2} color="#7B5CF0" className="top-8 right-4" delay={1.5} />
            <FloatingGameElement icon={Gem} color="#00D4FF" className="bottom-12 right-8" delay={0.8} />
            <FloatingGameElement icon={Zap} color="#F5A623" className="bottom-8 left-8" delay={2} />

            {/* Character image */}
            <div
              className="relative w-full"
              style={{
                maxWidth: '380px',
                aspectRatio: '1 / 1.25',
                animation: prefersReduced ? undefined : 'float 6s ease-in-out infinite',
              }}
            >
              <Image
                src="/images/hero/character.png"
                alt="TapCash character holding phone"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 80vw, 35vw"
              />
            </div>
          </motion.div>

          {/* RIGHT COLUMN — glass cards */}
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3 order-3"
          >
            <BalanceCard />
            <LivePayoutCard />
            <BonusCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
