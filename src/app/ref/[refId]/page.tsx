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

// Aurora palette (packages/tokens/tokens.json v3.0.0). Tier accent still
// reflects real user data, but the color set is the locked Aurora palette
// (gold family + muted violet/blue secondaries) rather than the old
// teal/neon-blue set.
function getTierColor(tier: string) {
  if (tier === "Diamond") return "#3E6FD9"; // accent-secondary-blue
  if (tier === "Platinum") return "#6C5CE0"; // accent-secondary-violet
  if (tier === "Gold") return "#D9B678"; // accent-primary
  if (tier === "Silver") return "#B8B4AC"; // neutral, no palette match needed
  return "#B98F4C"; // accent-primary-deep (Bronze/default)
}

export default async function ReferralLandingPage({ params }: Props) {
  const { refId } = await params;
  const referrer = await getReferrerInfo(refId);

  const accentColor = referrer ? getTierColor(referrer.tier) : "#D9B678";
  const maskedName = referrer
    ? referrer.displayName.length > 3
      ? referrer.displayName.slice(0, 2) + "***" + referrer.displayName.slice(-1)
      : referrer.displayName
    : "Someone";

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] overflow-x-hidden">
      {/* Hero atmosphere -- soft radial wash, not an ambient looping glow on
          static decoration (glow is reserved for the interactive CTA below) */}
      <div
        className="fixed -top-60 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[180px] pointer-events-none opacity-[0.08]"
        style={{ background: accentColor }}
      />

      <div className="relative max-w-lg mx-auto px-4 py-12 sm:py-20 flex flex-col items-center gap-14">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)" }}
          >
            <Sparkles className="w-5 h-5 text-[#0A0A0D]" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-[#F5F3EF]">TapCash</p>
            <p className="text-[9px] uppercase tracking-[0.25em] text-[rgba(245,243,239,0.45)] font-semibold">Ledger-first rewards</p>
          </div>
        </Link>

        {/* Invite -- de-boxed: spacing + typography hierarchy, no bordered
            card chrome (Aurora anti-pattern: no bounded card/box as default
            layout language) */}
        <div className="w-full text-center space-y-5">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: accentColor, background: `${accentColor}14` }}
          >
            <Users className="w-3 h-3" /> You Were Invited
          </div>

          <div className="space-y-1">
            <p className="text-4xl font-black leading-tight text-[#F5F3EF] sm:text-5xl">
              {maskedName} wants
            </p>
            <p className="text-4xl font-black leading-tight sm:text-5xl" style={{ color: accentColor }}>
              you to earn too.
            </p>
          </div>

          {referrer && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <Trophy className="w-4 h-4" style={{ color: accentColor }} />
              <span className="font-mono text-sm font-black tabular-nums" style={{ color: accentColor }}>
                {referrer.tier} VIP · {referrer.totalCoins.toLocaleString()} coins earned
              </span>
            </div>
          )}

          <p className="text-[rgba(245,243,239,0.68)] text-sm leading-relaxed max-w-xs mx-auto pt-1">
            Complete surveys, do app tasks & watch videos. Real coins, ledger-backed balance, cash out anytime.
          </p>

          {/* Glow permitted here -- this is the interactive hero CTA */}
          <Link
            href={`/auth/signup?ref=${refId}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-black text-sm text-[#0A0A0D] transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 16px 40px ${accentColor}30` }}
          >
            Claim Your Invite <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs text-[rgba(245,243,239,0.3)]">Free to join · No credit card · Instant access</p>
        </div>

        {/* Perks -- spacing + icon + typography, no bordered panel grid */}
        <div className="grid grid-cols-3 gap-6 w-full">
          {[
            { icon: <Coins className="w-5 h-5" />, label: "Real Coins", sub: "Ledger-verified" },
            { icon: <Zap className="w-5 h-5" />, label: "Instant Credit", sub: "No delays" },
            { icon: <Users className="w-5 h-5" />, label: "Refer Friends", sub: "20% forever" },
          ].map((p) => (
            <div key={p.label} className="text-center space-y-1.5">
              <div className="flex justify-center" style={{ color: accentColor }}>{p.icon}</div>
              <p className="text-xs font-black text-[#F5F3EF]">{p.label}</p>
              <p className="text-[10px] text-[rgba(245,243,239,0.3)] font-medium">{p.sub}</p>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-xs text-[rgba(245,243,239,0.28)] text-center">
          When you sign up with this link, {maskedName} earns a commission on your rewards forever.
        </p>

      </div>
    </div>
  );
}
