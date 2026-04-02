import { z } from "zod";

/**
 * AgentCard JSON schema per ARCHITECTURE.md section 5.1.
 * Max 10KB total size.
 */
export const AgentCardSchema = z.object({
  // Required fields
  orbit_version: z.literal("1.0"),
  name: z.string().min(3).max(64),
  description: z.string().max(500),
  wallet: z.string().min(1),
  capabilities: z.array(z.string()).min(1).max(20),
  created_at: z.string(),

  // Optional - Identity
  avatar: z.string().url().optional(),
  tags: z.array(z.string()).max(20).optional(),
  registries: z.array(z.string()).optional(),

  // Optional - Connectivity
  protocols: z.array(z.string()).optional(),
  endpoints: z
    .object({
      x402: z.string().url().optional(),
      a2a: z.string().url().optional(),
      webhook: z.string().url().optional(),
      api: z.string().url().optional(),
      websocket: z.string().url().optional(),
    })
    .optional(),

  // Optional - Commercial
  pricing: z
    .record(
      z.object({
        amount: z.string(),
        currency: z.enum(["USDC", "XLM"]),
      })
    )
    .optional(),

  // Optional - Social
  social: z
    .object({
      twitter: z.string().optional(),
      website: z.string().url().optional(),
      telegram: z.string().optional(),
      discord: z.string().optional(),
      github: z.string().optional(),
    })
    .optional(),
});

export type AgentCard = z.infer<typeof AgentCardSchema>;

/** Max AgentCard size in bytes. */
export const MAX_CARD_SIZE = 10 * 1024; // 10KB
