/**
 * Real-Time Leaderboard API
 * Fetches top users by earnings with real-time updates and caching
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { computeLedgerBalance } from "@/lib/ledger";

// Cache configuration
const CACHE_DURATION_MS = 60 * 1000; // 1 minute
let cachedLeaderboard: LeaderboardEntry[] | null = null;
let cacheTimestamp = 0;

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar?: string;
  totalEarnings: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  totalEarnings?: number;
  createdAt?: unknown;
}

/**
 * Calculate user's total earnings from ledger
 */
async function calculateUserEarnings(userId: string): Promise<number> {
  try {
    const balance = await computeLedgerBalance(userId);
    return Math.max(0, balance); // Only positive earnings
  } catch (error) {
    console.error(`Error calculating earnings for user ${userId}:`, error);
    return 0;
  }
}

/**
 * Fetch top users and calculate their rankings
 */
async function fetchLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  try {
    // Get all users with activity
    const usersSnapshot = await adminDb
      .collection("users")
      .where("totalEarnings", ">", 0)
      .orderBy("totalEarnings", "desc")
      .limit(limit)
      .get();

    const leaderboardPromises = usersSnapshot.docs.map(async (doc, index) => {
      const userData = doc.data() as UserData;
      const userId = doc.id;

      // Get real-time balance from ledger
      const currentBalance = await calculateUserEarnings(userId);

      return {
        userId,
        displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
        avatar: userData.photoURL,
        totalEarnings: currentBalance,
        rank: index + 1,
      };
    });

    let leaderboard = await Promise.all(leaderboardPromises);

    // Re-sort by actual earnings (in case ledger differs from cached totalEarnings)
    leaderboard.sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Update ranks after sorting
    leaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Handle ties - users with same earnings get same rank
    for (let i = 1; i < leaderboard.length; i++) {
      if (leaderboard[i].totalEarnings === leaderboard[i - 1].totalEarnings) {
        leaderboard[i].rank = leaderboard[i - 1].rank;
      }
    }

    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}

/**
 * Get cached leaderboard or fetch fresh data
 */
async function getLeaderboard(forceRefresh: boolean = false): Promise<LeaderboardEntry[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (!forceRefresh && cachedLeaderboard && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return cachedLeaderboard;
  }

  // Fetch fresh data
  const leaderboard = await fetchLeaderboard();
  
  // Update cache
  cachedLeaderboard = leaderboard;
  cacheTimestamp = now;

  return leaderboard;
}

/**
 * Find user's rank in leaderboard
 */
async function getUserRank(userId: string): Promise<{ rank: number; totalEarnings: number } | null> {
  try {
    const userEarnings = await calculateUserEarnings(userId);
    
    if (userEarnings <= 0) {
      return null;
    }

    // Count users with higher earnings
    const higherEarningsSnapshot = await adminDb
      .collection("users")
      .where("totalEarnings", ">", userEarnings)
      .get();

    const rank = higherEarningsSnapshot.size + 1;

    return {
      rank,
      totalEarnings: userEarnings,
    };
  } catch (error) {
    console.error(`Error getting rank for user ${userId}:`, error);
    return null;
  }
}

/**
 * GET /api/leaderboard/live
 * Fetch real-time leaderboard
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const userId = searchParams.get("userId");
    const forceRefresh = searchParams.get("refresh") === "true";

    // Validate limit
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 1000" },
        { status: 400 }
      );
    }

    // Get leaderboard
    let leaderboard = await getLeaderboard(forceRefresh);

    // Limit results
    leaderboard = leaderboard.slice(0, limit);

    // If userId provided, mark current user and get their rank
    let userRank = null;
    if (userId) {
      // Mark user in leaderboard if they're in top results
      leaderboard = leaderboard.map(entry => ({
        ...entry,
        isCurrentUser: entry.userId === userId,
      }));

      // Get user's rank even if not in top results
      userRank = await getUserRank(userId);
    }

    // Calculate cache info
    const cacheAge = Date.now() - cacheTimestamp;
    const cacheRemaining = Math.max(0, CACHE_DURATION_MS - cacheAge);

    return NextResponse.json({
      success: true,
      leaderboard,
      userRank,
      meta: {
        total: leaderboard.length,
        limit,
        cached: cacheAge < CACHE_DURATION_MS && !forceRefresh,
        cacheExpiresIn: Math.floor(cacheRemaining / 1000), // seconds
        lastUpdated: new Date(cacheTimestamp).toISOString(),
      },
    });

  } catch (error) {
    console.error("[Leaderboard API Error]", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leaderboard/live
 * Force refresh leaderboard cache
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication check here
    // Only allow admins or authenticated users to force refresh

    const leaderboard = await getLeaderboard(true);

    return NextResponse.json({
      success: true,
      message: "Leaderboard cache refreshed",
      leaderboard: leaderboard.slice(0, 10), // Return top 10
      meta: {
        total: leaderboard.length,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
      },
    });

  } catch (error) {
    console.error("[Leaderboard Refresh Error]", error);
    
    return NextResponse.json(
      {
        error: "Failed to refresh leaderboard",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// Made with Bob
