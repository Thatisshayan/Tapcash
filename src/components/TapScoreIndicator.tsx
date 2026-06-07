"use client";

import { CheckCircle } from "lucide-react";

interface TapScoreIndicatorProps {
  score: number;
  features?: string[];
}

export default function TapScoreIndicator({ 
  score, 
  features = [
    "Fast Payout",
    "High Tracking",
    "No Purchase",
    "Easy to Complete"
  ]
}: TapScoreIndicatorProps) {
  // Calculate circle properties
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
      {/* Circular Score Indicator */}
      <div className="relative flex h-64 w-64 shrink-0 items-center justify-center">
        {/* Background circle */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#31F06F" />
              <stop offset="50%" stopColor="#18D9FF" />
              <stop offset="100%" stopColor="#7C3DFF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score text */}
        <div className="relative text-center">
          <p className="font-display text-7xl font-black text-[#31F06F]">
            {score}
            <span className="text-5xl">%</span>
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            TapScore™
          </p>
        </div>
      </div>

      {/* Features list */}
      <div className="flex-1 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#31F06F]/10">
              <CheckCircle className="h-5 w-5 text-[#31F06F]" />
            </div>
            <p className="text-base font-semibold text-white">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
