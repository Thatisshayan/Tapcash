interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#9AA8C6]">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className="h-2 bg-[#18243A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7C3DFF] via-[#18D9FF] to-[#31F06F] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
