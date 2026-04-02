import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { getLinkedWallets, getAuthority } from "../stellar/client.js";

const wallets = new Hono();

/**
 * GET /api/agents/:wallet/wallets
 * Get linked wallets for an agent.
 */
wallets.get("/:wallet/wallets", async (c) => {
  const wallet = c.req.param("wallet");

  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.wallet, wallet),
  });

  if (!agent) {
    return c.json({ error: "not_found", message: "Agent not found" }, 404);
  }

  try {
    const [linked, authority] = await Promise.all([
      getLinkedWallets(agent.agentId),
      getAuthority(agent.agentId),
    ]);

    return c.json({
      wallet,
      agent_id: agent.agentId,
      authority: authority,
      linked_wallets: linked.map((addr: string) => ({
        address: addr,
        is_authority: addr === authority,
      })),
      total: linked.length,
    });
  } catch {
    return c.json({
      wallet,
      agent_id: agent.agentId,
      linked_wallets: [],
      total: 0,
      _source: "error",
    });
  }
});

export default wallets;
