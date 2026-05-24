import Redis from "ioredis";

// Centralized Redis client for rate limiting
// It connects only if REDIS_URL is provided, allowing fallback to in-memory locally.
export const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

if (redis) {
  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
  });
}
