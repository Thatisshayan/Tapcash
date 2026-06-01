"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "@/components/Header";
import ConversionStrip from "@/components/ConversionStrip";
import { Copy, Check, Users, ArrowUpRight, Loader2, AlertTriangle, Coins, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
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

        // Sum total passive coins earned from ledger (referral commissions only)
        const txQ = query(
          collection(db, "ledger_transactions"),
          where("userId", "==", user.uid),
          where("type", "==", "approved_credit"),
          where("source", "==", "referral_commission")
        );
        const txSnap = await getDocs(txQ);

        let totalEarned = 0;
        txSnap.forEach(doc => {
          totalEarned += doc.data().balanceEffectCoins || 0;
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
        <section className="relative overflow-hidden rounded-[2rem] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(0,230,195,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(58,123,255,0.14),transparent_30%),linear-gradient(180deg,rgba(8,12,24,0.96),rgba(4,6,14,0.98))] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 right-0 h-56 w-56 rounded-full bg-[#3a7bff]/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-[#00e6c3]/10 blur-3xl" />
          </div>

          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 text-[#8cf8e9] text-[10px] font-black uppercase tracking-[0.28em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Referral growth
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-[0.22em]">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#7aa7ff]" />
                  Lifetime commission
                </span>
              </div>

              <div className="max-w-2xl space-y-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Invite friends and turn traffic into recurring TapCash earnings.
                </h1>
                <p className="text-zinc-400 text-sm md:text-base max-w-lg leading-relaxed">
                  Share one clean link, keep the invite flow simple, and earn a recurring commission when your referrals complete offers and cash out.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-black transition-all duration-300 ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                      : "bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)]"
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy referral link"}
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.07] transition-colors"
                >
                  Open dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-white/6 bg-[#07101b]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Invite link</p>
                <div className="mt-3 rounded-2xl border border-white/6 bg-white/[0.04] p-4 break-all text-sm text-zinc-300 font-mono">
                  {inviteLink || "Loading invite link..."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Invited</p>
                  <p className="mt-2 text-2xl font-black text-white">{loading ? "..." : stats.invited}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/6 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">Earned</p>
                  <p className="mt-2 text-2xl font-black text-[#8cf8e9]">{loading ? "..." : `+${stats.earned.toLocaleString()}`}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
