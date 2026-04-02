import { Hono } from "hono";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { fetchFullAgentData } from "../stellar/client.js";
import { invalidateTrustCache } from "./trust.js";

const agents = new Hono();

// Cache TTL in milliseconds (5 minutes).
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Check if a cached agent record is still fresh.
 */
function isFresh(updatedAt: Date): boolean {
  return Date.now() - updatedAt.getTime() < CACHE_TTL_MS;
}

/**
 * GET /api/agents/:wallet
 * Get agent by wallet address. Cache-first with on-chain fallback.
 */
agents.get("/:wallet", async (c) => {
  const wallet = c.req.param("wallet");

  // Check DB cache first.
  const cached = await db.query.agents.findFirst({
    where: eq(schema.agents.wallet, wallet),
  });

  if (cached && isFresh(cached.updatedAt)) {
    return c.json({
      ...formatAgent(cached),
      _cache: "hit",
    });
  }

  // Cache miss or stale — fetch from chain.
  try {
    const onChain = await fetchFullAgentData(wallet);
    if (!onChain) {
      return c.json({ error: "not_found", message: "Agent not found" }, 404);
    }

    // Upsert into DB cache.
    const record = {
      agentId: onChain.agentId,
      wallet: wallet,
      name: onChain.name,
      description: onChain.description,
      metadataUri: onChain.metadataUri,
      verified: onChain.verified,
      verificationTier: onChain.verificationTier,
      reputationScore: onChain.reputationScore,
      totalInteractions: onChain.totalInteractions,
      hasPassport: onChain.hasPassport,
      passportId: onChain.passportId,
      status: onChain.status,
      updatedAt: new Date(),
    };

    await db
      .insert(schema.agents)
      .values({ ...record, createdAt: new Date() })
      .onConflictDoUpdate({
        target: schema.agents.wallet,
        set: record,
      });

    return c.json({
      ...formatAgent(record),
      linkedWallets: onChain.linkedWallets,
      verification: onChain.verification,
      passport: onChain.passport,
      reputation: onChain.reputation,
      _cache: "miss",
    });
  } catch (e: any) {
    console.error("[agents] fetch error:", e.message);
    // If chain fetch fails but we have stale cache, return it.
    if (cached) {
      return c.json({
        ...formatAgent(cached),
        _cache: "stale",
        _warning: "on-chain data unavailable, showing cached",
      });
    }
    return c.json(
      { error: "fetch_error", message: "Failed to fetch agent data" },
      502
    );
  }
});

/**
 * GET /api/agents
 * List agents with search, filter, sort, pagination.
 */
agents.get("/", async (c) => {
  const search = c.req.query("search");
  const verifiedOnly = c.req.query("verified") === "true";
  const sortBy = c.req.query("sort") || "newest";
  const cursor = c.req.query("cursor");
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 100);

  const conditions = [];

  if (verifiedOnly) {
    conditions.push(eq(schema.agents.verified, true));
  }
  if (search) {
    conditions.push(
      ilike(schema.agents.name, `%${search}%`)
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (sortBy) {
    case "reputation":
      orderBy = desc(schema.agents.reputationScore);
      break;
    case "newest":
    default:
      orderBy = desc(schema.agents.createdAt);
      break;
  }

  const results = await db.query.agents.findMany({
    where,
    orderBy: [orderBy],
    limit: limit + 1, // Fetch one extra for cursor detection.
  });

  const hasMore = results.length > limit;
  const page = hasMore ? results.slice(0, limit) : results;

  return c.json({
    agents: page.map(formatAgent),
    next_cursor: hasMore ? page[page.length - 1]?.id : null,
    total: page.length,
  });
});

/**
 * POST /api/agents/sync/:wallet
 * Force re-sync agent data from chain to DB.
 */
agents.post("/sync/:wallet", async (c) => {
  const wallet = c.req.param("wallet");

  const onChain = await fetchFullAgentData(wallet);
  if (!onChain) {
    return c.json({ error: "not_found", message: "Agent not found on chain" }, 404);
  }

  const record = {
    agentId: onChain.agentId,
    wallet,
    name: onChain.name,
    description: onChain.description,
    metadataUri: onChain.metadataUri,
    verified: onChain.verified,
    verificationTier: onChain.verificationTier,
    reputationScore: onChain.reputationScore,
    totalInteractions: onChain.totalInteractions,
    hasPassport: onChain.hasPassport,
    passportId: onChain.passportId,
    status: onChain.status,
    updatedAt: new Date(),
  };

  await db
    .insert(schema.agents)
    .values({ ...record, createdAt: new Date() })
    .onConflictDoUpdate({
      target: schema.agents.wallet,
      set: record,
    });

  // Invalidate trust cache after sync.
  await invalidateTrustCache(wallet);

  return c.json({ synced: true, wallet, agentId: onChain.agentId });
});

function formatAgent(a: any) {
  return {
    agent_id: a.agentId,
    wallet: a.wallet,
    name: a.name,
    description: a.description,
    metadata_uri: a.metadataUri,
    verified: a.verified,
    verification_tier: a.verificationTier,
    reputation_score: a.reputationScore,
    total_interactions: a.totalInteractions,
    has_passport: a.hasPassport,
    passport_id: a.passportId,
    status: a.status,
  };
}

export default agents;
