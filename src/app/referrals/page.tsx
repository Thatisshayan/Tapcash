'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FaCopy, FaShareAlt, FaUsers, FaDollarSign, FaClock } from 'react-icons/fa';

type Referral = {
  uid: string;
  joinedDate: string;
  totalEarned: number;
  commission: number;
};

type Stats = {
  totalReferrals: number;
  totalEarned: number;
  activeReferrals: number;
};

export default function ReferralsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ totalReferrals: 0, totalEarned: 0, activeReferrals: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchReferrals(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchReferrals = async (uid: string) => {
    try {
      const q = query(collection(db, 'users'), where('referredBy', '==', uid));
      const snapshot = await getDocs(q);

      const referralList: Referral[] = [];
      let totalEarned = 0;
      let activeCount = 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const joinedDate = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
        const userEarned = data.totalEarned || 0;
        const commission = userEarned * 0.2;

        referralList.push({
          uid: doc.id,
          joinedDate,
          totalEarned: userEarned,
          commission,
        });

        totalEarned += commission;

        // Check if active (earned in last 30 days)
        const lastEarned = data.lastEarnedAt?.toDate?.();
        if (lastEarned && lastEarned > thirtyDaysAgo) {
          activeCount++;
        }
      });

      setReferrals(referralList);
      setStats({
        totalReferrals: snapshot.size,
        totalEarned,
        activeReferrals: activeCount,
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = user
    ? `https://tapcash-production.up.railway.app/ref/${user.uid}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TapCash',
          text: 'Earn 20% of what your friends earn — forever!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="text-emerald-200 text-xl">Please sign in to view referrals</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-300 mb-4">
            Earn 20% of what your friends earn — forever
          </h1>
          <p className="text-emerald-400/80 text-lg">
            Share your referral link and earn passive income
          </p>
        </div>

        {/* Referral Link Card */}
        <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm text-emerald-400 mb-2">Your Referral Link</label>
              <div className="bg-emerald-950/50 border border-emerald-700/30 rounded-lg px-4 py-3 text-emerald-200 font-mono text-sm break-all">
                {referralLink}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-emerald-100'
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    <FaCopy /> Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FaCopy /> Copy
                  </span>
                )}
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <FaShareAlt /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-6 text-center">
            <FaUsers className="text-emerald-400 text-3xl mx-auto mb-2" />
            <div className="text-3xl font-bold text-emerald-300">{stats.totalReferrals}</div>
            <div className="text-emerald-500 text-sm mt-1">Total Referrals</div>
          </div>
          <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-6 text-center">
            <FaDollarSign className="text-emerald-400 text-3xl mx-auto mb-2" />
            <div className="text-3xl font-bold text-emerald-300">{formatCurrency(stats.totalEarned)}</div>
            <div className="text-emerald-500 text-sm mt-1">Total Earned</div>
          </div>
          <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-6 text-center">
            <FaClock className="text-emerald-400 text-3xl mx-auto mb-2" />
            <div className="text-3xl font-bold text-emerald-300">{stats.activeReferrals}</div>
            <div className="text-emerald-500 text-sm mt-1">Active (30 days)</div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-emerald-700/30">
            <h2 className="text-xl font-semibold text-emerald-300">Your Referrals</h2>
          </div>
          {referrals.length === 0 ? (
            <div className="p-8 text-center text-emerald-500">
              No referrals yet. Share your link to start earning!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-700/30">
                    <th className="text-left p-4 text-emerald-400 font-medium text-sm">User</th>
                    <th className="text-left p-4 text-emerald-400 font-medium text-sm">Joined</th>
                    <th className="text-left p-4 text-emerald-400 font-medium text-sm">Their Earnings</th>
                    <th className="text-left p-4 text-emerald-400 font-medium text-sm">Your Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.uid} className="border-b border-emerald-700/20 hover:bg-emerald-900/20">
                      <td className="p-4 text-emerald-200 font-mono text-xs">{referral.uid.slice(0, 12)}…</td>
                      <td className="p-4 text-emerald-300 text-sm">{formatDate(referral.joinedDate)}</td>
                      <td className="p-4 text-emerald-300 text-sm">{formatCurrency(referral.totalEarned)}</td>
                      <td className="p-4 text-emerald-400 font-semibold text-sm">{formatCurrency(referral.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
