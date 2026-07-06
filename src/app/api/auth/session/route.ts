import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { SignJWT } from 'jose';
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf';

const SESSION_SECRET = process.env.SESSION_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!SESSION_SECRET) {
      console.error('SESSION_SECRET is not configured');
      return new NextResponse('Internal server error', { status: 500 });
    }

    const { idToken } = await request.json();

    if (!idToken) {
      return new NextResponse('Missing ID token', { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists || userDoc.data()?.admin !== true) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const secret = new TextEncoder().encode(SESSION_SECRET);
    const jwt = await new SignJWT({ uid, admin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const response = new NextResponse(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    response.cookies.set({
      name: 'admin_session',
      value: jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    const { token: csrfToken } = generateCsrfToken();
    setCsrfCookie(response, csrfToken);

    return response;

  } catch (error) {
    console.error('Session creation error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
