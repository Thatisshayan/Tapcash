import { redis } from "./redis";

const DEFAULT_TTL = 60;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data as T | null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = DEFAULT_TTL): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch {
    // Silently fail — cache is non-critical
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // Silently fail
  }
}

export async function cacheWrap<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  await cacheSet(key, data, ttlSeconds);
  return data;
}

export function cacheKey(...parts: (string | number)[]): string {
  return `cache:${parts.join(":")}`;
}
