import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { requireVerifiedUser } from "@/lib/verified-user";
import { withRateLimit } from "@/lib/rate-limit";
import { checkAndAwardAchievements } from "@/lib/achievements";

const STREAK_REWARDS = [10, 15, 20, 25, 30, 40, 50];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const verifiedUser = await requireVerifiedUser(request);
    if ("response" in verifiedUser) return verifiedUser.response;
    const { uid, userData } = verifiedUser;

    const streakCount = userData.streakCount ?? 0;
    const lastCheckIn = userData.lastStreakCheckIn;
    const bestStreak = userData.bestStreak ?? 0;

    let lastCheckInDate: string | null = null;
    if (lastCheckIn) {
      const d = lastCheckIn.toDate ? lastCheckIn.toDate() : new Date(lastCheckIn);
      lastCheckInDate = d.toISOString().split("T")[0];
    }

    const today = getTodayKey();
    const checkedInToday = lastCheckInDate === today;

    let streakActive = false;
    if (lastCheckInDate) {
      const lastDate = new Date(lastCheckInDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / MS_PER_DAY);
      streakActive = diffDays <= 1;
    }

    const nextReward = streakActive
      ? STREAK_REWARDS[Math.min(streakCount, STREAK_REWARDS.length - 1)]
      : STREAK_REWARDS[0];

    return NextResponse.json({
      streakCount: streakActive ? streakCount : 0,
      bestStreak,
      checkedInToday,
      streakActive,
      lastCheckInDate,
      nextReward,
      dayInCycle: streakActive ? ((streakCount - 1) % 7) + 1 : 0,
    });
  } catch (error: unknown) {
    console.error("[STREAK GET]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch streak" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, { limit: 3, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const verifiedUser = await requireVerifiedUser(request);
    if ("response" in verifiedUser) return verifiedUser.response;
    const { uid, userData } = verifiedUser;

    const userRef = adminDb.collection("users").doc(uid);
    const today = getTodayKey();

    let result: {
      streakCount: number;
      coinsEarned: number;
      checkedInToday: boolean;
      newBest: boolean;
      achievements: string[];
    } = { streakCount: 0, coinsEarned: 0, checkedInToday: false, newBest: false, achievements: [] };

    await adminDb.runTransaction(async (transaction) => {
      const freshSnap = await transaction.get(userRef);
      if (!freshSnap.exists) throw new Error("User not found");
      const freshData = freshSnap.data()!;

      const lastCheckIn = freshData.lastStreakCheckIn;
      let lastCheckInDate: string | null = null;
      if (lastCheckIn) {
        const d = lastCheckIn.toDate ? lastCheckIn.toDate() : new Date(lastCheckIn);
        lastCheckInDate = d.toISOString().split("T")[0];
      }

      if (lastCheckInDate === today) {
        result = {
          streakCount: freshData.streakCount ?? 0,
          coinsEarned: 0,
          checkedInToday: true,
          newBest: false,
          achievements: [],
        };
        return;
      }

      let newStreak: number;
      if (lastCheckInDate) {
        const lastDate = new Date(lastCheckInDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / MS_PER_DAY);
        newStreak = diffDays === 1 ? (freshData.streakCount ?? 0) + 1 : 1;
      } else {
        newStreak = 1;
      }

      const coinsEarned = STREAK_REWARDS[Math.min(newStreak - 1, STREAK_REWARDS.length - 1)];
      const bestStreak = freshData.bestStreak ?? 0;
      const newBest = newStreak > bestStreak;

      transaction.update(userRef, {
        streakCount: newStreak,
        bestStreak: newBest ? newStreak : bestStreak,
        lastStreakCheckIn: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const ledgerRef = adminDb.collection("ledger_transactions").doc();
      transaction.set(ledgerRef, {
        id: ledgerRef.id,
        userId: uid,
        type: "approved_credit",
        amountCoins: coinsEarned,
        balanceEffectCoins: coinsEarned,
        method: `Daily Streak Day ${newStreak}`,
        status: "approved",
        source: "daily_streak",
        referenceId: `streak_${today}`,
        metadata: { streakDay: newStreak, dayInCycle: ((newStreak - 1) % 7) + 1 },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      result = {
        streakCount: newStreak,
        coinsEarned,
        checkedInToday: false,
        newBest,
        achievements: [],
      };
    });

    if (!result.checkedInToday && result.streakCount > 0) {
      const achievements = await checkAndAwardAchievements(uid, {
        streakDay: result.streakCount,
      });
      result.achievements = achievements;
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error("[STREAK POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Streak check-in failed" },
      { status: 500 }
    );
  }
}
