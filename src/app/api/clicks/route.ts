import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, offerId, provider } = body;

    // Validate required fields
    if (!userId || !offerId || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, offerId, provider' },
        { status: 400 }
      );
    }

    // Verify user exists in Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Rate limiting: check clicks in last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentClicksSnapshot = await adminDb
      .collection('clicks')
      .where('userId', '==', userId)
      .where('timestamp', '>=', Timestamp.fromDate(oneHourAgo))
      .count()
      .get();

    const recentClickCount = recentClicksSnapshot.data().count;

    if (recentClickCount >= 50) {
      return NextResponse.json(
        { error: 'Too many clicks' },
        { status: 429 }
      );
    }

    // Get IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create click record
    const clickRecord = {
      userId,
      offerId,
      provider,
      ip,
      userAgent,
      timestamp: Timestamp.now(),
      status: 'clicked' as const,
    };

    const docRef = await adminDb.collection('clicks').add(clickRecord);

    return NextResponse.json(
      { success: true, clickId: docRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}