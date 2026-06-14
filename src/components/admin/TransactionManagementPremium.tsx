'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Search, Filter, CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'offer' | 'payout' | 'adjustment';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  provider?: string;
  reference?: string;
}

interface TransactionManagementProps {
  transactions: Transaction[];
  onTransactionAction?: (txId: string, action: string) => void;
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: '#31F06F',
    label: 'Completed',
  },
  pending: {
    icon: Clock,
    color: '#FFC442',
    label: 'Pending',
  },
  failed: {
    icon: XCircle,
    color: '#FF6B6B',
    label: 'Failed',
  },
};

export default function TransactionManagementPremium({ transactions }: TransactionManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'offer' | 'payout' | 'adjustment'>('all');

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

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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
        <h2 className="text-3xl font-bold text-white mb-2">Transaction Management</h2>
        <p className="text-white/60">Monitor all platform transactions and verify payments</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4"
      >
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by user name or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/15 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#31F06F]/50 transition-all duration-300"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'completed', 'pending', 'failed'].map((status) => (
              <motion.button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-300 ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-[#31F06F] to-[#18D9FF] text-[#050813]'
                    : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/30'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {['all', 'offer', 'payout', 'adjustment'].map((type) => (
              <motion.button
                key={type}
                onClick={() => setTypeFilter(type as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-300 ${
                  typeFilter === type
                    ? 'bg-gradient-to-r from-[#7C3DFF] to-[#FFC442] text-white'
                    : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/30'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </motion.button>
            ))}
          </div>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => {
                const statusConfig_item = statusConfig[tx.status];
                const StatusIcon = statusConfig_item.icon;
                const isCredit = tx.type === 'offer' || (tx.type === 'adjustment' && tx.amount > 0);

                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-white">{tx.userName}</span>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                        {tx.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {isCredit ? (
                          <ArrowDownLeft size={14} className="text-[#31F06F]" />
                        ) : (
                          <ArrowUpRight size={14} className="text-[#FF6B6B]" />
                        )}
                        <span
                          className="text-sm font-black"
                          style={{
                            color: isCredit ? '#31F06F' : '#FF6B6B',
                          }}
                        >
                          {isCredit ? '+' : '-'}
                          {Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={16} style={{ color: statusConfig_item.color }} />
                        <span className="text-sm font-semibold text-white">{statusConfig_item.label}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">{tx.date}</span>
                    </td>

                    {/* Reference */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-1 rounded">
                        {tx.reference || '-'}
                      </span>
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
        {filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-6"
          >
            <p className="text-white/60">No transactions found matching your filters</p>
          </motion.div>
        )}
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Total Transactions', value: transactions.length.toLocaleString() },
          { label: 'Total Volume', value: `${transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}` },
          { label: 'Success Rate', value: `${Math.round((transactions.filter(tx => tx.status === 'completed').length / transactions.length) * 100)}%` },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
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
