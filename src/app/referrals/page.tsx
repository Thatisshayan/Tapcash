'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Copy, Share2, Users, DollarSign, Clock, Award, ArrowLeft, TrendingUp } from 'lucide-react';
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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const q = query(collection(db, 'users'), where('referredBy', '==', user.uid));
    
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
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

      // Sort by highest earners
      referralList.sort((a, b) => b.totalEarned - a.totalEarned);

      setReferrals(referralList);
      setStats({
        totalReferrals: snapshot.size,
        totalEarned,
        activeReferrals: activeCount,
      });
      setLoading(false);
    }, (error) => {
      console.error('Error fetching referrals in real-time:', error);
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  const referralLink = user 
    ? `https://tapcash.online/ref/${user.uid}`
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

  if (loading && !referrals.length) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-6">Authentication Required</div>
        <Link href="/" className="px-8 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-emerald-100 p-6 md:p-12 selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700 fade-in">
        {/* Navigation */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 font-bold uppercase tracking-widest text-[10px] transition-all mb-12 group">
          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-colors">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Back to Command Center</span>
        </Link>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Affiliate Program
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight font-display tracking-tight">
              Earn <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">20% passive</span><br />commission. Forever.
            </h1>
            <p className="text-zinc-400 mt-4 max-w-xl font-medium">
              Turn your network into a revenue stream. When your friends earn, you earn. Live updates directly to your wallet.
            </p>
          </div>
        </div>

        {/* Action Link Card */}
        <div className="bg-zinc-950/50 border border-zinc-800/50 backdrop-blur-md rounded-3xl p-8 mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-end gap-6 relative z-10">
            <div className="flex-1 w-full">
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Your Affiliate Link</label>
              <div className="bg-[#050505] border border-zinc-800 rounded-2xl px-6 py-4 text-emerald-400 font-mono text-sm break-all shadow-inner group-hover:border-emerald-500/30 transition-colors">
                {referralLink}
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleCopy}
                className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
                  copied 
                    ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-emerald-500/30'
                }`}
              >
                {copied ? (
                  <>Copied to Clipboard</>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 md:flex-none px-6 py-4 bg-emerald-500 text-black hover:bg-emerald-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-3xl p-6 flex flex-col hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Total Passive Yield</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white font-display">{(stats.totalEarned / 1000).toFixed(2)}k</p>
              <span className="text-emerald-400 text-sm font-bold">Coins</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              <span>Yields flowing instantly</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-3xl p-6 flex flex-col hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Network Size</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white font-display">{stats.totalReferrals}</p>
              <span className="text-blue-400 text-sm font-bold">Users</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-3xl p-6 flex flex-col hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Active Performers</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white font-display">{stats.activeReferrals}</p>
              <span className="text-amber-400 text-sm font-bold">Last 30d</span>
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div className="bg-zinc-950/80 border border-zinc-800/50 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
              <Award className="w-5 h-5 text-emerald-400" />
              Network Roster
            </h2>
            <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Live Feed
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">Your network is currently empty.</p>
              <p className="text-zinc-600 text-sm mt-1">Share your link to recruit your first earner.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800/50 text-zinc-600 uppercase text-[10px] font-black tracking-widest">
                    <th className="pb-4 px-4">Affiliate Node</th>
                    <th className="pb-4 px-4 hidden sm:table-cell">Inducted</th>
                    <th className="pb-4 px-4 text-right">Gross Output</th>
                    <th className="pb-4 px-4 text-right text-emerald-500">Your Cut (20%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {referrals.map((ref, i) => (
                    <tr key={ref.uid} className="hover:bg-zinc-900/30 transition-colors group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">
                            {ref.uid.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-mono text-xs text-zinc-300 font-bold tracking-tight">{ref.uid.slice(0, 10)}...</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-zinc-500 text-xs font-medium hidden sm:table-cell">{formatDate(ref.joinedDate)}</td>
                      <td className="py-5 px-4 text-right text-zinc-300 font-bold">{ref.totalEarned.toLocaleString()} <span className="text-[9px] text-zinc-600 uppercase">Coins</span></td>
                      <td className="py-5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <span className="text-emerald-400 font-black text-sm">+{ref.commission.toLocaleString()}</span>
                        </div>
                      </td>
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