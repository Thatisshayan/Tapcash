'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';

const NAV_ITEMS = [
  { label: 'Games', href: '/games' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'CashPath', href: '/cashPath' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Blog', href: '/blog' },
];

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
          ? 'bg-[#0a0f0d]/80 backdrop-blur-[12px] border-b border-white/[0.06]'
          : 'bg-transparent',
      ].join(' ')}
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="focus-visible:ring-2 focus-visible:ring-[#00C97F] rounded-md outline-none">
          <Logo size="md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#00C97F] rounded outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-xs font-medium text-[#00C97F] bg-white/[0.06] rounded-full px-3 py-1">
            2.3K+ cashed out
          </span>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-[#00C97F] outline-none"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#00C97F] text-[#0a0f0d] hover:bg-[#00F59B] transition-colors focus-visible:ring-2 focus-visible:ring-[#00C97F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f0d] outline-none"
          >
            Sign Up Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white/70 hover:text-white p-2 focus-visible:ring-2 focus-visible:ring-[#00C97F] rounded outline-none"
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
            className="lg:hidden fixed inset-0 top-16 bg-[#0a0f0d] z-40 flex flex-col px-6 pt-8 pb-12 gap-6"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-2xl font-bold text-white/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#00C97F] rounded outline-none"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.06] pt-6 flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="w-full text-center py-3 rounded-xl border border-white/[0.1] text-white/70 font-medium focus-visible:ring-2 focus-visible:ring-[#00C97F] outline-none"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-[#00C97F] text-[#0a0f0d] font-semibold hover:bg-[#00F59B] transition-colors focus-visible:ring-2 focus-visible:ring-[#00C97F] outline-none"
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
