import { Gamepad2, Activity, Clock, CheckCircle2, DollarSign } from 'lucide-react';

const GOLD = '#D9B678';
const GOLD_BRIGHT = '#F0CE97';

const STEPS = [
  { icon: Gamepad2, label: 'Choose Offer', sub: 'Browse & pick' },
  { icon: Activity, label: 'Tracking Active', sub: 'We monitor it' },
  { icon: Clock, label: 'Pending', sub: 'Under review' },
  { icon: CheckCircle2, label: 'Approved', sub: 'Confirmed' },
  { icon: DollarSign, label: 'Cashed Out', sub: 'In your account' },
];

export function CashPathSection() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#0A0A0D' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Label row */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[13px] font-bold tracking-[0.12em] uppercase" style={{ color: GOLD_BRIGHT }}>
            CashPath&trade;
          </span>
        </div>
        <p className="text-[15px] text-[rgba(245,243,239,0.5)] mb-10 max-w-lg">
          Every earning follows the same five stages, start to finish — this is the concept, not a live status
          (see your real progress on the dashboard once signed in).
        </p>

        {/* Steps -- illustrative sequence, not a live per-user tracker, so no
            step is rendered as artificially "done" (the previous version
            hardcoded the last node to done:true for every visitor, exactly
            the bug REDESIGN_SPEC.md flags). All five render in the same
            neutral gold-outline style. */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-0">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.label} className="flex lg:flex-1 items-center gap-4 lg:gap-0">
                <div className="flex flex-col items-center gap-3">
                  {/* Circle */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`,
                      boxShadow: `0 0 20px ${GOLD}47`,
                    }}
                  >
                    <Icon size={22} color="#1a1408" />
                  </div>
                  {/* Labels */}
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-[#F5F3EF] leading-tight">{step.label}</p>
                    <p className="text-[11px] text-[rgba(245,243,239,0.4)]">{step.sub}</p>
                  </div>
                </div>

                {/* Connector (not after last) */}
                {!isLast && (
                  <div className="hidden lg:flex flex-1 items-center px-2">
                    <div className="w-full h-px" style={{ background: 'rgba(245,243,239,0.12)' }} />
                  </div>
                )}
                {!isLast && (
                  <div className="lg:hidden flex items-center" style={{ marginLeft: '12px' }}>
                    <div className="w-px h-6" style={{ background: 'rgba(245,243,239,0.12)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CashPathSection;
