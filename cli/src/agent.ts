import { Keypair, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { buildAndSubmit, toAddress, toU64 } from "./stellar.js";
import { cfg } from "./config.js";

/** Verification tiers supported by the Verification contract. */
export type VerificationTier = "basic" | "premium";

/** Contract IDs the agent talks to (testnet defaults come from env config). */
export interface ContractOverrides {
  agentRegistry?: string;
  verification?: string;
  reputation?: string;
}

export interface ORBITAgentOptions {
  /** Base URL of the ORBIT directory API. Defaults to the env/config value. */
  apiUrl?: string;
  /** Override on-chain contract IDs (defaults come from env config). */
  contracts?: ContractOverrides;
}

/** A freshly generated Stellar keypair. */
export interface GeneratedWallet {
  publicKey: string;
  secretKey: string;
}

/** Agent record as returned by the directory API. */
export interface AgentRecord {
  agent_id: number;
  wallet: string;
  name: string;
  status: string;
  verified: boolean;
  verification_tier?: string;
  reputation_score: number;
  total_interactions: number;
  has_passport: boolean;
  passport_id?: number;
  metadata_uri?: string;
  [key: string]: unknown;
}

export interface ReputationRecord {
  score: number;
  total_interactions: number;
  positive_count?: number;
  negative_count?: number;
  last_feedback_at?: number;
  [key: string]: unknown;
}

export interface RegisterParams {
  /** Stellar secret key (S...) of the agent's wallet. */
  secret: string;
  name: string;
  description?: string;
  metadataUri?: string;
}

export interface RegisterResult {
  wallet: string;
  result: unknown;
}

export interface VerifyParams {
  secret: string;
  tier?: VerificationTier;
}

export interface VerifyResult {
  wallet: string;
  agentId: number;
  tier: VerificationTier;
}

/**
 * ORBITAgent — programmatic SDK for the ORBIT identity protocol on Stellar.
 *
 * Read operations (`lookup`, `reputation`) hit the directory API at `apiUrl`.
 * Write operations (`register`, `verify`) build and submit Soroban transactions
 * using the network configuration from the environment (STELLAR_RPC_URL,
 * STELLAR_NETWORK_PASSPHRASE) and the contract IDs from env or `options.contracts`.
 *
 * @example
 * ```ts
 * const orbit = new ORBITAgent({ apiUrl: "https://api.orbitprotocol.dev" });
 * const agent = await orbit.lookup("GABC...");
 * ```
 */
export class ORBITAgent {
  private readonly apiUrl: string;
  private readonly contracts: Required<ContractOverrides>;

  constructor(options: ORBITAgentOptions = {}) {
    this.apiUrl = (options.apiUrl ?? cfg.apiUrl).replace(/\/+$/, "");
    this.contracts = {
      agentRegistry: options.contracts?.agentRegistry ?? cfg.agentRegistryId,
      verification: options.contracts?.verification ?? cfg.verificationId,
      reputation: options.contracts?.reputation ?? cfg.reputationId,
    };
  }

  /** Generate a new Stellar keypair (does not fund or persist it). */
  static generateWallet(): GeneratedWallet {
    const kp = Keypair.random();
    return { publicKey: kp.publicKey(), secretKey: kp.secret() };
  }

  /** Look up an agent's directory record by wallet address. */
  async lookup(wallet: string): Promise<AgentRecord> {
    return this.apiGet<AgentRecord>(`/api/agents/${wallet}`);
  }

  /** Fetch an agent's reputation summary by wallet address. */
  async reputation(wallet: string): Promise<ReputationRecord> {
    return this.apiGet<ReputationRecord>(`/api/agents/${wallet}/reputation`);
  }

  /** Register a new agent identity on-chain, then sync the API cache. */
  async register(params: RegisterParams): Promise<RegisterResult> {
    const keypair = Keypair.fromSecret(params.secret);
    const wallet = keypair.publicKey();

    const result = await buildAndSubmit(
      this.requireContract("agentRegistry"),
      "register_agent",
      [
        toAddress(wallet),
        nativeToScVal(params.name, { type: "string" }),
        nativeToScVal(params.description ?? "", { type: "string" }),
        nativeToScVal(params.metadataUri ?? "", { type: "string" }),
      ],
      keypair
    );

    // Best-effort API cache sync; on-chain registration already succeeded.
    try {
      await this.apiPost(`/api/agents/sync/${wallet}`);
    } catch {
      // Directory may be offline; the on-chain record is the source of truth.
    }

    return { wallet, result };
  }

  /** Verify an already-registered agent (pays the tier fee in XLM). */
  async verify(params: VerifyParams): Promise<VerifyResult> {
    const tier: VerificationTier = params.tier ?? "basic";
    const keypair = Keypair.fromSecret(params.secret);
    const wallet = keypair.publicKey();

    const agent = await this.lookup(wallet);
    if (!agent || typeof agent.agent_id !== "number") {
      throw new Error("Agent not found. Register the agent before verifying.");
    }

    const tierVal = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol(tier === "premium" ? "Premium" : "Basic"),
    ]);

    await buildAndSubmit(
      this.requireContract("verification"),
      "verify_agent",
      [toU64(agent.agent_id), toAddress(wallet), tierVal],
      keypair
    );

    return { wallet, agentId: agent.agent_id, tier };
  }

  // ── internals ──

  private requireContract(key: keyof ContractOverrides): string {
    const id = this.contracts[key];
    if (!id) {
      throw new Error(
        `Missing contract ID for "${key}". Set it via options.contracts or environment config.`
      );
    }
    return id;
  }

  private async apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`);
    if (!res.ok) {
      throw new Error(await errorMessage(res));
    }
    return (await res.json()) as T;
  }

  private async apiPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(await errorMessage(res));
    }
    return (await res.json()) as T;
  }
}

async function errorMessage(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };
  return (
    data.message || data.error || `API error: ${res.status} ${res.statusText}`
  );
}
