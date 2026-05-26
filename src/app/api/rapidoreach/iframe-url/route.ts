import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const appId = process.env.NEXT_PUBLIC_RAPIDOREACH_APP_ID || "parPnrD9RiU";
  const appKey = process.env.RAPIDOREACH_APP_KEY || "3912bbe80f741af48d3624ce4a4d1b37";

  // RapidoReach expects a three-part UID:
  // internalUserId-appId-checksum
  // where checksum = md5(internalUserId + appId + appKey).slice(0, 10)
  const rawString = `${userId}${appId}${appKey}`;
  const checksum = crypto.createHash('md5').update(rawString).digest('hex').slice(0, 10);
  const rapidoreachUid = `${userId}-${appId}-${checksum}`;

  const iframeUrl = `https://www.rapidoreach.com/offerwall/?userId=${encodeURIComponent(rapidoreachUid)}`;

  return NextResponse.json({ iframeUrl });
}
