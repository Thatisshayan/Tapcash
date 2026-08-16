"use client";

import { CheckCircle, Clock, Eye, FileCheck, Wallet } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: Eye,
    label: "Choose Offer",
    description: "Browse verified offers"
  },
  {
    id: 2,
    icon: Clock,
    label: "Tracking",
    description: "Activity monitored"
  },
  {
    id: 3,
    icon: FileCheck,
    label: "Pending",
    description: "Under review"
  },
  {
    id: 4,
    icon: CheckCircle,
    label: "Approved",
    description: "Reward confirmed"
  },
  {
    id: 5,
    icon: Wallet,
    label: "Cashed Out",
    description: "Money in account"
  }
];

export default function CashPathFlow() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-gradient-to-br from-[#7C3DFF]/20 to-[#18D9FF]/20 shadow-[0_8px_32px_rgba(124,61,255,0.15)]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3DFF] to-[#18D9FF]">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Label */}
                <p className="mt-4 text-sm font-black text-white">
                  {step.label}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="mx-4 flex-1">
                  <div className="h-0.5 w-full bg-gradient-to-r from-[#18D9FF] to-[#7C3DFF]" />
                  <div className="relative -mt-1.5 flex justify-end">
                    <div className="h-3 w-3 rotate-45 border-r-2 border-t-2 border-[#7C3DFF]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob
