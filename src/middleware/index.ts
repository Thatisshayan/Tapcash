import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;

/**
 * Simple in-memory rate limiter (for production, use Upstash Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(ip, path);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetTime: record.resetTime };
}

/**
 * Security middleware for API routes
 * Validates request headers and implements rate limiting
 */
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
  const { allowed, remaining, resetTime } = checkRateLimit(ip, request.nextUrl.pathname);

  // Rate limit exceeded
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429, headers: { "X-RateLimit-Reset": String(resetTime) } }
    );
  }

  // Check for required headers
  const contentType = request.headers.get("content-type");
  
  // Allow GET requests without content-type
  if (request.method !== "GET" && !contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 }
    );
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-RateLimit-Remaining", String(remaining));

  return null; // Continue to route handler
}

/**
 * Response middleware for API routes
 * Adds standard headers to all responses
 */
export function responseMiddleware(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

// Made with Bob
