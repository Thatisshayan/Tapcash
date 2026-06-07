import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  type: 'offer_completed' | 'cashout' | 'signup';
  amount?: number;
  offerTitle?: string;
  timestamp: number;
}

export async function GET() {
  try {
    // Fetch recent activity from Firestore
    const activitiesRef = adminDb.collection('activities');
    const snapshot = await activitiesRef
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const activities: ActivityEvent[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        userId: data.userId || 'anonymous',
        userName: data.userName || 'User',
        type: data.type || 'offer_completed',
        amount: data.amount,
        offerTitle: data.offerTitle,
        timestamp: data.timestamp || Date.now(),
      });
    });

    // If no activities found, return empty array (not fake data)
    if (activities.length === 0) {
      return NextResponse.json({
        activities: [],
        message: 'No recent activity',
      });
    }

    return NextResponse.json({
      activities,
      count: activities.length,
      lastUpdated: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching live activity:', error);
    
    // Return empty array on error, not fake data
    return NextResponse.json(
      {
        activities: [],
        error: 'Failed to fetch activity',
      },
      { status: 500 }
    );
  }
}

// POST endpoint to add new activity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, type, amount, offerTitle } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add activity to Firestore
    const activityRef = adminDb.collection('activities');
    const newActivity = {
      userId,
      userName: userName || 'User',
      type,
      amount: amount || 0,
      offerTitle: offerTitle || '',
      timestamp: Date.now(),
    };

    const docRef = await activityRef.add(newActivity);

    return NextResponse.json({
      success: true,
      activityId: docRef.id,
      activity: {
        id: docRef.id,
        ...newActivity,
      },
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

// Made with Bob
