import type { HTMLAttributes, ReactNode } from 'react';

type GlassVariant = 'default' | 'elevated' | 'overlay';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  children: ReactNode;
}

const variantClasses: Record<GlassVariant, string> = {
  default:
    'bg-white/[0.03] border border-white/[0.06] backdrop-blur-[16px] rounded-2xl',
  elevated:
    'bg-white/[0.06] border border-white/[0.08] backdrop-blur-[20px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
  overlay:
    'bg-[#122a1e] border border-white/[0.08] rounded-2xl',
};

export function GlassCard({
  variant = 'default',
  children,
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default GlassCard;
