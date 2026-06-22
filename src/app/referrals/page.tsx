"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ConversionStrip from "@/components/ConversionStrip";
import { Copy, Check, Users, ArrowUpRight, Loader2, AlertTriangle, Coins, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

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
        const usersQ = query(collection(db, "users"), where("referredBy", "==", user.uid));
        const usersSnap = await getDocs(usersQ);
        const totalInvited = usersSnap.size;

        const txQ = query(
          collection(db, "ledger_transactions"),
          where("userId", "==", user.uid),
          where("type", "==", "approved_credit"),
          where("source", "==", "referral_commission")
        );
        const txSnap = await getDocs(txQ);

        let totalEarned = 0;
        txSnap.forEach(doc => {
          totalEarned += (doc.data() as any).balanceEffectCoins || 0;
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
      <div className="min-h-screen bg-[#040913] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00e6c3] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#040913] text-white flex flex-col">
        <Navbar />
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
          <MotionWrap>
            <PageShell
              eyebrow="Access required"
              title="Access Restricted"
              description="Please log in to your account to view the Affiliate Program."
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton href="/auth/signin" label="Sign In Now" />
                <CTAButton href="/dashboard" label="Go to dashboard" variant="secondary" />
              </div>
            </PageShell>
          </MotionWrap>
        </main>
      <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040913] text-white flex flex-col relative overflow-x-hidden">
      <Navbar />

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

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 relative z-10">
        <MotionWrap>
          <PageShell
            eyebrow="Referral growth"
            title="Invite friends and turn traffic into recurring TapCash earnings."
            description="Share one clean link, keep the invite flow simple, and earn a recurring commission when your referrals complete offers and cash out."
            kicker={
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00e6c3]/20 bg-[#00e6c3]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#8cf8e9]">
                <Sparkles className="w-3.5 h-3.5" />
                Lifetime commission
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard label="Invite link" value="Ready" detail={inviteLink || "Loading invite link..."} />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)] hover:shadow-[0_18px_40px_rgba(58,123,255,0.22)] transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy referral link"}
              </button>
              <CTAButton href="/dashboard" label="Open dashboard" variant="secondary" />
            </div>
          </PageShell>
        </MotionWrap>

        <MotionWrap delay={0.05}>
          <PageShell
            eyebrow="Invite link"
            title="Share this link"
            description="Paste this anywhere—social, friends, communities—and we will tie signups to your account."
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-grow w-full bg-black/40 border border-white/6 text-white font-mono text-sm md:text-base px-6 py-5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 pr-12"
              />
              <div className="text-zinc-500">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-6 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)] hover:shadow-[0_18px_40px_rgba(58,123,255,0.22)] transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </PageShell>
        </MotionWrap>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MotionWrap>
            <StatCard
              label="Friends Invited"
              value={loading ? "..." : String(stats.invited)}
              detail="Total referrals"
              
            />
          </MotionWrap>
          <MotionWrap delay={0.04}>
            <StatCard
              label="Passive Coins Earned"
              value={loading ? "..." : `+${stats.earned.toLocaleString()}`}
              detail="Referral commissions"
              
            />
          </MotionWrap>
        </div>
      </main>
      <Footer />
    </div>
  );
}
