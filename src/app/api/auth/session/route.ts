import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { SignJWT } from 'jose';

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

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if the user is an admin in Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists || userDoc.data()?.admin !== true) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // User is an admin, generate a secure JWT
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const jwt = await new SignJWT({ uid, admin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // 24 hours
      .sign(secret);

    // Create the response and set the cookie
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
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Session creation error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
