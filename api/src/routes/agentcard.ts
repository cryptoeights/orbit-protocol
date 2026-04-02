import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { AgentCardSchema, MAX_CARD_SIZE } from "../types/agentcard.js";

const agentcard = new Hono();

/**
 * POST /api/agents/validate-card
 * Validate an AgentCard JSON against the schema.
 */
agentcard.post("/validate-card", async (c) => {
  const body = await c.req.text();

  // Check size.
  if (Buffer.byteLength(body, "utf-8") > MAX_CARD_SIZE) {
    return c.json(
      {
        valid: false,
        error: "AgentCard exceeds maximum size of 10KB",
      },
      400
    );
  }

  let json: any;
  try {
    json = JSON.parse(body);
  } catch {
    return c.json({ valid: false, error: "Invalid JSON" }, 400);
  }

  const result = AgentCardSchema.safeParse(json);
  if (!result.success) {
    return c.json(
      {
        valid: false,
        errors: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400
    );
  }

  return c.json({ valid: true, warnings: [] });
});

/**
 * POST /api/agents/:wallet/card
 * Submit/update an AgentCard for a wallet.
 */
agentcard.post("/:wallet/card", async (c) => {
  const wallet = c.req.param("wallet");
  const body = await c.req.text();

  // Size check.
  if (Buffer.byteLength(body, "utf-8") > MAX_CARD_SIZE) {
    return c.json({ error: "AgentCard exceeds 10KB limit" }, 400);
  }

  let json: any;
  try {
    json = JSON.parse(body);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  // Validate.
  const result = AgentCardSchema.safeParse(json);
  if (!result.success) {
    return c.json(
      {
        error: "validation_failed",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400
    );
  }

  // Ensure wallet in card matches URL.
  if (json.wallet && json.wallet !== wallet) {
    return c.json(
      { error: "Wallet in AgentCard does not match URL wallet" },
      400
    );
  }

  // Upsert.
  const now = new Date();
  await db
    .insert(schema.agentCards)
    .values({
      wallet,
      cardJson: json,
      validated: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.agentCards.wallet,
      set: {
        cardJson: json,
        validated: true,
        updatedAt: now,
      },
    });

  return c.json({ stored: true, wallet }, 201);
});

/**
 * GET /api/agents/:wallet/card
 * Retrieve the stored AgentCard for a wallet.
 */
agentcard.get("/:wallet/card", async (c) => {
  const wallet = c.req.param("wallet");

  const card = await db.query.agentCards.findFirst({
    where: eq(schema.agentCards.wallet, wallet),
  });

  if (!card) {
    return c.json({ error: "not_found", message: "No AgentCard found" }, 404);
  }

  return c.json(card.cardJson);
});

export default agentcard;
