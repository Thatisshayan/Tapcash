interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { dot: 6, text: '16px' },
  md: { dot: 8, text: '20px' },
  lg: { dot: 10, text: '26px' },
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const { dot, text } = sizeMap[size];

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="TapCash"
    >
      {/* Emerald dot accent */}
      <span
        style={{
          display: 'inline-block',
          width: dot,
          height: dot,
          borderRadius: '50%',
          backgroundColor: '#00C97F',
          boxShadow: '0 0 8px rgba(0,201,127,0.7)',
          flexShrink: 0,
        }}
      />
      {/* Wordmark */}
      <span
        style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontWeight: 700,
          fontSize: text,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#ffffff' }}>TAP</span>
        <span style={{ color: '#00C97F' }}>CASH</span>
      </span>
    </span>
  );
}

export default Logo;
