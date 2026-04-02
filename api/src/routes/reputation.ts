import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { getReputation } from "../stellar/client.js";

const reputation = new Hono();

/**
 * GET /api/agents/:wallet/reputation
 * Get reputation data for an agent.
 */
reputation.get("/:wallet/reputation", async (c) => {
  const wallet = c.req.param("wallet");

  // Get agent_id from DB cache.
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.wallet, wallet),
  });

  if (!agent) {
    return c.json(
      { error: "not_found", message: "Agent not found" },
      404
    );
  }

  // Fetch fresh reputation from chain.
  try {
    const rep = await getReputation(agent.agentId);
    return c.json({
      wallet,
      agent_id: agent.agentId,
      score: rep?.score ?? 0,
      total_interactions: rep?.total_interactions ?? 0,
      positive_count: rep?.positive_count ?? 0,
      negative_count: rep?.negative_count ?? 0,
      last_feedback_at: rep?.last_feedback_at ?? 0,
    });
  } catch (e: any) {
    // Fallback to cached data.
    return c.json({
      wallet,
      agent_id: agent.agentId,
      score: agent.reputationScore,
      total_interactions: agent.totalInteractions,
      _source: "cache",
    });
  }
});

export default reputation;
