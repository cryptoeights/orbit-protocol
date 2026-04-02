import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { redis } from "../cache/redis.js";
import {
  calculateTrustScore,
  generateRecommendations,
  type TrustResult,
} from "../engine/trust.js";
import { getReputation } from "../stellar/client.js";

const trust = new Hono();

const CACHE_TTL_SECONDS = 300; // 5 minutes
const CACHE_PREFIX = "trust:";

/**
 * GET /api/trust/:wallet
 * Quick trust check — <50ms on Redis cache hit.
 */
trust.get("/:wallet", async (c) => {
  const wallet = c.req.param("wallet");
  const start = Date.now();

  // Check Redis cache first.
  try {
    await redis.connect().catch(() => {});
    const cached = await redis.get(`${CACHE_PREFIX}${wallet}`);
    if (cached) {
      const result = JSON.parse(cached);
      return c.json({
        ...result,
        _cache: "hit",
        _response_ms: Date.now() - start,
      });
    }
  } catch {
    // Redis unavailable — fall through to compute.
  }

  // Cache miss — compute.
  const result = await computeTrust(wallet);

  if (!result) {
    return c.json({
      wallet,
      trust_tier: "unknown",
      trust_score: 0,
      registered: false,
      _cache: "miss",
      _response_ms: Date.now() - start,
    });
  }

  // Cache in Redis.
  try {
    await redis.setex(
      `${CACHE_PREFIX}${wallet}`,
      CACHE_TTL_SECONDS,
      JSON.stringify({ wallet, ...result })
    );
  } catch {
    // Cache write failed — non-fatal.
  }

  return c.json({
    wallet,
    ...result,
    _cache: "miss",
    _response_ms: Date.now() - start,
  });
});

/**
 * GET /api/trust/:wallet/details
 * Detailed trust breakdown with recommendations.
 */
trust.get("/:wallet/details", async (c) => {
  const wallet = c.req.param("wallet");
  const start = Date.now();

  const result = await computeTrust(wallet);

  if (!result) {
    return c.json({
      wallet,
      trust_tier: "unknown",
      trust_score: 0,
      registered: false,
      factors: {},
      recommendations: ["Register an agent to start building trust"],
      _response_ms: Date.now() - start,
    });
  }

  const recommendations = generateRecommendations(result.factors);

  return c.json({
    wallet,
    ...result,
    recommendations,
    _response_ms: Date.now() - start,
  });
});

/**
 * Compute trust score from DB + chain data.
 */
async function computeTrust(wallet: string): Promise<TrustResult | null> {
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.wallet, wallet),
  });

  if (!agent) return null;

  // Fetch reputation for activity signal (last_feedback_at).
  let lastFeedbackAt = 0;
  try {
    const rep = await getReputation(agent.agentId);
    lastFeedbackAt = rep?.last_feedback_at ?? 0;
  } catch {
    // Fallback: no activity signal.
  }

  return calculateTrustScore(
    {
      status: agent.status,
      verified: agent.verified,
      reputationScore: agent.reputationScore,
      hasPassport: agent.hasPassport,
    },
    lastFeedbackAt
  );
}

/**
 * Invalidate trust cache for a wallet.
 * Called from agents sync route.
 */
export async function invalidateTrustCache(wallet: string): Promise<void> {
  try {
    await redis.connect().catch(() => {});
    await redis.del(`${CACHE_PREFIX}${wallet}`);
  } catch {
    // Non-fatal.
  }
}

export default trust;
