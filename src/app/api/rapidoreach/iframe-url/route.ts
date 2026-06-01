import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireVerifiedUser } from "@/lib/verified-user";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const verifiedUser = await requireVerifiedUser(request);
  if ("response" in verifiedUser) return verifiedUser.response;

  if (verifiedUser.uid !== userId) {
    return NextResponse.json({ error: "User mismatch" }, { status: 403 });
  }

  const appId = process.env.RAPIDOREACH_APP_ID || process.env.NEXT_PUBLIC_RAPIDOREACH_APP_ID;
  const appKey = process.env.RAPIDOREACH_APP_KEY;
  if (!appId || !appKey) {
    console.error("RapidoReach credentials are not configured");
    return NextResponse.json({ error: "Offerwall is temporarily unavailable" }, { status: 503 });
  }

  // RapidoReach expects a three-part UID:
  // internalUserId-appId-checksum
  // where checksum = first 10 chars of md5(internalUserId + appId + appKey)
  const rawString = `${userId}${appId}${appKey}`;
  const checksum = crypto.createHash('md5').update(rawString).digest('hex').slice(0, 10);
  const rapidoreachUid = `${userId}-${appId}-${checksum}`;

  const iframeUrl = `https://www.rapidoreach.com/offerwall/?userId=${encodeURIComponent(rapidoreachUid)}`;

  return NextResponse.json({ iframeUrl });
}
