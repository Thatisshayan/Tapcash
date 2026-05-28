import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

// Cache for 5 minutes — leaderboard doesn't need to be real-time
let cache: { data: any[]; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ leaderboard: cache.data });
    }

    // Aggregate balances from ledger_transactions per user
    const snapshot = await adminDb
      .collection("ledger_transactions")
      .select("userId", "balanceEffectCoins")
      .get();

    const totals = new Map<string, number>();
    snapshot.forEach((doc) => {
      const { userId, balanceEffectCoins } = doc.data();
      if (!userId) return;
      totals.set(userId, (totals.get(userId) ?? 0) + Number(balanceEffectCoins || 0));
    });

    // Sort descending, keep top 10
    const sorted = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Fetch display names for top users
    const leaderboard = await Promise.all(
      sorted.map(async ([userId, coins], idx) => {
        try {
          const userDoc = await adminDb.collection("users").doc(userId).get();
          const displayName = userDoc.data()?.displayName || `User_${userId.slice(0, 6)}`;
          return { rank: idx + 1, userId, displayName, coins: Math.max(0, coins) };
        } catch {
          return { rank: idx + 1, userId, displayName: `User_${userId.slice(0, 6)}`, coins: Math.max(0, coins) };
        }
      })
    );

    cache = { data: leaderboard, ts: Date.now() };
    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({ leaderboard: [] }, { status: 200 });
  }
}
