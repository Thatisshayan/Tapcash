import { CreditCard, Building2, ShoppingBag, Bitcoin, Landmark, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

/* TODO: Replace with official PayPal/Interac SVG logos when available */

const METHODS = [
  { icon: CreditCard, name: 'PayPal', interac: false },
  { icon: Building2, name: 'Interac e-Transfer', interac: true },
  { icon: ShoppingBag, name: 'Amazon Gift Card', interac: false },
  { icon: Bitcoin, name: 'Crypto', interac: false },
  { icon: Landmark, name: 'Bank Transfer', interac: false },
];

export function PayoutMethodsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00C97F]">
            Cash Out Your Way
          </p>
          <h2
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)' }}
          >
            Fast payouts, your preferred method.
          </h2>
        </div>

        {/* Method cards */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {METHODS.map(({ icon: Icon, name, interac }) => (
            <GlassCard
              key={name}
              className="p-5 flex flex-col items-center gap-3 min-w-[140px] flex-1 max-w-[180px]"
            >
              <Icon size={24} className="text-[#00C97F]" aria-hidden />
              <div className="text-center">
                <p className="text-sm font-medium text-white leading-tight">{name}</p>
                {interac && (
                  <span className="text-[11px] text-white/50 mt-0.5 block">🍁 Canada</span>
                )}
              </div>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#00C97F]/10 text-[#00C97F]">
                Available
              </span>
            </GlassCard>
          ))}
        </div>

        {/* Interac note */}
        <p className="text-center text-[13px] text-white/50 max-w-lg mx-auto mb-12">
          Canadian users: Interac e-Transfer deposits directly to your bank — no middleman.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6">
          {['SSL Secure', 'PIPEDA Compliant', 'CASL Compliant'].map((badge) => (
            <span key={badge} className="flex items-center gap-1.5 text-[12px] text-white/40">
              <Shield size={13} className="text-white/30" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PayoutMethodsSection;
