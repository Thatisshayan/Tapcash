const SCREENS = [
  {
    label: 'Home',
    lines: [
      { type: 'tag', text: 'YOUR BALANCE', color: '#ffffff40' },
      { type: 'hero', text: '$12.50', color: '#00FF85' },
      { type: 'sub', text: '+$4.20 today', color: '#00FF8580' },
      { type: 'divider' },
      { type: 'tag', text: 'TOP OFFERS', color: '#ffffff40' },
      { type: 'row', text: 'Coin Master', badge: '$35', color: '#7B5CF0' },
      { type: 'row', text: 'Vegas Slots', badge: '$20', color: '#7B5CF0' },
    ],
  },
  {
    label: 'Top Picks',
    lines: [
      { type: 'tag', text: 'RECOMMENDED', color: '#F5A62380' },
      { type: 'card', text: 'Tycoon Go!', badge: 'HOT', color: '#FF4444' },
      { type: 'card', text: 'Mythic Heroes', badge: '$120', color: '#7B5CF0' },
      { type: 'row', text: 'Bingo Blitz', badge: '$25', color: '#7B5CF0' },
    ],
  },
  {
    label: 'CashPath',
    lines: [
      { type: 'tag', text: 'CASHPATH LIVE™', color: '#00FF8580' },
      { type: 'step', text: 'Choose Offer', done: true },
      { type: 'step', text: 'Tracking Active', done: true },
      { type: 'step', text: 'Pending', done: false },
      { type: 'step', text: 'Approved', done: false },
      { type: 'step', text: 'Cashed Out', done: false },
    ],
  },
  {
    label: 'Missions',
    lines: [
      { type: 'tag', text: 'DAILY MISSIONS', color: '#7B5CF080' },
      { type: 'mission', text: 'Play 3 offers', prog: 2, total: 3 },
      { type: 'mission', text: 'Earn $5 today', prog: 4.2, total: 5 },
      { type: 'mission', text: 'Invite a friend', prog: 0, total: 1 },
      { type: 'divider' },
      { type: 'sub', text: 'Streak: 7 days 🔥', color: '#F5A623' },
    ],
  },
  {
    label: 'Leaderboard',
    lines: [
      { type: 'tag', text: 'THIS WEEK', color: '#ffffff40' },
      { type: 'rank', pos: 1, text: 'Jordan L.', val: '$421' },
      { type: 'rank', pos: 2, text: 'Alex M.', val: '$390' },
      { type: 'rank', pos: 3, text: 'Casey R.', val: '$312' },
      { type: 'divider' },
      { type: 'rank', pos: 47, text: 'You', val: '$28', self: true },
    ],
  },
];

type ScreenLine = {
  type: string;
  text?: string;
  badge?: string;
  color?: string;
  done?: boolean;
  prog?: number;
  total?: number;
  pos?: number;
  val?: string;
  self?: boolean;
};

function ScreenContent({ lines }: { lines: ScreenLine[] }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      {lines.map((line, i) => {
        switch (line.type) {
          case 'tag':
            return (
              <span key={i} className="text-[8px] font-bold tracking-widest uppercase" style={{ color: line.color }}>
                {line.text}
              </span>
            );
          case 'hero':
            return (
              <span key={i} className="text-[22px] font-bold leading-none" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: line.color }}>
                {line.text}
              </span>
            );
          case 'sub':
            return (
              <span key={i} className="text-[9px]" style={{ color: line.color }}>
                {line.text}
              </span>
            );
          case 'divider':
            return <div key={i} className="border-t my-1" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />;
          case 'row':
          case 'card':
            return (
              <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-[9px] text-white/70">{line.text}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${line.color}20`, color: line.color }}>
                  {line.badge}
                </span>
              </div>
            );
          case 'step':
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: line.done ? '#00FF85' : 'rgba(255,255,255,0.1)' }}
                />
                <span className="text-[9px]" style={{ color: line.done ? '#ffffff' : 'rgba(255,255,255,0.4)' }}>
                  {line.text}
                </span>
              </div>
            );
          case 'mission':
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[9px] text-white/70">{line.text}</span>
                  <span className="text-[9px] text-white/40">{line.prog}/{line.total}</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((line.prog ?? 0) / (line.total ?? 1)) * 100}%`, background: '#7B5CF0' }}
                  />
                </div>
              </div>
            );
          case 'rank':
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1 rounded-lg"
                style={{ background: line.self ? 'rgba(0,255,133,0.08)' : 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-[8px] font-bold w-4 text-center" style={{ color: line.pos === 1 ? '#F5A623' : 'rgba(255,255,255,0.3)' }}>
                  #{line.pos}
                </span>
                <span className="text-[9px] text-white/70 flex-1">{line.text}</span>
                <span className="text-[9px] font-semibold" style={{ color: '#00FF85', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  {line.val}
                </span>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function PhoneFrame({ label, lines }: { label: string; lines: ScreenLine[] }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Phone */}
      <div
        className="relative rounded-[24px] overflow-hidden"
        style={{
          width: '140px',
          height: '280px',
          background: '#0d0d1a',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 30px rgba(123,92,240,0.2)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/15" />
        {/* Content */}
        <div className="mt-4 flex flex-col flex-1 overflow-hidden">
          <ScreenContent lines={lines} />
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
      </div>
      <span className="text-[12px] font-medium text-white/50">{label}</span>
    </div>
  );
}

export function AppShowcaseSection() {
  return (
    <section className="py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <p
            className="text-[11px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: '#7B5CF0' }}
          >
            The App
          </p>
          <h2
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            See It In Action
          </h2>
          <p className="text-[15px] text-white/50 max-w-md mx-auto">
            Every screen, every feature — built to help you earn more, faster.
          </p>
        </div>

        <div className="flex justify-center items-end gap-6 lg:gap-8 flex-wrap">
          {SCREENS.map((screen, i) => (
            <div
              key={screen.label}
              style={{
                transform: i === 2 ? 'translateY(-24px)' : i === 1 || i === 3 ? 'translateY(-12px)' : 'translateY(0)',
              }}
            >
              <PhoneFrame label={screen.label} lines={screen.lines} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AppShowcaseSection;
