'use client';

import { useEffect, useState } from 'react';
import { getDocs, query, where, orderBy, limit, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Stats {
  totalUsers: number;
  pendingWithdrawals: number;
  totalPaidOut: number;
  recentPostbacks: number;
}

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  createdAt: Timestamp;
}

interface Postback {
  id: string;
  userId: string;
  amount: number;
  offerId: string;
  ip: string;
  status: string;
  createdAt: Timestamp;
}

interface FlaggedTransaction {
  id: string;
  userId: string;
  reason: string;
  createdAt: Timestamp;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingWithdrawals: 0,
    totalPaidOut: 0,
    recentPostbacks: 0,
  });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [postbacks, setPostbacks] = useState<Postback[]>([]);
  const [flaggedTransactions, setFlaggedTransactions] = useState<FlaggedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Stats
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnap.size;

      const pendingWithdrawalsSnap = await getDocs(
        query(collection(db, 'withdrawals'), where('status', '==', 'pending'))
      );
      const pendingWithdrawals = pendingWithdrawalsSnap.size;

      const approvedWithdrawalsSnap = await getDocs(
        query(collection(db, 'withdrawals'), where('status', '==', 'approved'))
      );
      let totalPaidOut = 0;
      approvedWithdrawalsSnap.forEach((doc) => {
        totalPaidOut += doc.data().amount || 0;
      });

      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const recentPostbacksSnap = await getDocs(
        query(
          collection(db, 'transactions'),
          where('type', '==', 'offerwall_postback'),
          where('createdAt', '>=', Timestamp.fromDate(twentyFourHoursAgo))
        )
      );
      const recentPostbacks = recentPostbacksSnap.size;

      setStats({ totalUsers, pendingWithdrawals, totalPaidOut, recentPostbacks });

      // Pending Withdrawals
      const withdrawalsSnap = await getDocs(
        query(
          collection(db, 'withdrawals'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
      );
      const withdrawalsData: Withdrawal[] = [];
      withdrawalsSnap.forEach((doc) => {
        withdrawalsData.push({ id: doc.id, ...doc.data() } as Withdrawal);
      });
      setWithdrawals(withdrawalsData);

      // Recent Postbacks
      const postbacksSnap = await getDocs(
        query(
          collection(db, 'transactions'),
          where('type', '==', 'offerwall_postback'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
      );
      const postbacksData: Postback[] = [];
      postbacksSnap.forEach((doc) => {
        postbacksData.push({ id: doc.id, ...doc.data() } as Postback);
      });
      setPostbacks(postbacksData);

      // Flagged Transactions
      const flaggedSnap = await getDocs(
        query(
          collection(db, 'transactions'),
          where('status', '==', 'flagged'),
          limit(10)
        )
      );
      const flaggedData: FlaggedTransaction[] = [];
      flaggedSnap.forEach((doc) => {
        flaggedData.push({ id: doc.id, ...doc.data() } as FlaggedTransaction);
      });
      setFlaggedTransactions(flaggedData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdrawalAction(withdrawalId: string, action: 'approve' | 'reject') {
    setActionLoading(withdrawalId);
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action }),
      });
      if (!response.ok) throw new Error('Failed to process withdrawal');
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  function formatTime(timestamp: Timestamp): string {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  }

  function truncateId(id: string): string {
    if (!id) return 'N/A';
    return id.length > 8 ? id.substring(0, 8) + '...' : id;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-emerald-400 text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-emerald-400">Admin Panel</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Users</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.totalUsers}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
          <div className="text-sm text-gray-400">Pending Withdrawals</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pendingWithdrawals}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Paid Out</div>
          <div className="text-2xl font-bold text-green-400">${stats.totalPaidOut.toFixed(2)}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
          <div className="text-sm text-gray-400">Postbacks (24h)</div>
          <div className="text-2xl font-bold text-blue-400">{stats.recentPostbacks}</div>
        </div>
      </div>

      {/* Pending Withdrawals Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-yellow-400">Pending Withdrawals</h2>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left text-gray-400">User ID</th>
                <th className="p-3 text-left text-gray-400">Amount</th>
                <th className="p-3 text-left text-gray-400">Method</th>
                <th className="p-3 text-left text-gray-400">Requested At</th>
                <th className="p-3 text-left text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-500">No pending withdrawals</td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-mono">{truncateId(withdrawal.userId)}</td>