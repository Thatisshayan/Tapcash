import { GlassCard } from '@/components/ui/GlassCard';

/* TODO: Replace with live Trustpilot widget once account is verified */

const PAYOUTS = [
  { name: 'Alex M.', amount: '$125.00', method: 'PayPal', time: '2 hours ago' },
  { name: 'Jordan L.', amount: '$89.00', method: 'Interac', time: '4 hours ago' },
  { name: 'Casey R.', amount: '$156.00', method: 'PayPal', time: '6 hours ago' },
  { name: 'Morgan T.', amount: '$92.00', method: 'Gift Card', time: '9 hours ago' },
  { name: 'Sam K.', amount: '$210.00', method: 'PayPal', time: '12 hours ago' },
  { name: 'Riley D.', amount: '$67.00', method: 'Interac', time: '1 day ago' },
  { name: 'Quinn B.', amount: '$178.00', method: 'PayPal', time: '1 day ago' },
  { name: 'Taylor S.', amount: '$143.00', method: 'Crypto', time: '2 days ago' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
};

function PayoutCard({ payout }: { payout: (typeof PAYOUTS)[0] }) {
  return (
    <GlassCard className="p-5 space-y-3">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: 'rgba(0,201,127,0.15)', color: '#00C97F' }}
          aria-label={payout.name}
        >
          {initials(payout.name)}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{payout.name}</p>
          <p className="text-[11px] text-white/40">{payout.method}</p>
        </div>
      </div>

      {/* Amount */}
      <p style={{ ...MONO, fontSize: '24px', fontWeight: 700, color: '#FFAB00' }}>
        {payout.amount}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/40">{payout.time}</span>
        <span className="text-[11px] font-semibold text-[#00C97F] bg-[#00C97F]/10 rounded-full px-2.5 py-0.5">
          Paid ✓
        </span>
      </div>
    </GlassCard>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: '#0e1a15' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00C97F]">
            Sample Payouts
          </p>
          <h2
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)' }}
          >
            Example earnings from the platform.
          </h2>
          <p className="text-sm text-white/40 max-w-xl">
            Sample payout flows — real users shown with consent after launch.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PAYOUTS.map((p) => (
            <PayoutCard key={p.name + p.time} payout={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
