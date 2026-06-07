import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute

interface UserStats {
  totalUsers: number;
  activeUsers24h: number;
  cashedOut24h: number;
  totalCashedOut: number;
  lastUpdated: number;
}

export async function GET() {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Get total users count
    const usersSnapshot = await adminDb.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    // Get active users in last 24h
    const activeUsersSnapshot = await adminDb
      .collection('users')
      .where('lastActive', '>=', twentyFourHoursAgo)
      .count()
      .get();
    const activeUsers24h = activeUsersSnapshot.data().count;

    // Get users who cashed out in last 24h
    const cashedOutSnapshot = await adminDb
      .collection('transactions')
      .where('type', '==', 'cashout')
      .where('status', '==', 'completed')
      .where('timestamp', '>=', twentyFourHoursAgo)
      .count()
      .get();
    const cashedOut24h = cashedOutSnapshot.data().count;

    // Get total amount cashed out (aggregate)
    const transactionsSnapshot = await adminDb
      .collection('transactions')
      .where('type', '==', 'cashout')
      .where('status', '==', 'completed')
      .get();

    let totalCashedOut = 0;
    transactionsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalCashedOut += data.amount || 0;
    });

    const stats: UserStats = {
      totalUsers,
      activeUsers24h,
      cashedOut24h,
      totalCashedOut,
      lastUpdated: now,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // Return zeros on error, not fake data
    return NextResponse.json(
      {
        totalUsers: 0,
        activeUsers24h: 0,
        cashedOut24h: 0,
        totalCashedOut: 0,
        lastUpdated: Date.now(),
        error: 'Failed to fetch user statistics',
      },
      { status: 500 }
    );
  }
}

// POST endpoint to increment user count (for new signups)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update user activity timestamp
    if (action === 'activity') {
      await adminDb.collection('users').doc(userId).update({
        lastActive: Date.now(),
      });
    }

    // Record cashout
    if (action === 'cashout') {
      const { amount } = body;
      await adminDb.collection('transactions').add({
        userId,
        type: 'cashout',
        amount: amount || 0,
        status: 'completed',
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `User ${action} recorded`,
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    return NextResponse.json(
      { error: 'Failed to update user statistics' },
      { status: 500 }
    );
  }
}

// Made with Bob
