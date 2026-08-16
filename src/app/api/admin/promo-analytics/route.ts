import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdminSession } from "@/lib/admin-session";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) return auth.response;

  // Aggregate all promo redemptions from ledger_transactions
  const snap = await adminDb
    .collection("ledger_transactions")
    .where("source", "==", "promo_code")
    .get();

  const stats: Record<string, { redemptions: number; coinsIssued: number; users: number }> = {};

  for (const doc of snap.docs) {
    const data = doc.data();
    const code = (data.metadata?.code as string) || data.referenceId || "unknown";
    if (!stats[code]) stats[code] = { redemptions: 0, coinsIssued: 0, users: 0 };
    stats[code].redemptions++;
    stats[code].coinsIssued += data.balanceEffectCoins || 0;
    stats[code].users++;
  }

  const result = Object.entries(stats).map(([code, s]) => ({
    code,
    redemptions: s.redemptions,
    uniqueUsers: s.users,
    coinsIssued: s.coinsIssued,
    cadValue: (s.coinsIssued / 1000).toFixed(2),
  }));

  result.sort((a, b) => b.redemptions - a.redemptions);

  return NextResponse.json({ analytics: result, totalCodes: result.length });
}
