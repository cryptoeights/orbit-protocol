import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { getPassport } from "../stellar/client.js";

const passport = new Hono();

/**
 * GET /api/agents/:wallet/passport
 * Get passport data for an agent.
 */
passport.get("/:wallet/passport", async (c) => {
  const wallet = c.req.param("wallet");

  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.wallet, wallet),
  });

  if (!agent) {
    return c.json({ error: "not_found", message: "Agent not found" }, 404);
  }

  if (!agent.hasPassport) {
    return c.json({ has_passport: false, wallet });
  }

  try {
    const passportData = await getPassport(agent.agentId);
    return c.json({
      has_passport: true,
      wallet,
      passport_id: passportData?.id ?? agent.passportId,
      minted_at: passportData?.minted_at ?? null,
      metadata_uri: passportData?.metadata_uri ?? null,
      reputation_snapshot: passportData?.reputation_snapshot ?? 0,
      revoked: passportData?.revoked ?? false,
    });
  } catch {
    return c.json({
      has_passport: true,
      wallet,
      passport_id: agent.passportId,
      _source: "cache",
    });
  }
});

export default passport;
