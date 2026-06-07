"use client";

import { CheckCircle, Target, Zap, Shield, Star } from "lucide-react";

const badges = [
  {
    icon: CheckCircle,
    title: "Verified Offers",
    description: "All offers pre-screened"
  },
  {
    icon: Target,
    title: "High Tracking",
    description: "95%+ completion rate"
  },
  {
    icon: Zap,
    title: "Fast Payouts",
    description: "24-48 hour processing"
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Bank-level encryption"
  },
  {
    icon: Star,
    title: "4.8/5 Rating",
    description: "Trusted by thousands"
  }
];

export default function TrustBadges() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.title}
            className="flex flex-col items-center rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-center transition-all hover:border-[#18D9FF]/30 hover:bg-white/[0.05]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18D9FF]/20 to-[#7C3DFF]/20">
              <Icon className="h-7 w-7 text-[#18D9FF]" />
            </div>
            <p className="mt-4 text-base font-black text-white">
              {badge.title}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {badge.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Made with Bob
