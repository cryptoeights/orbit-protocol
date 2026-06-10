/**
 * AgentCard schema v1.0 — public type surface for the ORBIT SDK.
 *
 * This is a dependency-free mirror of the canonical schema defined in
 * `api/src/types/agentcard.ts` (per ARCHITECTURE.md §5.1). The API owns the
 * authoritative Zod schema used for runtime validation on ingest; the SDK
 * re-exports the lightweight TypeScript surface so consumers can type their
 * cards without pulling in the API package.
 */

/** AgentCard format version. */
export const AGENTCARD_VERSION = "1.0" as const;

/** Maximum serialized AgentCard size in bytes (10KB). */
export const MAX_CARD_SIZE = 10 * 1024;

/** Supported settlement currencies for priced capabilities. */
export type Currency = "USDC" | "XLM";

export interface AgentCardEndpoints {
  x402?: string;
  a2a?: string;
  webhook?: string;
  api?: string;
  websocket?: string;
}

export interface AgentCardPrice {
  amount: string;
  currency: Currency;
}

export interface AgentCardSocial {
  twitter?: string;
  website?: string;
  telegram?: string;
  discord?: string;
  github?: string;
}

/**
 * AgentCard v1.0. Mirrors the API Zod schema field-for-field.
 */
export interface AgentCard {
  // Required
  orbit_version: typeof AGENTCARD_VERSION;
  name: string;
  description: string;
  wallet: string;
  capabilities: string[];
  created_at: string;

  // Optional — Identity
  avatar?: string;
  tags?: string[];
  registries?: string[];

  // Optional — Connectivity
  protocols?: string[];
  endpoints?: AgentCardEndpoints;

  // Optional — Commercial
  pricing?: Record<string, AgentCardPrice>;

  // Optional — Social
  social?: AgentCardSocial;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Lightweight structural check for an AgentCard. This is NOT a substitute for
 * the authoritative server-side Zod validation — it covers the required-field
 * and size constraints so callers can fail fast before submitting a card.
 */
export function validateAgentCard(card: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof card !== "object" || card === null) {
    return { valid: false, errors: ["AgentCard must be an object"] };
  }

  const c = card as Record<string, unknown>;

  if (c.orbit_version !== AGENTCARD_VERSION) {
    errors.push(`orbit_version must be "${AGENTCARD_VERSION}"`);
  }
  if (typeof c.name !== "string" || c.name.length < 3 || c.name.length > 64) {
    errors.push("name must be a string of 3–64 characters");
  }
  if (typeof c.description !== "string" || c.description.length > 500) {
    errors.push("description must be a string of at most 500 characters");
  }
  if (typeof c.wallet !== "string" || c.wallet.length < 1) {
    errors.push("wallet must be a non-empty string");
  }
  if (
    !Array.isArray(c.capabilities) ||
    c.capabilities.length < 1 ||
    c.capabilities.length > 20
  ) {
    errors.push("capabilities must be an array of 1–20 items");
  }
  if (typeof c.created_at !== "string") {
    errors.push("created_at must be a string");
  }

  const size = byteLength(JSON.stringify(card));
  if (size > MAX_CARD_SIZE) {
    errors.push(`AgentCard exceeds ${MAX_CARD_SIZE} bytes (got ${size})`);
  }

  return { valid: errors.length === 0, errors };
}

function byteLength(s: string): number {
  // TextEncoder is available in Node 18+ and all modern runtimes.
  return new TextEncoder().encode(s).length;
}
