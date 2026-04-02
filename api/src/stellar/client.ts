import {
  Account,
  Contract,
  Keypair,
  Networks,
  rpc,
  TransactionBuilder,
  xdr,
  scValToNative,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { env } from "../config.js";

const server = new rpc.Server(env.STELLAR_RPC_URL);
const networkPassphrase = env.STELLAR_NETWORK_PASSPHRASE;

// A disposable keypair for simulating read-only calls (no real signing).
const simulationKeypair = Keypair.random();

/**
 * Recursively convert BigInt values to number (safe for values < 2^53)
 * or string (for larger values like i128).
 */
function convertBigInts(obj: any): any {
  if (typeof obj === "bigint") {
    return Number.isSafeInteger(Number(obj)) ? Number(obj) : obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigInts);
  }
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBigInts(value);
    }
    return result;
  }
  return obj;
}

/**
 * Simulate a read-only contract call. No transaction is submitted.
 * Returns the parsed result value.
 */
async function simulateRead(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<any> {
  const contract = new Contract(contractId);

  // We need a valid source account for building the transaction,
  // but since we're only simulating, it doesn't need to exist on-chain.
  const sourcePublicKey = simulationKeypair.publicKey();

  // Build a minimal transaction for simulation.
  const account = new Account(sourcePublicKey, "0");
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(
      `Contract simulation failed: ${(sim as any).error || "unknown error"}`
    );
  }

  if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
    const raw = scValToNative(sim.result.retval);
    // Convert BigInt values to numbers for JSON serialization.
    return convertBigInts(raw);
  }

  return null;
}

// ── AgentRegistry reads ──

export async function getAgentByWallet(wallet: string) {
  try {
    const addr = new Address(wallet);
    return await simulateRead(
      env.AGENT_REGISTRY_CONTRACT_ID,
      "get_agent_by_wallet",
      [addr.toScVal()]
    );
  } catch (e: any) {
    if (e.message?.includes("NotFound") || e.message?.includes("Error(Contract, #2)")) {
      return null;
    }
    throw e;
  }
}

export async function getAgentCount(): Promise<number> {
  return await simulateRead(env.AGENT_REGISTRY_CONTRACT_ID, "agent_count");
}

// ── Verification reads ──

export async function isVerified(agentId: number): Promise<boolean> {
  return await simulateRead(
    env.VERIFICATION_CONTRACT_ID,
    "is_verified",
    [nativeToScVal(agentId, { type: "u64" })]
  );
}

export async function getVerification(agentId: number) {
  try {
    return await simulateRead(
      env.VERIFICATION_CONTRACT_ID,
      "get_verification",
      [nativeToScVal(agentId, { type: "u64" })]
    );
  } catch {
    return null;
  }
}

// ── Reputation reads ──

export async function getReputation(agentId: number) {
  return await simulateRead(
    env.REPUTATION_CONTRACT_ID,
    "get_reputation",
    [nativeToScVal(agentId, { type: "u64" })]
  );
}

// ── Passport reads ──

export async function hasPassport(agentId: number): Promise<boolean> {
  return await simulateRead(
    env.PASSPORT_CONTRACT_ID,
    "has_passport",
    [nativeToScVal(agentId, { type: "u64" })]
  );
}

export async function getPassport(agentId: number) {
  try {
    return await simulateRead(
      env.PASSPORT_CONTRACT_ID,
      "get_passport",
      [nativeToScVal(agentId, { type: "u64" })]
    );
  } catch {
    return null;
  }
}

// ── MultiWallet reads ──

export async function getLinkedWallets(agentId: number): Promise<string[]> {
  const result = await simulateRead(
    env.MULTI_WALLET_CONTRACT_ID,
    "get_linked_wallets",
    [nativeToScVal(agentId, { type: "u64" })]
  );
  return result || [];
}

export async function getAuthority(agentId: number): Promise<string | null> {
  try {
    return await simulateRead(
      env.MULTI_WALLET_CONTRACT_ID,
      "get_authority",
      [nativeToScVal(agentId, { type: "u64" })]
    );
  } catch {
    return null;
  }
}

/**
 * Parse a Soroban enum value that might come back as a number, string, or object key.
 */
function parseEnumValue(val: any, fallback: string): string {
  if (typeof val === "string") return val.toLowerCase();
  if (typeof val === "number") return fallback;
  if (Array.isArray(val) && val.length > 0) return String(val[0]).toLowerCase();
  if (val && typeof val === "object") {
    const keys = Object.keys(val);
    return keys.length > 0 ? keys[0].toLowerCase() : fallback;
  }
  return fallback;
}

/**
 * Fetch all on-chain data for an agent by wallet.
 * Returns a merged object suitable for caching in the agents table.
 */
export async function fetchFullAgentData(wallet: string) {
  const agent = await getAgentByWallet(wallet);
  if (!agent) return null;

  const agentId = typeof agent.id === "number" ? agent.id : Number(agent.id);

  // Parallel fetches for enrichment data.
  const [verified, reputation, passport, linkedWallets] = await Promise.all([
    isVerified(agentId).catch(() => false),
    getReputation(agentId).catch(() => null),
    hasPassport(agentId).catch(() => false),
    getLinkedWallets(agentId).catch(() => []),
  ]);

  let verificationDetail = null;
  if (verified) {
    verificationDetail = await getVerification(agentId).catch(() => null);
  }

  let passportDetail = null;
  if (passport) {
    passportDetail = await getPassport(agentId).catch(() => null);
  }

  return {
    agentId,
    wallet: typeof agent.owner === "string" ? agent.owner : wallet,
    name: agent.name,
    description: agent.description || "",
    metadataUri: agent.metadata_uri || "",
    status: parseEnumValue(agent.status, "active"),
    verified,
    verificationTier: verificationDetail?.tier
      ? parseEnumValue(verificationDetail.tier, "none")
      : "none",
    reputationScore: reputation?.score ?? 0,
    totalInteractions: reputation?.total_interactions ?? 0,
    hasPassport: !!passport,
    passportId: passportDetail?.id ?? null,
    linkedWallets,
    verification: verificationDetail,
    passport: passportDetail,
    reputation,
  };
}
