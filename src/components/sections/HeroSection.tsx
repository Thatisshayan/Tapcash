'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap, Shield, Gift, ArrowRight, Wallet, Gamepad2, Gem, DollarSign } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

// Aurora palette (packages/tokens/tokens.json v3.0.0).
const GOLD = '#D9B678';
const GOLD_BRIGHT = '#F0CE97';
const VIOLET = '#6C5CE0';
const BLUE = '#3E6FD9';

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

// Illustrative example of the real balance/CashPath UI a signed-in user sees
// -- not a claim about the visitor's own account (there isn't one yet on a
// logged-out marketing page). Kept as a product preview; the earlier
// "LivePayoutCard" (a fabricated named user + transaction) and
// "EarningsCounter" (an animated fake platform-wide total) were removed
// entirely -- both are hard anti-patterns per tokens.json meta.antiPatterns,
// not something to reskin.
function BalancePreviewCard() {
  return (
    <div className="p-5 space-y-3" style={{ borderTop: `1px solid rgba(245,243,239,0.09)` }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-[rgba(245,243,239,0.4)] uppercase">Your Balance</span>
        <Wallet size={14} className="text-[rgba(245,243,239,0.3)]" />
      </div>
      <div className="flex items-end gap-2">
        <span
          className="text-[32px] font-bold leading-none tabular-nums"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: GOLD_BRIGHT }}
        >
          $12.50
        </span>
        <span className="text-[12px] mb-1" style={{ color: GOLD_BRIGHT }}>+$4.20 today &uarr;</span>
      </div>
      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,243,239,0.1)' }}>
          <div className="h-full rounded-full" style={{ width: '62.5%', background: GOLD }} />
        </div>
        <div className="flex justify-between text-[11px] text-[rgba(245,243,239,0.3)]">
          <span>Min. $20 to withdraw</span>
          <span>$12.50 / $20</span>
        </div>
      </div>
    </div>
  );
}

function BonusCard() {
  return (
    <div className="p-5 space-y-2" style={{ borderTop: `1px solid rgba(245,243,239,0.09)` }}>
      <div className="flex items-center gap-2">
        <Gift size={16} style={{ color: GOLD }} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GOLD }}>New to TapCash?</span>
      </div>
      <p className="text-[13px] text-[rgba(245,243,239,0.7)] leading-snug">
        Get <span className="font-bold text-[#F5F3EF]">$1.00 BONUS</span> when you complete your first offer.
      </p>
      <Link
        href="/auth/signup"
        className="flex items-center gap-1 text-[12px] font-bold hover:underline mt-1"
        style={{ color: GOLD }}
      >
        Claim bonus <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// Illustrative motion moment (empty piggy filling, then breaking open to pay
// out) reinforcing the "cash out" promise -- decorative, not a data claim.
function PiggyMoment() {
  return (
    <div
      className="relative mt-3 flex items-center gap-3 p-4"
      style={{ borderTop: '1px solid rgba(245,243,239,0.09)' }}
    >
      <div className="relative w-12 h-12 shrink-0">
        <Image
          src="/images/aurora/piggy-intact.webp"
          alt=""
          fill
          className="object-contain"
          style={{ animation: 'pigIntactCycle 9s ease-in-out infinite' }}
        />
        <Image
          src="/images/aurora/piggy-broken.webp"
          alt=""
          fill
          className="object-contain absolute inset-0"
          style={{ animation: 'pigBrokenCycle 9s ease-in-out infinite' }}
        />
      </div>
      <p className="text-[12px] leading-snug" style={{ color: 'rgba(245,243,239,0.5)' }}>
        Every offer fills your balance. Hit the minimum, and it&apos;s yours.
      </p>
    </div>
  );
}

const MARQUEE_LOGOS = [
  { src: '/images/logos/timhortons.svg', alt: 'Tim Hortons' },
  { src: '/images/logos/shoppers.svg', alt: 'Shoppers Drug Mart' },
  { src: '/images/logos/cineplex.svg', alt: 'Cineplex' },
  { src: '/images/logos/canadiantire.svg', alt: 'Canadian Tire' },
];

