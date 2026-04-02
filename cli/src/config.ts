import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.testnet from project root
config({ path: resolve(__dirname, "../../.env.testnet") });

export const cfg = {
  apiUrl: process.env.ORBIT_API_URL || "http://localhost:3001",

  // Stellar
  rpcUrl:
    process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org:443",
  networkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
  network: process.env.STELLAR_NETWORK || "testnet",

  // Contract IDs
  agentRegistryId: process.env.AGENT_REGISTRY_CONTRACT_ID || "",
  verificationId: process.env.VERIFICATION_CONTRACT_ID || "",
  reputationId: process.env.REPUTATION_CONTRACT_ID || "",
  passportId: process.env.PASSPORT_CONTRACT_ID || "",
  multiWalletId: process.env.MULTI_WALLET_CONTRACT_ID || "",

  // XLM SAC
  xlmSacId: process.env.XLM_SAC_CONTRACT_ID || "",
} as const;
