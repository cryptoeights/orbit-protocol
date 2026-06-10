"use client";

/**
 * Browser-side Soroban helpers for ORBIT — register an agent on-chain by
 * signing the `register_agent` invocation with the Freighter wallet extension.
 * Mirrors the CLI flow (cli/src/stellar.ts) but the signature comes from
 * Freighter instead of a local keypair — non-custodial, no key in the browser.
 */
import {
  Account,
  Address,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction,
} from "@stellar/freighter-api";

const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org:443";
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";
const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
const AGENT_REGISTRY = process.env.NEXT_PUBLIC_AGENT_REGISTRY_CONTRACT_ID || "";
const REPUTATION_CONTRACT = process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ID || "";
const VERIFICATION_CONTRACT = process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_ID || "";

function getServer() {
  return new rpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith("http://") });
}

function unwrap<T extends Record<string, unknown>>(res: T): T {
  if (res && typeof res === "object" && "error" in res && (res as any).error) {
    throw new Error(String((res as any).error));
  }
  return res;
}

/** True if the Freighter extension is present in this browser. */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await isConnected();
    return Boolean((res as any)?.isConnected);
  } catch {
    return false;
  }
}

/**
 * Freighter has no programmatic "revoke access", so disconnect is a local
 * preference: a flag that stops the silent session restore on page load.
 * Connecting again clears it. (Full revoke: Freighter → Settings → Connected apps.)
 */
const DISCONNECT_FLAG = "orbit:wallet-disconnected";

export function disconnectWallet(): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DISCONNECT_FLAG, "1");
  }
}

/**
 * Silently restore an existing Freighter authorization (no popup).
 * Returns the address if the site is already allowed, else null.
 */
export async function getConnectedAddress(): Promise<string | null> {
  try {
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem(DISCONNECT_FLAG)
    ) {
      return null;
    }
    const res = await isConnected();
    if (!(res as any)?.isConnected) return null;
    const got = await getAddress();
    const addr = (got as any)?.address as string | undefined;
    return addr && addr.length > 0 ? addr : null;
  } catch {
    return null;
  }
}

/** Prompt Freighter for access and return the connected public key. */
export async function connectWallet(): Promise<string> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DISCONNECT_FLAG);
  }
  const access = unwrap(await requestAccess());
  if ((access as any).address) return (access as any).address;
  const got = unwrap(await getAddress());
  return (got as any).address as string;
}

/** Check Freighter is pointed at the network ORBIT expects (testnet). */
export async function checkNetwork(): Promise<{ ok: boolean; network: string }> {
  const details = unwrap(await getNetworkDetails());
  const passphrase = (details as any).networkPassphrase as string;
  return {
    ok: passphrase === NETWORK_PASSPHRASE,
    network: (details as any).network || "unknown",
  };
}

export interface RegisterResult {
  hash: string;
  address: string;
}

export interface OnChainAgent {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: number;
  active: boolean;
}

/**
 * Read-only contract call via transaction simulation — free, nothing is
 * submitted, and the source account is a placeholder (the zero account),
 * so no funded wallet is needed. Returns null on any error.
 */
const ZERO_ACCOUNT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

