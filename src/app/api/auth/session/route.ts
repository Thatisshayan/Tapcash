import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { SignJWT } from 'jose';
import { clearCsrfCookie, generateAndSetCsrfToken } from '@/lib/csrf';

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
    const userData = userDoc.data();

    // Accept either `admin` or `isAdmin` -- the codebase has historically
    // used both field names for the same concept (e.g. src/app/api/payout/
    // route.ts checks isAdmin) and there's no single canonical source in
    // this repo for which one production user docs actually carry. Checking
    // both avoids locking out an admin whose doc uses the other convention.
    if (!userDoc.exists || (userData?.admin !== true && userData?.isAdmin !== true)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const secret = new TextEncoder().encode(SESSION_SECRET);
    const jwt = await new SignJWT({ uid, email: decodedToken.email || userData?.email || '', admin: true })
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

    generateAndSetCsrfToken(response);

    return response;

  } catch (error) {
    console.error('Session creation error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * Logs out of the admin session: clears admin_session + csrf_token so a
 * cleared/expired session can't keep being accepted from a device that's
 * still open (see docs/governance/DEFERRED_WORK.md, "no active
 * admin-session revocation/logout path"). Does not revoke the underlying
 * Firebase ID token -- callers should also sign out of Firebase Auth.
 */
export async function DELETE() {
  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  response.cookies.set({
    name: 'admin_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  clearCsrfCookie(response);

  return response;
}
