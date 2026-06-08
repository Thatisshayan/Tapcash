'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function PremiumHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="model-u-header sticky top-0 z-50 backdrop-blur-lg bg-[rgba(5,8,19,0.8)]"
    >
      {/* Logo */}
      <Link href="/" className="model-u-brand">
        <Image
          src="/logos/tapcash-logo-horizontal.svg"
          alt="TapCash"
          width={230}
          height={40}
          priority
        />
      </Link>

      {/* Navigation */}
      <nav className="model-u-nav hidden lg:flex">
        <Link href="/earn" className="hover:text-[#18D9FF] transition-colors">
          Earn
        </Link>
        <Link href="/cashout" className="hover:text-[#18D9FF] transition-colors">
          Cash Out
        </Link>
        <Link href="/activity" className="hover:text-[#18D9FF] transition-colors">
          Activity
        </Link>
        <Link href="/leaderboard" className="hover:text-[#18D9FF] transition-colors">
          Leaderboard
        </Link>
      </nav>

      {/* Actions */}
      <div className="model-u-header-actions">
        <button className="model-u-btn-ghost hidden sm:inline-flex">
          Sign In
        </button>
        <button className="model-u-btn-primary text-base px-6 py-3">
          Get Started
        </button>
      </div>
    </motion.header>
  );
}

// Made with Bob
