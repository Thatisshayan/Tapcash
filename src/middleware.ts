import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET;

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin_session');
    
    if (!adminCookie || !adminCookie.value) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    if (!SESSION_SECRET) {
      console.error('SESSION_SECRET is not configured in middleware');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    try {
      // Verify the JWT signature using the edge-compatible jose library
      const secret = new TextEncoder().encode(SESSION_SECRET);
      const { payload } = await jwtVerify(adminCookie.value, secret);
      
      // Additional check to ensure payload indicates admin
      if (payload.admin !== true) {
        throw new Error('Not an admin');
      }
      
      // Token is valid and signed by us
      return NextResponse.next();
    } catch (error) {
      console.error('Admin session validation failed:', error);
      // Invalid or tampered cookie
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
