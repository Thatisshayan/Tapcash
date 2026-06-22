'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Games', href: '/games' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'CashPath', href: '/cashPath', badge: 'NEW' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Leaderboards', href: '/leaderboard' },
  { label: 'Blog', href: '/blog' },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#31F06F] to-[#18D9FF] flex items-center justify-center font-black text-white text-sm group-hover:scale-105 transition-transform">
        TC
      </div>
      <span className="text-xl font-black tracking-tight">
        <span className="text-white">TAP</span>
        <span className="text-[#31F06F]">CASH</span>
      </span>
    </Link>
  );
}

function AvatarGroup() {
  return (
    <div className="flex items-center -space-x-2">
      {[
        'from-[#31F06F] to-[#18D9FF]',
        'from-[#7C3DFF] to-[#18D9FF]',
        'from-[#31F06F] to-[#7C3DFF]'
      ].map((gradient, idx) => (
        <motion.div
          key={idx}
          className={`w-7 h-7 rounded-full border-2 border-[#050813] bg-gradient-to-br ${gradient}`}
          animate={{ y: [0, -3, 0] }}
          transition={{ delay: idx * 0.1, duration: 3, repeat: Infinity }}
        />
      ))}
      <div className="ml-3 flex items-center gap-1.5">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-[#31F06F]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs text-white/50">2.3K+ cashed out today</span>
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
        scrolled ? 'backdrop-blur-xl border-b' : '',
      ].join(' ')}
      style={{
        backgroundColor: scrolled ? 'rgba(5,8,19,0.85)' : '#050813',
        borderColor: 'rgba(150,190,255,0.1)',
      }}
    >
      {children}
    </header>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  return (
    <NavScrollShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 ml-4">
          {NAV_ITEMS.map((item, idx) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-sm font-semibold text-white/60 hover:text-[#18D9FF] transition-colors relative group focus-visible:ring-2 focus-visible:ring-[#31F06F] rounded outline-none"
              >
                {item.label}
                {item.badge && (
                  <span className="text-[9px] font-bold text-black bg-[#31F06F] rounded-full px-1.5 py-0.5 tracking-wide">
                    {item.badge}
                  </span>
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#18D9FF] to-[#31F06F] group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(150,190,255,0.1)]"
          >
            <AvatarGroup />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <Link
              href="/auth/signin"
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/[0.1] hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#31F06F] outline-none"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-br from-[#31F06F] to-[#18D9FF] text-black hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[#31F06F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050813] outline-none"
            >
              Sign Up Free
            </Link>
          </motion.div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white/70 hover:text-white p-2 focus-visible:ring-2 focus-visible:ring-[#31F06F] rounded outline-none"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden fixed inset-0 top-16 z-40 flex flex-col px-6 pt-8 pb-12 gap-6 overflow-y-auto"
            style={{ backgroundColor: '#050813' }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex items-center gap-2 text-2xl font-bold text-white/80 hover:text-white transition-colors"
              >
                {item.label}
                {item.badge && (
                  <span className="text-[10px] font-bold text-black bg-[#31F06F] rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t pt-6 flex flex-col gap-3" style={{ borderColor: 'rgba(150,190,255,0.1)' }}>
              <Link
                href="/auth/signin"
                onClick={close}
                className="w-full text-center py-3 rounded-xl border border-white/[0.1] text-white/70 font-semibold hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                onClick={close}
                className="w-full text-center py-3 rounded-xl bg-gradient-to-br from-[#31F06F] to-[#18D9FF] text-black font-bold"
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
