"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "@/components/Header";
import ConversionStrip from "@/components/ConversionStrip";
import { Copy, Check, Users, Gift, ArrowUpRight, Loader2, AlertTriangle, Coins } from "lucide-react";
import Link from "next/link";

export default function ReferralsPage() {
  const { user, loading: authLoading } = useAuth();
  
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ invited: 0, earned: 0 });
  const [loading, setLoading] = useState(true);

  const inviteLink = typeof window !== "undefined" 
    ? `${window.location.origin}/ref/${user?.uid}` 
    : "";

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!user) return;
      
      try {
        // Count total invited users
        const usersQ = query(collection(db, "users"), where("referredBy", "==", user.uid));
        const usersSnap = await getDocs(usersQ);
        const totalInvited = usersSnap.size;

        // Sum total passive coins earned
        const txQ = query(
          collection(db, "transactions"), 
          where("userId", "==", user.uid),
          where("type", "==", "referral_commission")
        );
        const txSnap = await getDocs(txQ);
        
        let totalEarned = 0;
        txSnap.forEach(doc => {
          totalEarned += doc.data().amount || 0;
        });

        setStats({ invited: totalInvited, earned: totalEarned });
      } catch (err) {
        console.error("Error fetching referral stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchReferralStats();
    }
  }, [user, authLoading]);

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
          <ConversionStrip
            eyebrow="Invite growth"
            title="Referrals are easier to share when the product looks premium."
            description="Get a clean invite link, share it anywhere, and turn your audience into recurring TapCash earnings."
            primaryHref="/auth/signup"
            primaryLabel="Create account"
            secondaryHref="/auth/signin"
            secondaryLabel="Sign in"
            variant="private"
            bullets={["Passive referral earnings", "Clean invite-link sharing", "Audience-friendly rewards"]}
          />
        </div>
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 text-center backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Access Restricted</h1>
            <p className="text-zinc-500 text-sm mb-6">Please log in to your account to view the Affiliate Program.</p>
            <Link href="/auth/signin" className="inline-block px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition w-full">
              Sign In Now
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <ConversionStrip
          eyebrow="Referral growth"
          title="Turn one good audience into a recurring rewards channel."
          description="Your referral link can drive signups, offer completions, and long-term passive coins while the ledger stays transparent."
          primaryHref="/dashboard"
          primaryLabel="Open dashboard"
          secondaryHref="/affiliate"
          secondaryLabel="Read policy"
          variant="private"
          bullets={["Clean invite-link sharing", "Passive commissions", "Track invited users and earnings"]}
        />
      </div>

      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase rounded-full tracking-widest mx-auto">
            <Gift className="w-3.5 h-3.5" />
            <span>Lifetime 5% Affiliate Program</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Invite Friends & Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Passive Income</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Share your link anywhere. Whenever someone signs up through your link, you'll earn a massive 5% commission on everything they earn... forever.
          </p>
        </div>

        {/* Invite Link Card */}
        <div className="relative overflow-hidden bg-zinc-950 border border-zinc-900 shadow-2xl rounded-3xl p-6 md:p-10 group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-4">
            <div className="flex-grow w-full relative">
              <input 
                type="text" 
                readOnly 
                value={inviteLink}
                className="w-full bg-zinc-900/80 border border-zinc-800 text-white font-mono text-sm md:text-base px-6 py-5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 pr-12"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            
            <button 
              onClick={handleCopy}
              className={`w-full md:w-auto px-8 py-5 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all duration-300 shrink-0 ${
                copied 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Friends Invited</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : stats.invited}
              </h3>
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Coins className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Passive Coins Earned</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : `+${stats.earned.toLocaleString()}`}
              </h3>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
