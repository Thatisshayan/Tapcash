'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { TrendingUp, Users, Wallet, AlertCircle, DollarSign, Activity } from 'lucide-react';

interface KPIData {
  label: string;
  value: string;
  change: number;
  icon: 'trending' | 'users' | 'wallet' | 'alert' | 'dollar' | 'activity';
  color: string;
}

interface AdminOverviewProps {
  kpis: KPIData[];
  revenueData?: Array<{ date: string; amount: number }>;
  onExport?: () => void;
}

const iconMap = {
  trending: TrendingUp,
  users: Users,
  wallet: Wallet,
  alert: AlertCircle,
  dollar: DollarSign,
  activity: Activity,
};

export default function AdminOverviewPremium({ kpis, onExport }: AdminOverviewProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/60">Real-time platform metrics and performance overview</p>
        </div>
        <motion.button
          onClick={onExport}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-lg border border-white/15 bg-gradient-to-r from-white/8 to-white/4 text-white font-semibold hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
        >
          Export Report
        </motion.button>
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {kpis.map((kpi, index) => {
          const Icon = iconMap[kpi.icon];
          const isPositive = kpi.change >= 0;

          return (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="group relative"
            >
              {/* Glow Background on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

              {/* Card */}
              <div className="relative p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 overflow-hidden">
                
                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                        {kpi.label}
                      </p>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="text-3xl font-black text-white"
                      >
                        {kpi.value}
                      </motion.h3>
                    </div>
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/15"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon size={24} style={{ color: kpi.color }} strokeWidth={1.5} />
                    </motion.div>
                  </div>

                  {/* Change Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      isPositive
                        ? 'bg-[#31F06F]/20 border border-[#31F06F]/40 text-[#31F06F]'
                        : 'bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 text-[#FF6B6B]'
                    }`}
                  >
                    <TrendingUp size={14} style={{ transform: isPositive ? 'rotate(0)' : 'rotate(180deg)' }} />
                    <span>{isPositive ? '+' : ''}{kpi.change}%</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Revenue Chart */}
        <div className="p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[65, 78, 72, 85, 92, 88, 95].map((value, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                className="flex-1 bg-gradient-to-t from-[#31F06F] to-[#18D9FF] rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
          <p className="text-xs text-white/50 mt-4">Last 7 days</p>
        </div>

        {/* User Growth Chart */}
        <div className="p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">User Growth</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[45, 52, 58, 68, 75, 82, 90].map((value, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                className="flex-1 bg-gradient-to-t from-[#7C3DFF] to-[#FFC442] rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
          <p className="text-xs text-white/50 mt-4">Last 7 days</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Avg Order Value', value: '$12.50' },
          { label: 'Conversion Rate', value: '3.2%' },
          { label: 'Churn Rate', value: '0.8%' },
          { label: 'Support Tickets', value: '24' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.05 }}
            className="p-4 rounded-lg border border-white/10 bg-white/5 text-center"
          >
            <p className="text-xs text-white/60 uppercase font-semibold tracking-wider mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
