import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getClientIp } from '@/lib/antiFraud';

// Rapidoreach sends callbacks to this endpoint.
// Since their exact payload structure isn't fully public, we are logging it first
// to map the exact parameter names before finalizing the security checks.
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Log all incoming parameters from Rapidoreach
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('--- RAPIDOREACH POSTBACK RECEIVED ---');
    console.log('IP:', ip);
    console.log('Parameters:', params);
    
    // Store the raw postback in Firestore so we can inspect it safely
    await adminDb.collection('webhook_logs').add({
      provider: 'rapidoreach',
      method: 'GET',
      ip,
      userAgent,
      params,
      timestamp: FieldValue.serverTimestamp(),
    });

    // For now, always return success so Rapidoreach doesn't disable the callback
    return new NextResponse('1', { status: 200 });

  } catch (error) {
    console.error('Rapidoreach postback error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    // Some providers send POST requests with JSON or form data
    const contentType = request.headers.get('content-type') || '';
    let body: any = null;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = { rawText: text };
    }

    console.log('--- RAPIDOREACH POSTBACK RECEIVED (POST) ---');
    console.log('IP:', ip);
    console.log('Body:', body);
    
    // Store the raw postback in Firestore
    await adminDb.collection('webhook_logs').add({
      provider: 'rapidoreach',
      method: 'POST',
      ip,
      userAgent,
      body,
      timestamp: FieldValue.serverTimestamp(),
    });

    return new NextResponse('1', { status: 200 });

  } catch (error) {
    console.error('Rapidoreach postback error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
