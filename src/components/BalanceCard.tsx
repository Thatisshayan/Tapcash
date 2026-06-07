"use client";

interface BalanceCardProps {
  balance: number;
  todayEarnings: number;
  minWithdraw: number;
}

export default function BalanceCard({ balance, todayEarnings, minWithdraw }: BalanceCardProps) {
  const progress = (balance / minWithdraw) * 100;

  return (
    <div className="rounded-3xl border border-white/8 bg-[#1A1F2E] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
        YOUR BALANCE
      </p>
      
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-5xl font-black text-white">
          ${balance.toFixed(2)}
        </p>
        {todayEarnings > 0 && (
          <span className="text-lg font-bold text-[#31F06F]">
            +${todayEarnings.toFixed(2)} today
          </span>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Min. ${minWithdraw.toFixed(2)} to withdraw</span>
          <span className="font-bold text-white">
            ${balance.toFixed(2)} / ${minWithdraw.toFixed(2)}
          </span>
        </div>
        
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#31F06F] to-[#18D9FF] transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Made with Bob
