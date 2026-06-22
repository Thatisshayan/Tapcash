'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Games', href: '/games' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'CashPath', href: '/cashPath', badge: 'NEW' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Leaderboards', href: '/leaderboard' },
  { label: 'Blog', href: '/blog' },
];

const AVATAR_COLORS = ['#7B5CF0', '#00FF85', '#00D4FF'];
const AVATAR_INITIALS = ['A', 'J', 'S'];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <polygon points="14,2 26,24 2,24" fill="#7B5CF0" opacity="0.9" />
        <polygon points="14,8 24,26 4,26" fill="#00FF85" opacity="0.75" />
      </svg>
      <span
        className="text-[17px] font-bold tracking-wide text-white"
        style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
      >
        TAP<span className="text-white">CASH</span>
      </span>
    </div>
  );
}

function AvatarStack() {
  return (
    <div className="hidden lg:flex items-center gap-2.5">
      <div className="flex items-center">
        {AVATAR_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#0d0d1a]"
            style={{ background: color, marginLeft: i > 0 ? '-6px' : '0' }}
          >
            {AVATAR_INITIALS[i]}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF85] animate-breathe-dot" />
        <span className="text-[12px] text-white/50">2,847+ cashed out today</span>
      </div>
    </div>
  );
}

function NavScrollShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'backdrop-blur-[12px] border-b'
          : '',
      ].join(' ')}
      style={{
        backgroundColor: scrolled ? 'rgba(13,13,26,0.9)' : '#0d0d1a',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      {children}
    </header>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <NavScrollShell>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0 focus-visible:ring-2 focus-visible:ring-[#00FF85] rounded-md outline-none">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 text-[14px] font-medium text-white/60 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#00FF85] rounded outline-none"
            >
              {item.label}
              {item.badge && (
                <span className="text-[9px] font-bold text-black bg-[#00FF85] rounded-full px-1.5 py-0.5 tracking-wide">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-4">
          <AvatarStack />
          <Link
            href="/auth/login"
            className="text-[14px] font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/[0.1] hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#00FF85] outline-none"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="text-[13px] font-bold px-4 py-2 rounded-xl text-black btn-gradient focus-visible:ring-2 focus-visible:ring-[#00FF85] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d1a] outline-none"
          >
            Sign Up Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white/70 hover:text-white p-2 focus-visible:ring-2 focus-visible:ring-[#00FF85] rounded outline-none"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden fixed inset-0 top-16 z-40 flex flex-col px-6 pt-8 pb-12 gap-6"
            style={{ backgroundColor: '#0d0d1a' }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-2xl font-bold text-white/80 hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                {item.label}
                {item.badge && (
                  <span className="text-[10px] font-bold text-black bg-[#00FF85] rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t pt-6 flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="w-full text-center py-3 rounded-xl border border-white/[0.1] text-white/70 font-medium"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="w-full text-center py-3 rounded-xl btn-gradient text-black font-bold"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NavScrollShell>
  );
}

export default Navbar;
