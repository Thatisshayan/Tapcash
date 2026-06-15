import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ab-test/track
 * 
 * Tracks A/B test events for analytics.
 * Events include:
 * - variant_assigned: User assigned to a test variant
 * - variant_changed: User manually switched variant
 * - page_view: User viewed a page
 * - cta_click: User clicked a call-to-action
 * - signup_start: User started signup flow
 * - signup_complete: User completed signup
 * - offer_click: User clicked an offer
 * - offer_complete: User completed an offer
 * - cashout_start: User started cashout flow
 * - cashout_complete: User completed cashout
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { eventType, variant, sessionId, userId, timestamp, ...eventData } = data;

    // Validate required fields
    if (!eventType || !variant || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, variant, sessionId' },
        { status: 400 }
      );
    }

    // Log event to console (in production, save to database)
    console.log('[AB_TEST_EVENT]', {
      eventType,
      variant,
      sessionId,
      userId,
      timestamp,
      ...eventData,
    });

    // TODO: Save to database
    // Example structure:
    // db.abTestEvents.create({
    //   eventType,
    //   variant,
    //   sessionId,
    //   userId,
    //   timestamp: new Date(timestamp),
    //   metadata: eventData,
    // });

    return NextResponse.json(
      { success: true, eventType, variant },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AB_TEST_TRACK_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
