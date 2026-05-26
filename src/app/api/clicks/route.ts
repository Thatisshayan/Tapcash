import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { getClientIp, isBotAgent, isIpSuspicious, logFraudAttempt } from '@/lib/antiFraud';
import { withRateLimit } from '@/lib/rate-limit';
import { logAdminAction } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, offerId, provider } = body;

    // Validate required fields
    if (!userId || !offerId || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, offerId, provider' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 1. Sniff out Headless Automation Tools/Scrapers
    const botCheck = isBotAgent(userAgent);
    if (botCheck.isBot) {
      await logFraudAttempt({
        ip,
        userId,
        action: "CLICK_BLOCKED_BOT",
        reason: botCheck.reason || "Bot User-Agent detected on click",
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Clicks blocked due to automated scrapers usage." }, { status: 403 });
    }

    // 2. Verify user exists and is active in Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data()!;
    if (userData.status === 'banned' || userData.isFlagged === true) {
      await logFraudAttempt({
        ip,
        userId,
        email: userData.email,
        action: "CLICK_BLOCKED_LOCK",
        reason: `Banned/Flagged user attempted offer click. Status: ${userData.status}`,
        userAgent,
        createdAt: new Date(),
      });
      return NextResponse.json(
        { error: 'Your account is currently locked or flagged for review. Offer clicking disabled.' },
        { status: 403 }
      );
    }

    // 3. Perform VPN/Proxy checking via ProxyCheck.io
    const ipCheck = await isIpSuspicious(ip, "CLICK_BLOCKED_VPN", userId, userData.email, userAgent);
    if (ipCheck.suspicious) {
      return NextResponse.json({ 
        error: "Access denied. VPN, Proxy, or Tor connections are strictly prohibited on clicking offers." 
      }, { status: 403 });
    }

    // 4. Rate limiting: check clicks in last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentClicksSnapshot = await adminDb
      .collection('clicks')
      .where('userId', '==', userId)
      .limit(50)
      .get();

    const recentClickCount = recentClicksSnapshot.docs.filter((doc) => {
      const data = doc.data() as { timestamp?: Timestamp | Date | string };
      const clickedAt = data.timestamp instanceof Timestamp
        ? data.timestamp.toDate()
        : data.timestamp instanceof Date
          ? data.timestamp
          : data.timestamp ? new Date(data.timestamp) : null;

      return clickedAt ? clickedAt >= oneHourAgo : true;
    }).length;

    if (recentClickCount >= 50) {
      return NextResponse.json(
        { error: 'Too many clicks' },
        { status: 429 }
      );
    }

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

    const docRef = await adminDb.collection('offer_clicks').add(clickRecord);

    await logAdminAction({
      action: "offer_click",
      actorUserId: userId,
      targetType: "offer",
      targetId: offerId,
      metadata: {
        provider,
        ip,
        userAgent,
        clickId: docRef.id,
      },
    });

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
