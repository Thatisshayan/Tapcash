import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const ADMIN_UIDS = (process.env.ADMIN_UIDS || "").split(",").map((u) => u.trim()).filter(Boolean);

async function isAdmin(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7));
    return ADMIN_UIDS.includes(decoded.uid);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Aggregate all promo redemptions from ledger_transactions
  const snap = await adminDb
    .collection("ledger_transactions")
    .where("source", "==", "promo_code")
    .get();

  const stats: Record<string, { redemptions: number; coinsIssued: number; users: Set<string> }> = {};

  for (const doc of snap.docs) {
    const data = doc.data();
    const code = (data.metadata?.code as string) || data.referenceId || "unknown";
    if (!stats[code]) stats[code] = { redemptions: 0, coinsIssued: 0, users: new Set() };
    stats[code].redemptions++;
    stats[code].coinsIssued += data.balanceEffectCoins || 0;
    stats[code].users.add(data.userId);
  }

  const result = Object.entries(stats).map(([code, s]) => ({
    code,
    redemptions: s.redemptions,
    uniqueUsers: s.users.size,
    coinsIssued: s.coinsIssued,
    cadValue: (s.coinsIssued / 1000).toFixed(2),
  }));

  result.sort((a, b) => b.redemptions - a.redemptions);

  return NextResponse.json({ analytics: result, totalCodes: result.length });
}
