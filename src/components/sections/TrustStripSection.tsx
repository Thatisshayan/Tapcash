import { Users, Shield, DollarSign, Gift, Zap } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Users,
    title: 'Real People. Real Payouts.',
    sub: 'Join thousands earning daily.',
  },
  {
    icon: Shield,
    title: 'Secure & Verified',
    sub: 'Your data and earnings are always safe.',
  },
  {
    icon: DollarSign,
    title: 'No Hidden Fees',
    sub: 'What you earn is what you get.',
  },
  {
    icon: Gift,
    title: '100% Free to Use',
    sub: 'Start earning in seconds.',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    sub: 'Get paid fast, every time.',
  },
];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = !filled && i === full && half;
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1L8.545 5.09H13L9.6 7.59L10.9 12L7 9.5L3.1 12L4.4 7.59L1 5.09H5.455L7 1Z"
              fill={filled ? '#00C853' : isHalf ? 'url(#half)' : 'rgba(255,255,255,0.12)'}
            />
            {isHalf && (
              <defs>
                <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#00C853" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
                </linearGradient>
              </defs>
            )}
          </svg>
        );
      })}
    </div>
  );
}

export function TrustStripSection() {
  return (
    <section
      className="border-t"
      style={{ backgroundColor: '#0d0d1a', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 items-start">
          {/* Trust items — 5 columns */}
          {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3 lg:col-span-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(123,92,240,0.15)' }}
              >
                <Icon size={16} style={{ color: '#7B5CF0' }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-snug">{title}</p>
                <p className="text-[12px] text-white/40 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          {/* Trustpilot block */}
          <div className="flex flex-col gap-2 lg:col-span-1">
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-sm flex items-center justify-center"
                style={{ background: '#00B67A' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="text-[12px] font-bold text-white">Trustpilot</span>
            </div>
            <StarRating rating={4.8} />
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-[22px] font-bold text-white"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                4.8
              </span>
              <span className="text-[12px] text-white/40">/ 5</span>
            </div>
            <p className="text-[11px] text-white/40">Excellent on Trustpilot</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustStripSection;
