'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

const AvatarGroup = () => (
  <motion.div
    className="flex items-center -space-x-2"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3 }}
  >
    {[
      'from-[#31F06F] to-[#18D9FF]',
      'from-[#7C3DFF] to-[#18D9FF]',
      'from-[#31F06F] to-[#7C3DFF]'
    ].map((gradient, idx) => (
      <motion.div
        key={idx}
        className={`w-8 h-8 rounded-full border-2 border-[#050813] bg-gradient-to-br ${gradient}`}
        animate={{ y: [0, -4, 0] }}
        transition={{ delay: idx * 0.1, duration: 3, repeat: Infinity }}
      />
    ))}
  </motion.div>
);

export default function PremiumHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Games', href: '/games' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'CashPath', href: '/cashPath' },
    { label: 'Rewards', href: '/rewards' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(5,8,19,0.85)] border-b border-[rgba(150,190,255,0.1)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#31F06F] to-[#18D9FF] flex items-center justify-center font-black text-white text-sm">
              TC
            </div>
            <span className="text-2xl font-black uppercase tracking-tight hidden sm:inline">
              <span className="text-white">TAP</span>
              <span className="text-[#31F06F]">CASH</span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 ml-12">
          {navItems.map((item, idx) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Link
                href={item.href}
                className="text-sm font-semibold text-[#D7DEEF] hover:text-[#18D9FF] transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#18D9FF] to-[#31F06F] group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right Side - Social Proof & Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Social Proof - Desktop Only */}
          <motion.div
            className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(150,190,255,0.1)]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AvatarGroup />
            <div className="text-sm border-l border-[rgba(150,190,255,0.2)] pl-4">
              <div className="text-white font-bold">2.3K+</div>
              <div className="text-xs text-[#9AA8C6]">users cashed out</div>
            </div>
            <motion.span
              className="w-2 h-2 rounded-full bg-[#31F06F]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Auth Actions */}
          <motion.div
            className="hidden sm:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/auth/signin"
              className="model-u-btn-secondary text-sm"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="model-u-btn-primary text-sm"
            >
              Sign Up Free
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden model-u-btn-ghost p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden overflow-hidden border-t border-[rgba(150,190,255,0.1)]"
      >
        <div className="px-4 py-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-sm font-semibold text-[#D7DEEF] hover:text-[#18D9FF] transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-[rgba(150,190,255,0.1)] pt-3 space-y-2">
            <Link href="/auth/signin" className="w-full model-u-btn-secondary text-sm">
              Log In
            </Link>
            <Link href="/auth/signup" className="w-full model-u-btn-primary text-sm">
              Sign Up Free
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
