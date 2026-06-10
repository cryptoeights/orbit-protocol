/**
 * ORBIT Protocol SDK — programmatic entry point.
 *
 * This module has NO side effects: importing it never runs the CLI. The CLI
 * lives in `index.ts` and is exposed via the `orbit` bin.
 */

export const VERSION = "0.1.0";

export {
  ORBITAgent,
  type ORBITAgentOptions,
  type ContractOverrides,
  type VerificationTier,
  type GeneratedWallet,
  type AgentRecord,
  type ReputationRecord,
  type RegisterParams,
  type RegisterResult,
  type VerifyParams,
  type VerifyResult,
} from "./agent.js";

export {
  AGENTCARD_VERSION,
  MAX_CARD_SIZE,
  validateAgentCard,
  type AgentCard,
  type AgentCardEndpoints,
  type AgentCardPrice,
  type AgentCardSocial,
  type Currency,
  type ValidationResult,
} from "./agentcard.js";

// Low-level Soroban helpers, for advanced consumers.
export {
  buildAndSubmit,
  toScVal,
  toAddress,
  toU64,
  toI128,
} from "./stellar.js";
