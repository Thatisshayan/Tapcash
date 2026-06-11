
import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

export function MotionWrap({ children, delay = 0, className = "" }: PropsWithChildren<{ delay?: number; className?: string }>) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageShell({ children, eyebrow, title, description, kicker }: PropsWithChildren<{ eyebrow: string; title: string; description: string; kicker?: ReactNode }>) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.6 }}
      className="card-elevated rounded-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-black uppercase tracking-widest text-[#18D9FF]"
          >
            {eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-black tracking-tight text-white md:text-4xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-base leading-relaxed text-[#D7DEEF] md:text-lg"
          >
            {description}
          </motion.p>
        </div>
        {kicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            {kicker}
          </motion.div>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

export function StatCard({ label, value, detail, accent = "cyan" }: { label: string; value: string; detail: string; accent?: "cyan" | "green" | "purple" | "gold" }) {
  const accentColors = {
    cyan: { text: "#18D9FF", bg: "rgba(24, 217, 255, 0.1)" },
    green: { text: "#31F06F", bg: "rgba(49, 240, 111, 0.1)" },
    purple: { text: "#7C3DFF", bg: "rgba(124, 61, 255, 0.1)" },
    gold: { text: "#FFC442", bg: "rgba(255, 196, 66, 0.1)" },
  };

  const colors = accentColors[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="card-elevated rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Accent Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: colors.text }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xs font-black uppercase tracking-widest text-[#9AA8C6]"
      >
        {label}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-4 font-display text-4xl font-black text-white"
        style={{ color: colors.text }}
      >
        {value}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-2 text-sm text-[#9AA8C6]"
      >
        {detail}
      </motion.p>
    </motion.div>
  );
}

export function RewardCard({ 
  title, 
  payout, 
  provider, 
  category, 
  time, 
  accent = "blue",
  icon = "🎮"
}: { 
  title: string; 
  payout: string; 
  provider: string; 
  category: string; 
  time: string; 
  accent?: string;
  icon?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="card-elevated rounded-2xl p-6 space-y-4 group cursor-pointer"
    >
      {/* Icon */}
      <motion.div
        className="text-4xl"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
          {title}
        </h3>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#9AA8C6] bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded-full">
            {provider}
          </span>
          <span className="text-xs font-semibold text-[#9AA8C6] bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Footer */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-[#9AA8C6] font-semibold">Earn</p>
          <p className="text-2xl font-black text-[#31F06F]">{payout}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#9AA8C6] font-semibold">{time}</p>
          <motion.div
            className="text-[#18D9FF] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ x: 4 }}
          >
            <ArrowRight size={18} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function TransactionRow({ 
  type, 
  description, 
  amount, 
  status = "completed",
  timestamp = "2 min ago"
}: { 
  type: string; 
  description: string; 
  amount: string; 
  status?: "completed" | "pending" | "failed";
  timestamp?: string;
}) {
  const statusColors = {
    completed: { bg: "rgba(49, 240, 111, 0.1)", text: "#31F06F", label: "✓" },
    pending: { bg: "rgba(255, 196, 66, 0.1)", text: "#FFC442", label: "⏳" },
    failed: { bg: "rgba(255, 47, 66, 0.1)", text: "#FF2F42", label: "✕" },
  };

  const colors = statusColors[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="card-glass rounded-xl p-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.06)] transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Status Indicator */}
        <motion.div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: colors.bg }}
        >
          {colors.label}
        </motion.div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{description}</p>
          <p className="text-xs text-[#9AA8C6] mt-1">{timestamp}</p>
        </div>
      </div>

      {/* Amount */}
      <motion.p
        className="font-black text-lg"
        style={{ color: colors.text }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {amount}
      </motion.p>
    </motion.div>
  );
}

export function CTAButton({ href, label, variant = "primary", className = "" }: { href: string; label: string; variant?: "primary" | "secondary" | "gradient"; className?: string }) {
  const base = `inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-black transition-all`;
  
  if (variant === "secondary") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={href} className={`${base} border border-[var(--model-u-line)] bg-[rgba(255,255,255,0.03)] text-white hover:bg-[rgba(255,255,255,0.06)] ${className}`}>
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }
  
  if (variant === "gradient") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={href} className={`${base} model-u-gradient-cyan-purple text-white shadow-lg hover:shadow-xl ${className}`}>
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href} className={`${base} model-u-btn-primary ${className}`}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