async function simRead(
  contractId: string,
  method: string,
  args: import("@stellar/stellar-sdk").xdr.ScVal[]
): Promise<unknown | null> {
  try {
    const server = getServer();
    const contract = new Contract(contractId);
    const tx = new TransactionBuilder(new Account(ZERO_ACCOUNT, "0"), {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();
    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) return null;
    const retval = (sim as rpc.Api.SimulateTransactionSuccessResponse).result?.retval;
    if (!retval) return null;
    return scValToNative(retval);
  } catch {
    return null;
  }
}

function mapOnChainAgent(data: Record<string, unknown>): OnChainAgent {
  const status = data.status;
  const statusName = Array.isArray(status) ? String(status[0]) : String(status ?? "");
  return {
    id: String(data.id ?? ""),
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    owner: String(data.owner ?? ""),
    createdAt: Number(data.created_at ?? 0),
    active: statusName === "Active",
  };
}

/**
 * Read-only lookup: does this wallet already own an agent? Returns null
 * when not registered.
 */
export async function getAgentByWallet(address: string): Promise<OnChainAgent | null> {
  if (!AGENT_REGISTRY) return null;
  const data = await simRead(AGENT_REGISTRY, "get_agent_by_wallet", [
    new Address(address).toScVal(),
  ]);
  if (!data) return null;
  return mapOnChainAgent(data as Record<string, unknown>);
}

/** Total number of agents ever registered (ids are sequential from 1). */
export async function getAgentCount(): Promise<number> {
  if (!AGENT_REGISTRY) return 0;
  const v = await simRead(AGENT_REGISTRY, "agent_count", []);
  return v == null ? 0 : Number(v);
}

/** Verification status lives in its own contract — read it per agent. */
export async function isVerifiedOnChain(agentId: string | number): Promise<boolean> {
  if (!VERIFICATION_CONTRACT) return false;
  const v = await simRead(VERIFICATION_CONTRACT, "is_verified", [
    nativeToScVal(BigInt(agentId), { type: "u64" }),
  ]);
  return v === true;
}

/**
 * List the most recent agents straight from the registry contract —
 * newest first, capped at `limit`. Reputation is fetched per agent.
 * This is the no-API fallback for the directory page.
 */
export async function listAgentsOnChain(limit = 12): Promise<
  (OnChainAgent & { reputation: OnChainReputation | null; verified: boolean })[]
> {
  const count = await getAgentCount();
  if (count === 0) return [];
  const ids = Array.from(
    { length: Math.min(limit, count) },
    (_, i) => count - i
  );

  // Modest chunking so we don't hammer the public RPC with parallel sims.
  const results: (OnChainAgent & {
    reputation: OnChainReputation | null;
    verified: boolean;
  })[] = [];
  const CHUNK = 6;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const agents = await Promise.all(
      chunk.map(async (id) => {
        const data = await simRead(AGENT_REGISTRY, "get_agent", [
          nativeToScVal(BigInt(id), { type: "u64" }),
        ]);
        if (!data) return null;
        const agent = mapOnChainAgent(data as Record<string, unknown>);
        const [reputation, verified] = await Promise.all([
          getReputationOnChain(agent.id),
          isVerifiedOnChain(agent.id),
        ]);
        return { ...agent, reputation, verified };
      })
    );
    results.push(...agents.filter((a): a is NonNullable<typeof a> => a !== null));
  }
  return results.filter((a) => a.active);
}

/**
 * Error codes are per-contract (the same number means different things in
 * different contracts), so each contract gets its own message map.
 */
function friendlyRegistryError(message: string): string {
  if (message.includes("Error(Contract, #1)")) {
    return "This wallet already has a registered agent — one wallet can only own one agent.";
  }
  if (message.includes("Error(Contract, #3)")) {
    return "Invalid input — name must be 3–64 characters.";
  }
  return message;
}

function friendlyReputationError(message: string): string {
  if (message.includes("Error(Contract, #3)")) {
    return "Cooldown active — you can only rate this agent once every 24 hours.";
  }
  if (message.includes("Error(Contract, #4)")) {
    return "Your wallet's XLM balance is below the anti-spam minimum (10 XLM).";
  }
  if (message.includes("Error(Contract, #5)")) {
    return "You can't submit feedback on your own agent.";
  }
  return message;
}

/**
 * Shared write path: build → simulate → assemble → Freighter-sign → submit →
 * poll. Throws with a readable message (mapped via `mapError`) on any failure.
 */
