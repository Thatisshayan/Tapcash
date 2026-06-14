'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Search, Filter, MoreVertical, CheckCircle, AlertCircle, Ban, Mail } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'suspended' | 'flagged';
  joinDate: string;
  balance: number;
  totalEarned: number;
  lastActive: string;
}

interface UserManagementProps {
  users: User[];
  onUserAction?: (userId: string, action: string) => void;
}

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: '#31F06F',
    label: 'Active',
    bg: 'from-[#31F06F]/10 to-[#31F06F]/5',
  },
  suspended: {
    icon: Ban,
    color: '#FF6B6B',
    label: 'Suspended',
    bg: 'from-[#FF6B6B]/10 to-[#FF6B6B]/5',
  },
  flagged: {
    icon: AlertCircle,
    color: '#FFC442',
    label: 'Flagged',
    bg: 'from-[#FFC442]/10 to-[#FFC442]/5',
  },
};

export default function UserManagementPremium({ users, onUserAction }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'flagged'>('all');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
    },
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
        <p className="text-white/60">Monitor and manage platform users</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/15 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#31F06F]/50 transition-all duration-300"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'active', 'suspended', 'flagged'].map((status) => (
            <motion.button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-[#050813]'
                  : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={itemVariants}
        className="border border-white/10 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Total Earned</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const config = statusConfig[user.status];
                const StatusIcon = config.icon;

                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#31F06F]/20 to-[#18D9FF]/10 flex items-center justify-center border border-white/15">
                          <span className="text-sm font-bold text-white">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.displayName}</p>
                          <p className="text-xs text-white/50 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={16} style={{ color: config.color }} />
                        <span className="text-sm font-semibold text-white">{config.label}</span>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#31F06F]">
                        {user.balance.toLocaleString()}
                      </span>
                    </td>

                    {/* Total Earned */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#18D9FF]">
                        {user.totalEarned.toLocaleString()}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">{user.joinDate}</span>
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">{user.lastActive}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <MoreVertical size={16} />
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-6"
          >
            <p className="text-white/60">No users found matching your filters</p>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-white/60">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Previous
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
