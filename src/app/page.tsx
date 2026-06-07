"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Gamepad2, DollarSign, Gem } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import BalanceCard from "@/components/BalanceCard";
import OfferCard from "@/components/OfferCard";
import CashPathFlow from "@/components/CashPathFlow";
import TapScoreIndicator from "@/components/TapScoreIndicator";
import TrustBadges from "@/components/TrustBadges";

// Mock offers data matching screenshot
const topOffers = [
  {
    id: "vegas-slots",
    title: "Vegas Slots 777",
    description: "Play casino games and win big rewards",
    provider: "Lootably",
    payout: 12000, // $120.00
    category: "Gaming",
    clickUrl: "/rapidoreach",
    image: "/images/games/vegas-slots.svg"
  },
  {
    id: "monopoly-go",
    title: "Monopoly Go!",
    description: "Build your empire in this classic board game",
    provider: "RapidoReach",
    payout: 3500, // $35.00
    category: "Gaming",
    clickUrl: "/rapidoreach",
    image: "/images/games/monopoly-go.svg"
  },
  {
    id: "warzone-mobile",
    title: "Warzone Mobile",
    description: "Battle royale action on your phone",
    provider: "Lootably",
    payout: 2500, // $25.00
    category: "Gaming",
    clickUrl: "/rapidoreach",
    image: "/images/games/warzone-mobile.svg"
  }
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,61,255,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(24,217,255,0.1),transparent_50%)]" />
          
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              {/* Left Side - Hero Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  <ShieldCheck className="h-4 w-4 text-[#18D9FF]" />
                  High-trust rewards
                </div>

                {/* Headline */}
                <h1 className="font-display text-6xl font-black leading-[1.1] tracking-tight lg:text-7xl xl:text-8xl">
                  <span className="block text-white">Play.</span>
                  <span className="block text-[#31F06F]">Earn.</span>
                  <span className="block text-[#18D9FF]">Cash Out.</span>
                </h1>

                {/* Subtext */}
                <p className="max-w-xl text-lg text-zinc-300 lg:text-xl">
                  Play games. Complete offers. Cash out when it clears.
                </p>

                {/* CTA Button */}
                <div>
                  <Link
                    href={user ? "/dashboard" : "/auth/signup"}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#18D9FF] to-[#7C3DFF] px-8 py-4 text-lg font-black text-white shadow-[0_20px_60px_rgba(124,61,255,0.4)] transition-transform hover:-translate-y-1"
                  >
                    Start My Safest Offer
                  </Link>
                </div>

                {/* Feature Icons */}
                <div className="flex gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3DFF]/20 to-[#18D9FF]/20">
                      <Gamepad2 className="h-6 w-6 text-[#18D9FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Play Games</p>
                      <p className="text-xs text-zinc-400">Fun & rewarding</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#31F06F]/20 to-[#18D9FF]/20">
                      <ShieldCheck className="h-6 w-6 text-[#31F06F]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Complete Offers</p>
                      <p className="text-xs text-zinc-400">Verified & safe</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#18D9FF]/20 to-[#7C3DFF]/20">
                      <DollarSign className="h-6 w-6 text-[#18D9FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Cash Out Fast</p>
                      <p className="text-xs text-zinc-400">24-48 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Character Illustration + Balance Card */}
              <div className="relative">
                {/* Balance Card */}
                <div className="mb-6">
                  <BalanceCard
                    balance={12.50}
                    todayEarnings={4.20}
                    minWithdraw={20}
                  />
                </div>

                {/* Character Illustration */}
                <div className="relative flex h-96 items-center justify-center rounded-3xl border border-white/8 bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] overflow-hidden">
                  <Image
                    src="/images/hero-character.svg"
                    alt="TapCash user earning rewards"
                    width={500}
                    height={600}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Offers Section */}
        <section className="border-y border-white/6 bg-[#0F1419] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-wider text-[#18D9FF]">
                Top Offers
              </p>
              <h2 className="mt-2 font-display text-4xl font-black text-white">
                Start with verified offers
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topOffers.map((offer, index) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onEarn={() => {}}
                  featured={index === 0}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CashPath Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-black uppercase tracking-wider text-[#18D9FF]">
                CashPath™
              </p>
              <h2 className="mt-2 font-display text-4xl font-black text-white">
                Track every step. See your reward hit your account.
              </h2>
            </div>

            <CashPathFlow />
          </div>
        </section>

        {/* Mobile Screenshots Section */}
        <section className="border-y border-white/6 bg-[#0F1419] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <p className="text-xs font-black uppercase tracking-wider text-[#18D9FF]">
                See It In Action
              </p>
              <h2 className="mt-2 font-display text-4xl font-black text-white">
                Simple. Fast. Secure.
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Phone Mockup 1 - Offer Details */}
              <div className="flex justify-center">
                <div className="relative">
                  <Image
                    src="/images/mockups/phone-offer-details.svg"
                    alt="TapCash offer details screen"
                    width={300}
                    height={600}
                    className="drop-shadow-2xl"
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <p className="text-xs font-bold text-white">Browse Offers</p>
                  </div>
                </div>
              </div>

              {/* Phone Mockup 2 - Cash Out */}
              <div className="flex justify-center">
                <div className="relative">
                  <Image
                    src="/images/mockups/phone-cashout.svg"
                    alt="TapCash cash out screen"
                    width={300}
                    height={600}
                    className="drop-shadow-2xl"
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <p className="text-xs font-bold text-white">Cash Out Fast</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TapScore Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl border border-white/8 bg-[#1A1F2E] p-8 lg:p-12">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-wider text-[#18D9FF]">
                  TapScore™
                </p>
                <h2 className="mt-2 font-display text-4xl font-black text-white">
                  Know the safest offers before you start.
                </h2>
              </div>

              <TapScoreIndicator score={94} />
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="border-t border-white/6 bg-[#0F1419] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TrustBadges />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-5xl font-black text-white lg:text-6xl">
              Ready to start earning?
            </h2>
            <p className="mt-4 text-xl text-zinc-300">
              Join thousands of users who cash out daily
            </p>
            <div className="mt-8">
              <Link
                href={user ? "/dashboard" : "/auth/signup"}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#18D9FF] via-[#7C3DFF] to-[#31F06F] px-8 py-4 text-lg font-black text-white shadow-[0_20px_60px_rgba(124,61,255,0.4)] transition-transform hover:-translate-y-1"
              >
                {user ? "Open Dashboard" : "Create Free Account"}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
