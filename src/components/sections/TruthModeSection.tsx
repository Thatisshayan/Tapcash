import { CheckCircle2, Cpu, BarChart3, ShieldOff, Trophy } from 'lucide-react';

const TRUTH_BULLETS = [
  { icon: Cpu, text: 'AI detects real user data' },
  { icon: BarChart3, text: 'Shows offer success rate' },
  { icon: ShieldOff, text: 'Removes risky offers' },
  { icon: Trophy, text: 'Brings you the best deals' },
];

const CHECK_BULLETS = [
  'Fast Payout confirmed',
  'No Purchase required',
  'High Tracking accuracy',
  'Easy to Complete',
];

const TAPSCORE_RADIUS = 80;
const TAPSCORE_CIRC = 2 * Math.PI * TAPSCORE_RADIUS;
const TAPSCORE_VALUE = 94;
const TAPSCORE_OFFSET = TAPSCORE_CIRC * (1 - TAPSCORE_VALUE / 100);

export function TruthModeSection() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Truth Mode */}
          <div
            className="rounded-2xl p-7 space-y-5"
            style={{ background: '#13132b', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-1"
                  style={{ color: '#7B5CF0' }}
                >
                  Truth Mode
                </p>
                <p className="font-bold text-white text-[22px]" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
                  We show you the truth.
                </p>
              </div>
              {/* Toggle */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,255,133,0.12)', border: '1px solid rgba(0,255,133,0.3)' }}
              >
                <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
                <span className="text-[11px] font-bold text-[#00FF85]">ON</span>
              </div>
            </div>

            <p className="text-[14px] text-white/55 leading-relaxed">
              No surprises. No waste. Just real rewards you can actually earn.
            </p>

            <ul className="space-y-3">
              {TRUTH_BULLETS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(123,92,240,0.15)' }}
                  >
                    <Icon size={15} style={{ color: '#7B5CF0' }} />
                  </div>
                  <span className="text-[13px] text-white/70">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CENTER — TapScore gauge */}
          <div
            className="rounded-2xl p-7 flex flex-col items-center justify-center gap-6"
            style={{ background: '#13132b', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.15em] uppercase text-center mb-1"
                style={{ color: '#00FF85' }}
              >
                TapScore
              </p>
              <p className="font-bold text-white text-center" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '18px' }}>
                Offer Quality Rating
              </p>
            </div>

            {/* SVG gauge */}
            <div className="relative w-[180px] h-[180px]">
              <svg
                width="180"
                height="180"
                viewBox="0 0 200 200"
                className="-rotate-90"
              >
                <circle cx="100" cy="100" r={TAPSCORE_RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                <circle
                  cx="100"
                  cy="100"
                  r={TAPSCORE_RADIUS}
                  fill="none"
                  stroke="#00FF85"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={TAPSCORE_CIRC}
                  strokeDashoffset={TAPSCORE_OFFSET}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,133,0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[52px] font-bold text-white leading-none"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {TAPSCORE_VALUE}%
                </span>
                <span className="text-[12px] text-white/40 mt-1">TapScore</span>
              </div>
            </div>

            <ul className="w-full space-y-2.5">
              {CHECK_BULLETS.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} style={{ color: '#00FF85', flexShrink: 0 }} />
                  <span className="text-[13px] text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — Why TapCash */}
          <div
            className="rounded-2xl p-7 space-y-5"
            style={{
              background: '#13132b',
              border: '1px solid rgba(255,255,255,0.07)',
              borderLeft: '3px solid #7B5CF0',
            }}
          >
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-1"
                style={{ color: '#7B5CF0' }}
              >
                Why TapCash?
              </p>
              <p className="font-bold text-white" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '22px' }}>
                Built differently.
              </p>
            </div>

            <p className="text-[14px] text-white/55 leading-relaxed">
              Most reward apps hide the catch. We show you exactly what you&apos;re getting into, before you start.
            </p>

            <ul className="space-y-4">
              {[
                { label: 'Transparent Tracking', sub: 'Every step logged, no black boxes' },
                { label: 'Verified Payouts', sub: 'Real money, no gift card games' },
                { label: 'Canadian-Built', sub: 'Designed for Canadian users' },
                { label: 'Zero Subscriptions', sub: 'Free forever, no upsells' },
              ].map(({ label, sub }) => (
                <li key={label} className="flex items-start gap-3">
                  <CheckCircle2 size={16} style={{ color: '#00FF85', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p className="text-[13px] font-semibold text-white">{label}</p>
                    <p className="text-[12px] text-white/40">{sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TruthModeSection;
