import { Shield, DollarSign, Gift, Zap, ShieldCheck } from 'lucide-react';

const VIOLET = '#6C5CE0';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Server-Verified Actions',
    sub: 'Every completion is validated before it hits your ledger.',
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

export function TrustStripSection() {
  return (
    <section
      className="border-t"
      style={{ backgroundColor: '#0A0A0D', borderColor: 'rgba(245,243,239,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
          {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${VIOLET}26` }}
              >
                <Icon size={16} style={{ color: VIOLET }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#F5F3EF] leading-snug">{title}</p>
                <p className="text-[12px] text-[rgba(245,243,239,0.4)] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustStripSection;
