import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter.
// NOTE: In a serverless environment (Vercel/Railway), memory is not shared across instances.
// This provides basic protection against rapid spam on a single instance.
// For true distributed rate limiting, an external store like Redis (Upstash) is recommended.

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimiter = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  limit: number; // max requests
  windowMs: number; // time window in milliseconds
}

export function checkRateLimit(ip: string, options: RateLimitOptions): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  let store = rateLimiter.get(ip);

  if (!store || now > store.resetTime) {
    store = { count: 0, resetTime: now + options.windowMs };
  }

  store.count += 1;
  rateLimiter.set(ip, store);

  const remaining = Math.max(0, options.limit - store.count);

  return {
    success: store.count <= options.limit,
    limit: options.limit,
    remaining,
    reset: store.resetTime,
  };
}

export function withRateLimit(request: NextRequest, options: RateLimitOptions) {
  // Try to get IP from headers (works for most reverse proxies/CDNs)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
             request.headers.get("x-real-ip") || 
             "anonymous";

  const { success, limit, remaining, reset } = checkRateLimit(ip, options);

  if (!success) {
    return NextResponse.json(
      { error: "Too Many Requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        }
      }
    );
  }

  return null; // indicates success, proceed with request
}
