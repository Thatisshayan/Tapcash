export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Coins, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { adminDb } from "@/lib/firebaseAdmin";

interface Props {
  params: Promise<{ refId: string }>;
}

async function getReferrerInfo(refId: string) {
  try {
    const snap = await adminDb.collection("users").doc(refId).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    const txSnap = await adminDb
      .collection("ledger_transactions")
      .where("userId", "==", refId)
      .get();
    const totalCoins = txSnap.docs.reduce(
      (sum, d) => sum + (d.data().balanceEffectCoins || 0),
      0
    );
    return {
      displayName: data.displayName || "A TapCash Member",
      tier: data.vipTier || "Bronze",
      totalCoins,
    };
  } catch {
    return null;
  }
}

function getTierColor(tier: string) {
  if (tier === "Diamond") return "#3a7bff";
  if (tier === "Platinum") return "#00e6c3";
  if (tier === "Gold") return "#f5c842";
  if (tier === "Silver") return "#94a3b8";
  return "#f59e0b";
}

export default async function ReferralLandingPage({ params }: Props) {
  const { refId } = await params;
  const referrer = await getReferrerInfo(refId);

  const accentColor = referrer ? getTierColor(referrer.tier) : "#00e6c3";
  const maskedName = referrer
    ? referrer.displayName.length > 3
      ? referrer.displayName.slice(0, 2) + "***" + referrer.displayName.slice(-1)
      : referrer.displayName
    : "Someone";

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      {/* Ambient glow */}
      <div
        className="fixed -top-60 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[180px] pointer-events-none opacity-20"
        style={{ background: accentColor }}
      />

      <div className="relative max-w-lg mx-auto px-4 py-12 sm:py-20 flex flex-col items-center gap-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#00e6c3] flex items-center justify-center shadow-[0_0_30px_rgba(0,230,195,0.3)]">
            <Sparkles className="w-5 h-5 text-[#050816]" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-white">TapCash</p>
            <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">Ledger-first rewards</p>
          </div>
        </Link>

        {/* Invite card */}
        <div
          className="w-full rounded-[2rem] border p-8 text-center space-y-4 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
          style={{ borderColor: `${accentColor}30`, background: `radial-gradient(ellipse at top, ${accentColor}08 0%, #080c1a 65%)` }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: accentColor, borderColor: `${accentColor}33`, background: `${accentColor}10` }}
          >
            <Users className="w-3 h-3" /> You Were Invited
          </div>

          <div className="space-y-1">
            <p className="text-5xl font-black text-white leading-tight">
              {maskedName} wants
            </p>
            <p className="text-5xl font-black leading-tight" style={{ color: accentColor }}>
              you to earn too.
            </p>
          </div>

          {referrer && (
            <div
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border mx-auto w-fit"
              style={{ borderColor: `${accentColor}22`, background: `${accentColor}08` }}
            >
              <Trophy className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-sm font-black" style={{ color: accentColor }}>
                {referrer.tier} VIP · {referrer.totalCoins.toLocaleString()} coins earned
              </span>
            </div>
          )}

          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
            Complete surveys, do app tasks & watch videos. Real coins, ledger-backed balance, cash out anytime.
          </p>

          <Link
            href={`/auth/signup?ref=${refId}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm text-[#050816] shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 16px 40px ${accentColor}30` }}
          >
            Claim Your Invite <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs text-zinc-600">Free to join · No credit card · Instant access</p>
        </div>

        {/* Perk pills */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { icon: <Coins className="w-5 h-5" />, label: "Real Coins", sub: "Ledger-verified" },
            { icon: <Zap className="w-5 h-5" />, label: "Instant Credit", sub: "No delays" },
            { icon: <Users className="w-5 h-5" />, label: "Refer Friends", sub: "20% forever" },
          ].map((p) => (
            <div
              key={p.label}
              className="rounded-2xl border border-white/6 bg-white/[0.03] p-4 text-center space-y-1.5"
            >
              <div className="flex justify-center" style={{ color: accentColor }}>{p.icon}</div>
              <p className="text-xs font-black text-white">{p.label}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{p.sub}</p>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-xs text-zinc-700 text-center">
          When you sign up with this link, {maskedName} earns a commission on your rewards forever.
        </p>

      </div>
    </div>
  );
}
