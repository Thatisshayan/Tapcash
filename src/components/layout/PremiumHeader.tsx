'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const AvatarGroup = () => (
  <div className="flex items-center -space-x-2">
    <div className="w-7 h-7 rounded-full border-2 border-[#050813] bg-gradient-to-br from-[#31F06F] to-[#18D9FF]" />
    <div className="w-7 h-7 rounded-full border-2 border-[#050813] bg-gradient-to-br from-[#7C3DFF] to-[#18D9FF]" />
    <div className="w-7 h-7 rounded-full border-2 border-[#050813] bg-gradient-to-br from-[#31F06F] to-[#7C3DFF]" />
  </div>
);

export default function PremiumHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="model-u-header sticky top-0 z-50 backdrop-blur-lg bg-[rgba(5,8,19,0.8)]"
    >
      {/* Left Side - Logo */}
      <Link href="/" className="model-u-brand flex items-center gap-3">
        <span className="text-[28px] font-black uppercase tracking-tight">
          <span className="text-white">TAP</span>
          <span className="text-[#31F06F]">CASH</span>
        </span>
      </Link>

      {/* Middle Navigation */}
      <nav className="model-u-nav hidden lg:flex">
        <Link href="/games" className="hover:text-[#18D9FF] transition-colors">Games</Link>
        <Link href="/how-it-works" className="hover:text-[#18D9FF] transition-colors">How It Works</Link>
        <Link href="/cashPath" className="hover:text-[#18D9FF] transition-colors">CashPath</Link>
        <Link href="/rewards" className="hover:text-[#18D9FF] transition-colors">Rewards</Link>
        <Link href="/blog" className="hover:text-[#18D9FF] transition-colors">Blog</Link>
      </nav>

      {/* Right Side - Social Proof & Actions */}
      <div className="model-u-header-actions flex items-center gap-5">
        {/* Social Proof */}
        <div className="hidden lg:flex items-center gap-3">
          <AvatarGroup />
          <div className="text-sm">
            <span className="text-white font-bold">2.3K+</span>
            <span className="text-[#9AA8C6] ml-1">users cashed out</span>
            <span className="text-[#9AA8C6] block -mt-1 text-xs">in the last 24h</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#31F06F] animate-pulse" />
        </div>

        {/* Actions */}
        <button className="model-u-btn-ghost hidden sm:inline-flex">
          Log In
        </button>
        <button className="model-u-btn-primary text-base px-6 py-3">
          Sign Up Free
        </button>

        {/* Mobile Menu */}
        <button className="lg:hidden model-u-btn-ghost" aria-label="Menu">
          <ChevronDown size={20} />
        </button>
      </div>
    </motion.header>
  );
}

// Made with Bob
