import type { CSSProperties } from 'react';
import { GlassCard } from './GlassCard';

const OFFER_ROWS = [
  { name: 'Monopoly Go', amount: '$35.00', paid: true },
  { name: 'Royal Match', amount: '$22.00', paid: true },
  { name: 'Coin Master', amount: '$18.00', paid: false },
];

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
};

export function DashboardMockup({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <GlassCard variant="elevated" className={`p-6 w-full ${className}`} style={style}>
      {/* Balance */}
      <div className="mb-5">
        <p className="text-[11px] text-white/40 uppercase tracking-widest mb-1">Your Balance</p>
        <p style={{ ...MONO, fontSize: '36px', fontWeight: 700, color: '#FFAB00', lineHeight: 1 }}>
          $247.50
        </p>
      </div>

      {/* TapScore ring */}
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/[0.05]">
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90" aria-hidden>
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="#00C97F"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * 0.06}`}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
            style={MONO}
          >
            94
          </span>
        </div>
        <div>
          <p className="text-[11px] text-white/40 mb-0.5">TapScore™</p>
          <p className="text-sm font-medium text-white">Excellent</p>
          <p className="text-[11px] text-[#00C97F]">Top 6% of users</p>
        </div>
      </div>

      {/* Offer rows */}
      <div className="space-y-0">
        <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2">Recent offers</p>
        {OFFER_ROWS.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
          >
            <span className="text-sm text-white/70">{row.name}</span>
            <div className="flex items-center gap-2">
              <span style={{ ...MONO, fontSize: '14px', color: '#FFAB00' }}>{row.amount}</span>
              {row.paid ? (
                <span className="text-[10px] bg-[#00C97F]/10 text-[#00C97F] rounded-full px-2 py-0.5">
                  Paid ✓
                </span>
              ) : (
                <span className="text-[10px] bg-white/[0.04] text-white/40 rounded-full px-2 py-0.5">
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default DashboardMockup;
