import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gradient" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#31F06F] text-black font-bold rounded-full px-6 py-3 transition-all hover:bg-[#28d85f] hover:shadow-[0_0_30px_rgba(49,240,111,0.35)]",
  secondary:
    "border border-white/20 bg-white/5 text-white font-bold rounded-full px-6 py-3 transition-all hover:bg-white/10",
  ghost:
    "border border-white/10 bg-transparent text-[#F6F8FF] font-bold rounded-xl px-5 py-3 transition-all hover:bg-white/5",
  gradient:
    "bg-gradient-to-r from-[#7C3DFF] via-[#18D9FF] to-[#31F06F] text-white font-bold rounded-xl px-6 py-3 transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(124,61,255,0.3)]",
  danger:
    "bg-[#FF2F42] text-white font-bold rounded-full px-6 py-3 transition-all hover:bg-[#e02a3c]",
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base = `inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} {...props}>
      {children}
    </button>
  );
}

export default Button;
