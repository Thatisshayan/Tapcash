const ENTRIES = [
  { name: 'Alex M.', amount: '$125' },
  { name: 'Jordan L.', amount: '$89' },
  { name: 'Casey R.', amount: '$156' },
  { name: 'Morgan T.', amount: '$92' },
  { name: 'Sam K.', amount: '$210' },
  { name: 'Riley D.', amount: '$67' },
  { name: 'Quinn B.', amount: '$178' },
  { name: 'Taylor S.', amount: '$143' },
  { name: 'Avery N.', amount: '$95' },
  { name: 'Dakota P.', amount: '$112' },
  { name: 'Reese W.', amount: '$88' },
  { name: 'Skyler J.', amount: '$199' },
  { name: 'Cameron A.', amount: '$74' },
  { name: 'Parker E.', amount: '$231' },
];

function TickerEntry({ name, amount }: { name: string; amount: string }) {
  return (
    <span className="flex items-center gap-3 shrink-0 pr-10">
      <span className="text-[13px] text-white/60" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        {name} cashed out{' '}
        <span className="text-[#00C97F]">{amount}</span>
      </span>
      <span className="text-[#00C97F] text-[10px] opacity-40">·</span>
    </span>
  );
}

export function PayoutTicker() {
  const doubled = [...ENTRIES, ...ENTRIES];

  return (
    <div
      className="w-full h-12 overflow-hidden border-y border-white/[0.06] flex items-center"
      style={{ backgroundColor: '#0e1a15' }}
    >
      <div
        className="flex items-center"
        style={{
          animation: 'marquee 40s linear infinite',
          width: 'max-content',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.animationPlayState = 'paused')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.animationPlayState = 'running')}
      >
        {doubled.map((entry, i) => (
          <TickerEntry key={i} name={entry.name} amount={entry.amount} />
        ))}
      </div>
    </div>
  );
}

export default PayoutTicker;