async function invokeViaFreighter(
  contractId: string,
  method: string,
  args: import("@stellar/stellar-sdk").xdr.ScVal[],
  address: string,
  mapError: (msg: string) => string
): Promise<string> {
  const server = getServer();
  const contract = new Contract(contractId);

  const accountResponse = await server.getAccount(address);
  const account = new Account(address, accountResponse.sequenceNumber());

  const tx = new TransactionBuilder(account, {
    fee: "1000000", // 0.1 XLM max — generous for testnet
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(120)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(mapError((sim as any).error || "Simulation failed"));
  }
  const assembled = rpc.assembleTransaction(tx, sim).build();

  const signed = unwrap(
    await signTransaction(assembled.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      address,
    }) as Record<string, unknown>
  );
  const signedXdr =
    typeof signed === "string" ? signed : ((signed as any).signedTxXdr as string);
  if (!signedXdr) throw new Error("Freighter did not return a signed transaction");

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendRes = await server.sendTransaction(signedTx as any);
  if (sendRes.status === "ERROR") {
    throw new Error("Network rejected the transaction submission");
  }

  const hash = sendRes.hash;
  let result = await server.getTransaction(hash);
  for (let i = 0; i < 30 && result.status === "NOT_FOUND"; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    result = await server.getTransaction(hash);
  }
  if (result.status !== "SUCCESS") {
    throw new Error(`Transaction did not confirm (status: ${result.status})`);
  }
  return hash;
}

/** Register an agent on-chain — Freighter signs `register_agent`. */
export async function registerAgent(params: {
  name: string;
  description?: string;
  metadataUri?: string;
}): Promise<RegisterResult> {
  if (!AGENT_REGISTRY) {
    throw new Error(
      "Registry contract not configured — set NEXT_PUBLIC_AGENT_REGISTRY_CONTRACT_ID"
    );
  }
  const address = await connectWallet();
  const hash = await invokeViaFreighter(
    AGENT_REGISTRY,
    "register_agent",
    [
      new Address(address).toScVal(),
      nativeToScVal(params.name, { type: "string" }),
      nativeToScVal(params.description ?? "", { type: "string" }),
      nativeToScVal(params.metadataUri ?? "", { type: "string" }),
    ],
    address,
    friendlyRegistryError
  );
  return { hash, address };
}

export interface OnChainReputation {
  agentId: string;
  score: number;
  positiveCount: number;
  negativeCount: number;
  totalInteractions: number;
  lastFeedbackAt: number;
}

/**
 * Read an agent's reputation straight from the reputation contract
 * (free zero-account simulation — no funded wallet needed).
 */
export async function getReputationOnChain(
  agentId: string | number
): Promise<OnChainReputation | null> {
  if (!REPUTATION_CONTRACT) return null;
  const data = await simRead(REPUTATION_CONTRACT, "get_reputation", [
    nativeToScVal(BigInt(agentId), { type: "u64" }),
  ]);
  if (!data) return null;
  const d = data as Record<string, unknown>;
  return {
    agentId: String(d.agent_id ?? agentId),
    score: Number(d.score ?? 0),
    positiveCount: Number(d.positive_count ?? 0),
    negativeCount: Number(d.negative_count ?? 0),
    totalInteractions: Number(d.total_interactions ?? 0),
    lastFeedbackAt: Number(d.last_feedback_at ?? 0),
  };
}

/**
 * Submit 👍/👎 feedback on an agent — Freighter signs `submit_feedback`.
 * Contract enforces: min 10 XLM balance, 24h cooldown per pair, no
 * self-feedback. Verified submitters count 2×.
 */
export async function submitFeedback(params: {
  agentId: string | number;
  positive: boolean;
  context?: string;
}): Promise<RegisterResult> {
  if (!REPUTATION_CONTRACT) {
    throw new Error(
      "Reputation contract not configured — set NEXT_PUBLIC_REPUTATION_CONTRACT_ID"
    );
  }
  const address = await connectWallet();
  const hash = await invokeViaFreighter(
    REPUTATION_CONTRACT,
    "submit_feedback",
    [
      new Address(address).toScVal(),
      nativeToScVal(BigInt(params.agentId), { type: "u64" }),
      nativeToScVal(params.positive, { type: "bool" }),
      nativeToScVal(params.context ?? "", { type: "string" }),
    ],
    address,
    friendlyReputationError
  );
  return { hash, address };
}

export function explorerTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/${NETWORK}/tx/${hash}`;
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}
