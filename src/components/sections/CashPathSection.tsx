import { Gamepad2, Activity, Clock, CheckCircle2, DollarSign, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    icon: Gamepad2,
    label: 'Choose Offer',
    sub: 'Browse & pick',
    done: false,
  },
  {
    icon: Activity,
    label: 'Tracking Active',
    sub: 'We monitor it',
    done: false,
  },
  {
    icon: Clock,
    label: 'Pending',
    sub: 'Under review',
    done: false,
  },
  {
    icon: CheckCircle2,
    label: 'Approved',
    sub: 'Confirmed ✓',
    done: false,
  },
  {
    icon: DollarSign,
    label: 'Cashed Out',
    sub: 'In your account',
    done: true,
  },
];

export function CashPathSection() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Label row */}
        <div className="flex items-center gap-3 mb-10">
          <span
            className="text-[13px] font-bold tracking-[0.12em] uppercase"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', color: '#00FF85' }}
          >
            CASHPATH LIVE™
          </span>
          <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-breathe-dot" />
          <span className="text-[13px] text-white/40">Track your reward in real time</span>
        </div>

        {/* Steps */}
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
                      background: step.done
                        ? 'linear-gradient(135deg, #00FF85, #00CC6A)'
                        : 'linear-gradient(135deg, #7B5CF0, #5b3fd4)',
                      boxShadow: step.done
                        ? '0 0 24px rgba(0,255,133,0.3)'
                        : '0 0 24px rgba(123,92,240,0.3)',
                    }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  {/* Labels */}
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-white leading-tight">{step.label}</p>
                    <p className="text-[11px] text-white/40">{step.sub}</p>
                  </div>
                </div>

                {/* Arrow connector (not after last) */}
                {!isLast && (
                  <div className="hidden lg:flex flex-1 items-center justify-center px-2">
                    <ChevronRight size={20} className="text-white/20" />
                  </div>
                )}
                {!isLast && (
                  <div className="lg:hidden flex items-center" style={{ marginLeft: '12px' }}>
                    <div className="w-px h-6 bg-white/10" />
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
