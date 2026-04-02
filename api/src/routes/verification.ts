import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { isVerified, getVerification } from "../stellar/client.js";

const verification = new Hono();

/**
 * GET /api/verify/:wallet
 * Check verification status for a wallet.
 */
verification.get("/:wallet", async (c) => {
  const wallet = c.req.param("wallet");

  // Check DB cache first.
  const cached = await db.query.agents.findFirst({
    where: eq(schema.agents.wallet, wallet),
  });

  if (cached) {
    return c.json({
      wallet,
      registered: true,
      verified: cached.verified,
      verification_tier: cached.verificationTier,
      has_passport: cached.hasPassport,
      reputation_score: cached.reputationScore,
    });
  }

  return c.json(
    { error: "not_found", message: "Agent not found. Sync first via GET /api/agents/:wallet" },
    404
  );
});

export default verification;
