'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Trophy, Medal, Flame, Crown, Star } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  coins: number;
  avatar?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

const getRankConfig = (rank: number) => {
  if (rank === 1) {
    return {
      icon: Crown,
      color: '#FFD700',
      bg: 'from-[#FFD700]/15 to-[#FFC442]/5',
      border: 'border-[#FFD700]/40',
      badge: '👑',
    };
  }
  if (rank === 2) {
    return {
      icon: Medal,
      color: '#C0C0C0',
      bg: 'from-[#C0C0C0]/15 to-[#A9A9A9]/5',
      border: 'border-[#C0C0C0]/40',
      badge: '🥈',
    };
  }
  if (rank === 3) {
    return {
      icon: Medal,
      color: '#CD7F32',
      bg: 'from-[#CD7F32]/15 to-[#B87333]/5',
      border: 'border-[#CD7F32]/40',
      badge: '🥉',
    };
  }
  return {
    icon: Star,
    color: '#18D9FF',
    bg: 'from-[#18D9FF]/10 to-[#7C3DFF]/5',
    border: 'border-[#18D9FF]/30',
    badge: `#${rank}`,
  };
};

export default function LeaderboardPremium({ entries, currentUserRank }: LeaderboardProps) {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700]/20 to-[#FFC442]/10 flex items-center justify-center border border-[#FFD700]/30">
          <Trophy size={20} className="text-[#FFD700]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Top Earners</h3>
          <p className="text-xs text-white/60">Community proof without losing clarity</p>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {entries.map((entry, index) => {
          const config = getRankConfig(entry.rank);
          const RankIcon = config.icon;
          const isCurrentUser = entry.rank === currentUserRank;

          return (
            <motion.div
              key={entry.rank}
              variants={itemVariants}
              whileHover={{
                x: 8,
                transition: { duration: 0.3 },
              }}
              className={`group relative ${isCurrentUser ? 'ring-2 ring-[#31F06F]/50' : ''}`}
            >
              {/* Glow Background on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />

              {/* Entry Card */}
              <div className={`relative p-4 border ${config.border} bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] rounded-2xl backdrop-blur-xl hover:border-white/25 transition-all duration-300 flex items-center justify-between gap-4 overflow-hidden`}>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
                </div>

                {/* Left: Rank & User Info */}
                <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center flex-shrink-0 border border-white/20 font-black text-lg"
                    style={{ color: config.color }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {entry.rank <= 3 ? config.badge : `#${entry.rank}`}
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#31F06F] transition-colors duration-300">
                        {entry.displayName}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#31F06F]/20 border border-[#31F06F]/40 text-[#31F06F] flex-shrink-0">
                          You
                        </span>
                      )}
                      {entry.trend === 'up' && (
                        <Flame size={14} className="text-[#FF6B6B] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-white/50">Community proof</p>
                  </div>
                </div>

                {/* Right: Coins */}
                <motion.div
                  className="relative z-10 flex-shrink-0 text-right"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <p className="text-xs text-white/60 uppercase font-semibold tracking-wider mb-1">
                    Total Earned
                  </p>
                  <p
                    className="text-xl font-black"
                    style={{ color: config.color }}
                  >
                    {entry.coins.toLocaleString()}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View Full Leaderboard CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-3 px-4 rounded-lg border border-white/15 bg-gradient-to-r from-white/8 to-white/4 text-white font-semibold hover:border-white/30 hover:bg-gradient-to-r hover:from-white/12 hover:to-white/8 transition-all duration-300 backdrop-blur-sm"
      >
        View Full Leaderboard
      </motion.button>
    </div>
  );
}
