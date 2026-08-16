"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ConversionStrip from "@/components/ConversionStrip";
import { Copy, Check, ArrowUpRight, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { MotionWrap } from "@/components/PremiumUi";

// Aurora palette (packages/tokens/tokens.json v3.0.0). No bounded card/box
// chrome as the default layout language -- grouped with spacing, hairline
// dividers, and typography, matching /cashout and /rewards in this rollout.
const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";
const INK = "#F5F3EF";

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
      <div className="min-h-screen bg-[#0A0A0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
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
          <MotionWrap className="w-full max-w-xl text-center space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: GOLD }}>Access required</p>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl" style={{ color: INK }}>Access Restricted</h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed md:text-base" style={{ color: "rgba(245,243,239,0.68)" }}>
              Please log in to your account to view the Affiliate Program.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#0A0A0D", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
              >
                Sign In Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="text-sm font-bold transition-colors" style={{ color: "rgba(245,243,239,0.68)" }}>
                Go to dashboard
              </Link>
            </div>
          </MotionWrap>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col relative overflow-x-hidden">
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

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-14 relative z-10">
        <MotionWrap>
          <div
            className="relative pb-2"
            style={{ backgroundImage: "radial-gradient(circle at 20% 0%, rgba(217,182,120,0.07), transparent 45%)" }}
          >
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: GOLD_BRIGHT }}>
              <Sparkles className="w-3.5 h-3.5" />
              Lifetime commission
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl" style={{ color: INK }}>
              Invite friends and turn traffic into recurring TapCash earnings.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,243,239,0.68)" }}>
              Share one clean link, keep the invite flow simple, and earn a recurring commission when your referrals complete offers and cash out.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#0A0A0D", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy referral link"}
              </button>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors" style={{ color: "rgba(245,243,239,0.68)" }}>
                Open dashboard
              </Link>
            </div>
          </div>
        </MotionWrap>

        <MotionWrap delay={0.05}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "rgba(245,243,239,0.45)" }}>Invite link</p>
          <h2 className="mt-2 text-2xl font-black" style={{ color: INK }}>Share this link</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(245,243,239,0.68)" }}>
            Paste this anywhere -- social, friends, communities -- and we will tie signups to your account.
          </p>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-grow w-full flex items-center gap-3 border-b py-3" style={{ borderColor: "rgba(245,243,239,0.14)" }}>
              <input
                type="text"
                readOnly
                aria-label="Your referral link"
                value={inviteLink}
                className="flex-grow w-full bg-transparent font-mono text-sm md:text-base focus:outline-none"
                style={{ color: INK }}
              />
              <ArrowUpRight className="w-5 h-5 shrink-0" style={{ color: "rgba(245,243,239,0.45)" }} />
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-black transition-all duration-200 hover:-translate-y-0.5 shrink-0"
              style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#0A0A0D", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </MotionWrap>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <MotionWrap>
            <div className="border-t pt-6" style={{ borderColor: "rgba(245,243,239,0.09)" }}>
              <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "rgba(245,243,239,0.45)" }}>Friends Invited</p>
              <p className="mt-3 font-mono text-3xl font-black tabular-nums" style={{ color: INK }}>
                {loading ? "..." : String(stats.invited)}
              </p>
              <p className="mt-1 text-sm" style={{ color: "rgba(245,243,239,0.45)" }}>Total referrals</p>
            </div>
          </MotionWrap>
          <MotionWrap delay={0.04}>
            <div className="border-t pt-6" style={{ borderColor: "rgba(245,243,239,0.09)" }}>
              <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "rgba(245,243,239,0.45)" }}>Passive Coins Earned</p>
              <p className="mt-3 font-mono text-3xl font-black tabular-nums" style={{ color: GOLD }}>
                {loading ? "..." : `+${stats.earned.toLocaleString()}`}
              </p>
              <p className="mt-1 text-sm" style={{ color: "rgba(245,243,239,0.45)" }}>Referral commissions</p>
            </div>
          </MotionWrap>
        </div>
      </main>
      <Footer />
    </div>
  );
}
