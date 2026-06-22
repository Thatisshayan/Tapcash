import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { tapCashLeaderboardSeed } from "@shared/tapcash-content";

export const runtime = "nodejs";
export const revalidate = 300;

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  coins: number;
}

let cache: { data: LeaderboardEntry[]; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(
        { leaderboard: cache.data },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    const snapshot = await adminDb
      .collection("ledger_transactions")
      .select("userId", "balanceEffectCoins")
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ leaderboard: tapCashLeaderboardSeed, source: "seed" });
    }

    const totals = new Map<string, number>();
    snapshot.forEach((doc) => {
      const { userId, balanceEffectCoins } = doc.data();
      if (!userId) return;
      totals.set(userId, (totals.get(userId) ?? 0) + Number(balanceEffectCoins || 0));
    });

    const sorted = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

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
    return NextResponse.json(
      { leaderboard, source: "firestore" },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error("Leaderboard fallback to seed:", err);
    return NextResponse.json({ leaderboard: tapCashLeaderboardSeed, source: "seed" }, { status: 200 });
  }
}
