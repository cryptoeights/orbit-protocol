import type { Context, Next } from "hono";
import { redis } from "../cache/redis.js";
import { env } from "../config.js";

/**
 * Redis-backed sliding window rate limiter.
 * Returns 429 when rate limit exceeded.
 */
export function rateLimit(
  maxRequests: number = env.RATE_LIMIT_GENERAL,
  windowMs: number = env.RATE_LIMIT_WINDOW_MS
) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const key = `ratelimit:${ip}`;

    try {
      await redis.connect().catch(() => {});
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      const ttl = await redis.pttl(key);

      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", String(Math.max(0, maxRequests - current)));
      c.header("X-RateLimit-Reset", String(Math.ceil((Date.now() + Math.max(0, ttl)) / 1000)));

      if (current > maxRequests) {
        return c.json(
          {
            error: "rate_limit_exceeded",
            message: `Rate limit of ${maxRequests} requests per ${windowMs / 1000}s exceeded`,
            retry_after: Math.ceil(Math.max(0, ttl) / 1000),
          },
          429
        );
      }
    } catch (e) {
      // If Redis is down, allow the request (fail-open).
      console.error("[rateLimit] Redis error, allowing request:", (e as Error).message);
    }

    await next();
  };
}
