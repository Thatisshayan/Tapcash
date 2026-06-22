import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_SECRET = process.env.SESSION_SECRET;
const isProduction = process.env.NODE_ENV === "production";

function getSecret() {
  if (!SESSION_SECRET) return null;
  return new TextEncoder().encode(SESSION_SECRET);
}

interface SessionPayload {
  uid: string;
  email: string;
  admin?: boolean;
}

async function verifySession(cookieValue: string | undefined): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  const secret = getSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, secret);
    if (typeof payload.uid === "string") {
      return { uid: payload.uid, email: (payload.email as string) || "", admin: !!payload.admin };
    }
    return null;
  } catch {
    return null;
  }
}

const AUTH_ROUTES = [
  "/dashboard",
  "/dashboard/",
  "/cashout",
  "/cashout/",
  "/rapidoreach",
  "/rapidoreach/",
  "/transactions",
  "/transactions/",
  "/referrals",
  "/referrals/",
  "/payouts",
  "/payouts/",
];

const ADMIN_ROUTES = ["/admin", "/admin/"];

function matchRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect specific routes
  const isAuthPage = matchRoute(pathname, AUTH_ROUTES);
  const isAdminPage = matchRoute(pathname, ADMIN_ROUTES);

  if (!isAuthPage && !isAdminPage) {
    return NextResponse.next();
  }

  // If SESSION_SECRET isn't configured, allow in dev but block in production
  if (!SESSION_SECRET) {
    if (isProduction) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    console.warn("[middleware] SESSION_SECRET not configured — skipping auth check in dev");
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session")?.value;
  const session = await verifySession(sessionCookie);

  if (!session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For admin routes, verify admin claim
  if (isAdminPage && !session.admin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cashout/:path*",
    "/rapidoreach/:path*",
    "/transactions/:path*",
    "/referrals/:path*",
    "/payouts/:path*",
    "/admin/:path*",
  ],
};
