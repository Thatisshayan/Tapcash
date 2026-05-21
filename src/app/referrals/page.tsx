'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Copy, Share2, Users, DollarSign, Clock, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
        const commission = userEarned * 0.2; // 20% passive commission
        
        referralList.push({
          uid: doc.id,
          joinedDate,
          totalEarned: userEarned,
          commission,
        });

        totalEarned += commission;
        
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
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount / 100); // converting coins/cents to dollar
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
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4">
        <div className="text-emerald-200 text-xl mb-4">Please sign in to view referrals</div>
        <Link href="/" className="px-6 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-emerald-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Referral Program
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-emerald-300 mt-4 mb-4 leading-tight">
            Earn 20% passive commission forever
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Invite your friends to TapCash. You earn 20% of their rewards whenever they complete tasks!
          </p>
        </div>

        {/* Referral Link Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm text-emerald-400 font-semibold mb-2">Your Unique Referral Link</label>
              <div className="bg-[#121212] border border-gray-800 rounded-xl px-4 py-3.5 text-emerald-200 font-mono text-sm break-all selection:bg-emerald-500 selection:text-black">
                {referralLink}
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleCopy}
                className={`flex-1 md:flex-none px-6 py-3.5 rounded-xl font-bold transition-all duration-200 ${
                  copied 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/20'
                }`}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.totalReferrals}</p>
              <p className="text-zinc-500 text-xs uppercase font-semibold">Total Referrals</p>
            </div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{formatCurrency(stats.totalEarned)}</p>
              <p className="text-zinc-500 text-xs uppercase font-semibold">Passive Commission</p>
            </div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.activeReferrals}</p>
              <p className="text-zinc-500 text-xs uppercase font-semibold">Active Last 30d</p>
            </div>
          </div>
        </div>

        {/* List of Referred Users */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Referred Members</span>
          </h2>

          {referrals.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No referrals yet. Share your link with friends to start earning passive income!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-zinc-500 uppercase text-xs font-semibold">
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Joined Date</th>
                    <th className="pb-3 text-right">User Earned</th>
                    <th className="pb-3 text-right text-emerald-400">Your Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {referrals.map((ref) => (
                    <tr key={ref.uid} className="hover:bg-white/[0.01]">
                      <td className="py-4 font-mono text-xs text-zinc-300">{ref.uid.slice(0, 12)}...</td>
                      <td className="py-4 text-zinc-400">{formatDate(ref.joinedDate)}</td>
                      <td className="py-4 text-right text-zinc-300 font-semibold">{ref.totalEarned.toLocaleString()} Coins</td>
                      <td className="py-4 text-right text-emerald-400 font-black">+{ref.commission.toLocaleString()} Coins</td>
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