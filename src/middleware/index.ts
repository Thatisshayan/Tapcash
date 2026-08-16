import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { validateOrigin } from "@/lib/origin";

interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

const CSRF_EXEMPT_ROUTES = [
  "/api/auth/session",
  "/api/auth/signup",
  "/api/auth/csrf",
  "/api/postback/",
  "/api/postbacks/",
  "/api/health",
];

function isCsrfExempt(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((route) => pathname.startsWith(route));
}

export async function securityMiddleware(request: NextRequest): Promise<{ response?: NextResponse; rateLimit?: RateLimitInfo }> {
  const originResult = validateOrigin(request);
  if (!originResult.valid) {
    return {
      response: NextResponse.json(
        { error: `Origin validation failed: ${originResult.error}` },
        { status: 403 }
      ),
      rateLimit: { remaining: 59, resetTime: Date.now() + 60000, limit: 60 },
    };
  }

  const rateLimitResponse = await withRateLimit(request, { limit: 60, windowMs: 60000 });
  if (rateLimitResponse) {
    const remaining = Number(rateLimitResponse.headers.get("X-RateLimit-Remaining") || "0");
    const reset = Number(rateLimitResponse.headers.get("X-RateLimit-Reset") || "0");
    return {
      response: rateLimitResponse,
      rateLimit: { remaining, resetTime: reset, limit: 60 },
    };
  }

  const contentType = request.headers.get("content-type");
  if (request.method !== "GET" && !contentType?.includes("application/json")) {
    return {
      response: NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      ),
      rateLimit: { remaining: 59, resetTime: Date.now() + 60000, limit: 60 },
    };
  }

  if (!isCsrfExempt(request.nextUrl.pathname)) {
    const csrfResult = validateCsrf(request);
    if (!csrfResult.valid) {
      return {
        response: NextResponse.json(
          { error: `CSRF validation failed: ${csrfResult.error}` },
          { status: 403 }
        ),
        rateLimit: { remaining: 59, resetTime: Date.now() + 60000, limit: 60 },
      };
    }
  }

  return { rateLimit: { remaining: 59, resetTime: Date.now() + 60000, limit: 60 } };
}

/**
 * Response middleware for API routes
 * Adds standard security headers to all responses
 */
export function responseMiddleware(response: NextResponse, _rateLimit?: RateLimitInfo): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}
