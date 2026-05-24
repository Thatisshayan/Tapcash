import { NextRequest, NextResponse } from "next/server";
import { redis } from "./redis";

// Fallback in-memory rate limiter if Redis is not configured
interface RateLimitStore {
  count: number;
  resetTime: number;
}
const fallbackRateLimiter = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  limit: number; // max requests
  windowMs: number; // time window in milliseconds
}

export async function checkRateLimit(ip: string, options: RateLimitOptions): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  
  if (redis) {
    const key = `ratelimit:${ip}`;
    try {
      const multi = redis.multi();
      multi.incr(key);
      multi.pttl(key);
      const results = await multi.exec();
      
      if (!results) throw new Error("Redis transaction failed");

      const count = results[0][1] as number;
      let ttl = results[1][1] as number;

      if (count === 1 || ttl === -1) {
        await redis.pexpire(key, options.windowMs);
        ttl = options.windowMs;
      }

      const remaining = Math.max(0, options.limit - count);
      
      return {
        success: count <= options.limit,
        limit: options.limit,
        remaining,
        reset: now + ttl,
      };
    } catch (err) {
      console.error("Redis rate limit error, falling back to memory:", err);
      // Fall through to memory logic if Redis fails
    }
  }

  // In-memory fallback logic
  let store = fallbackRateLimiter.get(ip);
  if (!store || now > store.resetTime) {
    store = { count: 0, resetTime: now + options.windowMs };
  }

  store.count += 1;
  fallbackRateLimiter.set(ip, store);

  const remaining = Math.max(0, options.limit - store.count);

  return {
    success: store.count <= options.limit,
    limit: options.limit,
    remaining,
    reset: store.resetTime,
  };
}

export async function withRateLimit(request: NextRequest, options: RateLimitOptions) {
  // Try to get IP from headers (works for most reverse proxies/CDNs)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
             request.headers.get("x-real-ip") || 
             "anonymous";

  const { success, limit, remaining, reset } = await checkRateLimit(ip, options);

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
