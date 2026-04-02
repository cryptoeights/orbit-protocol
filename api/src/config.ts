import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.testnet from project root, then .env from api/
config({ path: resolve(__dirname, "../../.env.testnet") });
config({ path: resolve(__dirname, "../.env") });

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgres://orbit:orbit_dev@localhost:5433/orbit_protocol",

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Stellar
  STELLAR_RPC_URL:
    process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org:443",
  STELLAR_NETWORK_PASSPHRASE:
    process.env.STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
  STELLAR_NETWORK: process.env.STELLAR_NETWORK || "testnet",

  // Contract IDs
  AGENT_REGISTRY_CONTRACT_ID:
    process.env.AGENT_REGISTRY_CONTRACT_ID || "",
  VERIFICATION_CONTRACT_ID:
    process.env.VERIFICATION_CONTRACT_ID || "",
  REPUTATION_CONTRACT_ID:
    process.env.REPUTATION_CONTRACT_ID || "",
  PASSPORT_CONTRACT_ID:
    process.env.PASSPORT_CONTRACT_ID || "",
  MULTI_WALLET_CONTRACT_ID:
    process.env.MULTI_WALLET_CONTRACT_ID || "",

  // Rate limiting
  RATE_LIMIT_GENERAL: parseInt(process.env.RATE_LIMIT_GENERAL || "100", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "60000",
    10
  ),
} as const;
