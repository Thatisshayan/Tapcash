import { NextRequest, NextResponse } from "next/server";
import { redis } from "./redis";

interface RateLimitStore {
  count: number;
  resetTime: number;
}
const fallbackRateLimiter = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export async function checkRateLimit(
  ip: string,
  options: RateLimitOptions
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();

  if (redis) {
    const key = `ratelimit:${ip}`;
    try {
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.pttl(key);
      const results = await pipeline.exec();

      const count = results[0] as number;
      let ttl = results[1] as number;

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
    }
  }

  // In-memory fallback (per function instance)
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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
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
        },
      }
    );
  }

  return null;
}
