import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.testnet from project root (dev). Falls back silently to process
// env when the file is absent (e.g. the published package). `quiet` suppresses
// dotenv's startup banner so it doesn't pollute CLI output.
config({ path: resolve(__dirname, "../../.env.testnet"), quiet: true });

// Deployed testnet contract IDs. These are public addresses (no secrets), baked
// in as defaults so the published npm package works out-of-the-box without an
// .env file. Any value can still be overridden via the matching env var.
const TESTNET_DEFAULTS = {
  agentRegistryId: "CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF",
  verificationId: "CAVCJ2UMXMYMAJN7YNQ4RNBQ4SXFCV36QRGZWSHXVEK2CX7UG42LEVN5",
  reputationId: "CAS4TMQYODZGN3OL2LC4KNLESHTDP6V5DY2ZEVZRBBQQXDUX665AQOFM",
  passportId: "CBD4LGX2FCZO7G2MOD6DWURS3RMVIQR3WYAK3RRWYOU5M2U7TF27VT3B",
  multiWalletId: "CAXKMS46TYZH5HENW7BSUT3VQ3SP4CA7BNIRQHH6NFSI62Q4KTXPPHY3",
  xlmSacId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
} as const;

export const cfg = {
  apiUrl: process.env.ORBIT_API_URL || "https://api.orbitprotocol.dev",

  // Stellar
  rpcUrl:
    process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org:443",
  networkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
  network: process.env.STELLAR_NETWORK || "testnet",

  // Contract IDs (env override → baked-in testnet default)
  agentRegistryId:
    process.env.AGENT_REGISTRY_CONTRACT_ID || TESTNET_DEFAULTS.agentRegistryId,
  verificationId:
    process.env.VERIFICATION_CONTRACT_ID || TESTNET_DEFAULTS.verificationId,
  reputationId:
    process.env.REPUTATION_CONTRACT_ID || TESTNET_DEFAULTS.reputationId,
  passportId: process.env.PASSPORT_CONTRACT_ID || TESTNET_DEFAULTS.passportId,
  multiWalletId:
    process.env.MULTI_WALLET_CONTRACT_ID || TESTNET_DEFAULTS.multiWalletId,

  // XLM SAC
  xlmSacId: process.env.XLM_SAC_CONTRACT_ID || TESTNET_DEFAULTS.xlmSacId,
} as const;
