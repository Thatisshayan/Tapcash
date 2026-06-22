import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  children: ReactNode;
}

const variantClasses = {
  default:
    'border border-white/10 bg-white/[0.03] rounded-2xl p-6',
  elevated:
    'border border-[rgba(24,217,255,0.1)] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] bg-gradient-to-br from-[rgba(20,30,50,0.9)] to-[rgba(10,15,30,0.95)] backdrop-blur-[20px]',
  glass:
    'border border-white/20 rounded-2xl p-6 bg-white/5 backdrop-blur-[10px]',
  interactive:
    'border border-white/10 bg-white/[0.03] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(24,217,255,0.3)] hover:shadow-[0_24px_80px_rgba(24,217,255,0.15)]',
};

export function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
