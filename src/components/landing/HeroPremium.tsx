'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroPremium() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#050813] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(49,240,111,0.18),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(24,217,255,0.16),transparent_30%),radial-gradient(circle_at_50%_85%,rgba(124,61,255,0.14),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            className="max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-[#31F06F]/30 bg-[#31F06F]/10 px-4 py-2 text-sm font-bold text-[#8CF8E9]"
              variants={itemVariants}
            >
              <Zap className="h-4 w-4" />
              Ledger-backed rewards, clean payouts
            </motion.div>

            <motion.h1
              className="mt-8 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
              variants={itemVariants}
            >
              Play games.
              <span className="block bg-gradient-to-r from-[#31F06F] via-[#18D9FF] to-[#7C3DFF] bg-clip-text text-transparent">
                Earn cash.
              </span>
              Cash out cleanly.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300"
              variants={itemVariants}
            >
              TapCash connects real offers, verified activity, and a transparent ledger so every reward has a clear path from play to payout.
            </motion.p>

            <motion.div className="mt-9 flex flex-col gap-4 sm:flex-row" variants={itemVariants}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#31F06F] to-[#18D9FF] px-8 py-4 font-black text-[#051018] shadow-[0_20px_60px_rgba(49,240,111,0.24)] transition hover:scale-[1.02]"
              >
                Start Earning Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 font-black text-white backdrop-blur transition hover:border-[#18D9FF]/40 hover:bg-white/[0.07]"
              >
                See How It Works
              </Link>
            </motion.div>

            <motion.div className="mt-10 grid gap-3 sm:grid-cols-3" variants={itemVariants}>
              {[
                ['Verified offers', 'Curated games and tasks with clear requirements.'],
                ['Tracked ledger', 'Every reward and payout is visible in your account.'],
                ['Clean cashout', 'Payouts are reviewed before money leaves the platform.'],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                >
                  <CheckCircle2 className="mb-3 h-5 w-5 text-[#31F06F]" />
                  <p className="text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#31F06F]/20 via-[#18D9FF]/16 to-[#7C3DFF]/20 blur-3xl" />
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#07101D]">
                <Image
                  src="/images/assets/ChatGPTImageJun14,2026,05_12_45PM.png"
                  alt="TapCash earning dashboard preview"
                  width={720}
                  height={960}
                  priority
                  className="w-full object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  ['2.3K+', 'users cashed out'],
                  ['98%', 'offer verification'],
                  ['24/7', 'ledger tracking'],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-[#07101D]/80 p-4 text-center"
                  >
                    <p className="text-xl font-black text-[#31F06F]">{value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#18D9FF]/20 bg-[#18D9FF]/10 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-[#18D9FF]" />
                  <div>
                    <p className="text-sm font-black text-white">Fraud-aware signup</p>
                    <p className="text-xs text-slate-400">Device, email, and IP checks protect real earners.</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-[#8CF8E9]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