function BrandMarquee() {
  const track = [...MARQUEE_LOGOS, ...MARQUEE_LOGOS];
  return (
    <div
      className="relative z-10 py-6 overflow-hidden"
      style={{ borderTop: '1px solid rgba(245,243,239,0.09)' }}
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee gap-16 px-8">
        {track.map((logo, i) => (
          <div key={`${logo.alt}-${i}`} className="relative h-6 w-24 shrink-0 opacity-50 grayscale">
            <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroHeadline({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <>
      <motion.div variants={prefersReduced ? undefined : fadeUp} className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
        <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: GOLD_BRIGHT }}>
          Verified payouts, real players
        </span>
      </motion.div>

      <motion.h1
        variants={prefersReduced ? undefined : fadeUp}
        className="font-extrabold leading-[1.05] tracking-tight"
        style={{ fontSize: 'clamp(42px, 5.5vw, 68px)' }}
      >
        <span className="block text-[#F5F3EF]">Play. Track.</span>
        <span
          className="block"
          style={{
            background: `linear-gradient(100deg, ${GOLD_BRIGHT}, ${GOLD} 60%, ${BLUE})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Cash Out.
        </span>
      </motion.h1>

      <motion.p
        variants={prefersReduced ? undefined : fadeUp}
        className="text-[17px] leading-relaxed max-w-md"
        style={{ color: 'rgba(245,243,239,0.6)' }}
      >
        Real offers. Real rewards. Real cash in your account.
      </motion.p>
    </>
  );
}

function HeroMicrobadges({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <motion.div variants={prefersReduced ? undefined : fadeUp} className="grid grid-cols-2 gap-2">
      {MICROBADGES.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="flex items-center gap-2 text-[12px] text-[rgba(245,243,239,0.6)] px-3 py-2 rounded-xl"
          style={{ background: 'rgba(245,243,239,0.04)', border: '1px solid rgba(245,243,239,0.07)' }}
        >
          <Icon size={13} style={{ color: GOLD, flexShrink: 0 }} />
          {label}
        </span>
      ))}
    </motion.div>
  );
}

function HeroCTAs({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <motion.div variants={prefersReduced ? undefined : fadeUp} className="flex flex-wrap gap-3">
      <Link
        href="/auth/signup"
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-bold transition-transform hover:-translate-y-0.5"
        style={{
          background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`,
          color: '#1a1408',
          boxShadow: `0 10px 30px ${GOLD}47`,
        }}
      >
        Start My First Offer
        <ArrowRight size={16} />
      </Link>
      <Link
        href="/how-it-works"
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[14px] font-medium text-[rgba(245,243,239,0.6)] hover:text-white border transition-all"
        style={{ borderColor: 'rgba(245,243,239,0.14)' }}
      >
        See How It Works
      </Link>
    </motion.div>
  );
}

function HeroLeftColumn({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <motion.div
      variants={prefersReduced ? undefined : stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 order-2 lg:order-1"
    >
      <HeroHeadline prefersReduced={prefersReduced} />
      <HeroMicrobadges prefersReduced={prefersReduced} />
      <HeroCTAs prefersReduced={prefersReduced} />
    </motion.div>
  );
}

function HeroCharacterColumn({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <motion.div
      initial={prefersReduced ? undefined : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-center justify-center order-1 lg:order-2"
      style={{ minHeight: '400px' }}
    >
      {/* Violet glow behind character */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 65% 70% at 50% 60%, ${VIOLET}47 0%, transparent 70%)`,
        }}
      />

      {/* Floating game elements */}
      <FloatingGameElement icon={DollarSign} color={GOLD} className="top-8 left-4" delay={0} />
      <FloatingGameElement icon={Gamepad2} color={VIOLET} className="top-8 right-4" delay={1.5} />
      <FloatingGameElement icon={Gem} color={BLUE} className="bottom-12 right-8" delay={0.8} />
      <FloatingGameElement icon={Zap} color={GOLD_BRIGHT} className="bottom-8 left-8" delay={2} />

      {/* Character image */}
      <div
        className="relative w-full"
        style={{
          maxWidth: '380px',
          aspectRatio: '1 / 1.25',
          animation: prefersReduced ? undefined : 'breathe 4.5s ease-in-out infinite',
          filter: `drop-shadow(0 30px 60px ${VIOLET}3D)`,
        }}
      >
        <Image
          src="/images/aurora/mascot.webp"
          alt="TapCash mascot"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 80vw, 35vw"
        />
      </div>
    </motion.div>
  );
}

function HeroPreviewColumn() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="order-3"
    >
      <BalancePreviewCard />
      <BonusCard />
      <PiggyMoment />
    </motion.div>
  );
}

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative min-h-[calc(100vh-64px)] flex items-center py-16 lg:py-0 overflow-hidden"
      style={{ backgroundColor: '#0A0A0D' }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            `radial-gradient(ellipse 60% 50% at 50% 40%, ${VIOLET}1F 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 70%, ${GOLD}0F 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_35%_25%] gap-8 lg:gap-6 items-center min-h-[calc(100vh-64px)] py-16">
          <HeroLeftColumn prefersReduced={prefersReduced} />
          <HeroCharacterColumn prefersReduced={prefersReduced} />
          <HeroPreviewColumn />
        </div>
      </div>

      <BrandMarquee />
    </section>
  );
}

export default HeroSection;
