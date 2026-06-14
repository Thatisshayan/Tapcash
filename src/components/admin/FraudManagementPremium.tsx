'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface FraudFlag {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  riskScore: number;
  flaggedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  evidence: string[];
}

interface FraudManagementProps {
  flags: FraudFlag[];
  onFlagAction?: (flagId: string, action: 'approve' | 'reject') => void;
}

export default function FraudManagementPremium({ flags, onFlagAction }: FraudManagementProps) {
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);

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

  const getRiskColor = (score: number) => {
    if (score >= 80) return '#FF6B6B';
    if (score >= 60) return '#FFC442';
    return '#31F06F';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    return 'Medium';
  };

  const pendingFlags = flags.filter(f => f.status === 'pending');
  const approvedFlags = flags.filter(f => f.status === 'approved');
  const rejectedFlags = flags.filter(f => f.status === 'rejected');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold text-white mb-2">Fraud Management</h2>
        <p className="text-white/60">Review and manage suspicious user activities</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { icon: AlertTriangle, label: 'Pending Review', value: pendingFlags.length, color: '#FFC442' },
          { icon: CheckCircle, label: 'Approved', value: approvedFlags.length, color: '#31F06F' },
          { icon: Shield, label: 'Rejected', value: rejectedFlags.length, color: '#18D9FF' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase font-semibold tracking-wider mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/15"
                  style={{ borderColor: `${stat.color}40` }}
                >
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Pending Flags */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-xl font-bold text-white">Pending Review</h3>
        <div className="space-y-3">
          {pendingFlags.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 px-6 rounded-2xl border border-white/10 bg-white/5"
            >
              <Shield size={32} className="mx-auto mb-3 text-[#31F06F]" />
              <p className="text-white/60">No pending fraud flags</p>
            </motion.div>
          ) : (
            pendingFlags.map((flag, index) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => setSelectedFlag(flag)}
                className="group relative cursor-pointer"
              >
                {/* Glow Background on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FFC442]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

                {/* Card */}
                <div className="relative p-6 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 overflow-hidden">
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={20} className="text-[#FFC442]" />
                        <h4 className="text-lg font-bold text-white">{flag.userName}</h4>
                      </div>
                      <p className="text-sm text-white/70 mb-3">{flag.reason}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-white/60" />
                          <span className="text-xs text-white/60">Risk Score</span>
                        </div>
                        <div
                          className="px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${getRiskColor(flag.riskScore)}20`,
                            color: getRiskColor(flag.riskScore),
                            border: `1px solid ${getRiskColor(flag.riskScore)}40`,
                          }}
                        >
                          {flag.riskScore}% - {getRiskLabel(flag.riskScore)}
                        </div>
                        <span className="text-xs text-white/50">{flag.flaggedAt}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFlagAction?.(flag.id, 'approve');
                        }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#31F06F]/30 transition-all duration-300"
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFlagAction?.(flag.id, 'reject');
                        }}
                        className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300"
                      >
                        Reject
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Approved Flags */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-xl font-bold text-white">Approved Actions</h3>
        <div className="space-y-2">
          {approvedFlags.slice(0, 3).map((flag, index) => (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="p-4 rounded-lg border border-[#31F06F]/30 bg-[#31F06F]/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-[#31F06F]" />
                <div>
                  <p className="text-sm font-semibold text-white">{flag.userName}</p>
                  <p className="text-xs text-white/60">{flag.reason}</p>
                </div>
              </div>
              <span className="text-xs text-white/60">{flag.flaggedAt}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Risk Indicators */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
      >
        <h3 className="text-lg font-bold text-white mb-4">Common Risk Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Multiple accounts from same IP',
            'Unusual offer completion speed',
            'VPN/Proxy detected',
            'Emulator behavior detected',
            'Repeated payout rejections',
            'Geographic inconsistencies',
          ].map((indicator) => (
            <div key={indicator} className="flex items-start gap-2">
              <Zap size={16} className="text-[#FFC442] flex-shrink-0 mt-0.5" />
              <span className="text-sm text-white/70">{indicator}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
