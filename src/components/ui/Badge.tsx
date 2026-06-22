import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'hot' | 'green' | 'purple' | 'gold';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  default:
    'border border-white/10 bg-white/5 text-[#9AA8C6]',
  hot:
    'bg-[#FF2F42] text-white uppercase font-black',
  green:
    'border border-[rgba(49,240,111,0.22)] bg-[rgba(49,240,111,0.08)] text-[#D7FFE3]',
  purple:
    'border border-[rgba(124,61,255,0.22)] bg-[rgba(124,61,255,0.08)] text-[#E0D0FF]',
  gold:
    'border border-[rgba(255,196,66,0.22)] bg-[rgba(255,196,66,0.08)] text-[#FFE8B0]',
};

const sizeClasses = {
  default: 'px-2 py-0.5 text-xs rounded-lg',
  hot: 'px-2.5 py-1 text-xs rounded-lg font-black',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  const isHot = variant === 'hot';
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold ${
        isHot ? sizeClasses.hot : sizeClasses.default
      } ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
