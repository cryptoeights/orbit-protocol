import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { env } from "./config.js";
import { redis } from "./cache/redis.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import agentRoutes from "./routes/agents.js";
import agentcardRoutes from "./routes/agentcard.js";
import verificationRoutes from "./routes/verification.js";
import reputationRoutes from "./routes/reputation.js";
import passportRoutes from "./routes/passport.js";
import walletRoutes from "./routes/wallets.js";
import trustRoutes from "./routes/trust.js";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("/api/*", cors());
app.use("/api/*", rateLimit());

// Error handler
app.onError(errorHandler);

// Routes
// AgentCard validation must be before agents to avoid /:wallet matching "validate-card"
app.route("/api/agents", agentcardRoutes);
app.route("/api/agents", reputationRoutes);
app.route("/api/agents", passportRoutes);
app.route("/api/agents", walletRoutes);
app.route("/api/agents", agentRoutes);
app.route("/api/verify", verificationRoutes);
app.route("/api/trust", trustRoutes);

// Health check
app.get("/health", async (c) => {
  const checks: Record<string, string> = {};

  // DB check
  try {
    const { client } = await import("./db/index.js");
    const result = await client`SELECT 1 as ok`;
    checks.database = result.length > 0 ? "ok" : "error: empty result";
  } catch (e: any) {
    checks.database = `error: ${e.message}`;
  }

  // Redis check
  try {
    await redis.connect().catch(() => {});
    await redis.ping();
    checks.redis = "ok";
  } catch (e: any) {
    checks.redis = `error: ${e.message}`;
  }

  checks.stellar_rpc = env.STELLAR_RPC_URL;
  checks.network = env.STELLAR_NETWORK;

  const healthy = checks.database === "ok" && checks.redis === "ok";

  return c.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      contracts: {
        agent_registry: env.AGENT_REGISTRY_CONTRACT_ID,
        verification: env.VERIFICATION_CONTRACT_ID,
        reputation: env.REPUTATION_CONTRACT_ID,
        passport: env.PASSPORT_CONTRACT_ID,
        multi_wallet: env.MULTI_WALLET_CONTRACT_ID,
      },
    },
    healthy ? 200 : 503
  );
});

// Start server
const port = env.PORT;
console.log(`[orbit-api] starting on port ${port}...`);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[orbit-api] listening on http://localhost:${info.port}`);
});

export default app;
export { app };
