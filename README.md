# ORBIT Protocol

**Identity Infrastructure for AI Agents on Stellar**

ORBIT Protocol provides verifiable on-chain identity, reputation tracking, and soulbound passports for AI agents — built on Stellar blockchain using Soroban smart contracts.

> 🚀 **Live on Stellar Testnet** — 53 verified agents, 5 smart contracts deployed, full identity loop working end-to-end.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js)                   │
│   Landing Page · Agent Directory · Agent Profiles    │
├─────────────────────────────────────────────────────┤
│                    CLI TOOL                           │
│   orbit register · verify · lookup · passport mint   │
├─────────────────────────────────────────────────────┤
│                 REST API (Hono)                       │
│   PostgreSQL Cache · Redis Rate Limiting · Trust API  │
├─────────────────────────────────────────────────────┤
│              SMART CONTRACTS (Soroban)                │
│   AgentRegistry · Verification · Reputation          │
│   Passport (Soulbound) · MultiWallet                 │
├─────────────────────────────────────────────────────┤
│               STELLAR BLOCKCHAIN                     │
│            Testnet · Soroban Runtime                  │
└─────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
orbit-protocol/
├── contracts/          # 5 Soroban smart contracts (Rust)
│   └── contracts/
│       ├── agent-registry/    # Core identity registration
│       ├── verification/      # XLM fee-based verification
│       ├── reputation/        # On-chain feedback & scoring
│       ├── passport/          # Soulbound NFT passports
│       └── multi-wallet/      # Multi-wallet identity linking
├── api/                # Hono REST API server (TypeScript)
│   └── src/
│       ├── routes/            # API endpoints
│       ├── stellar/           # Soroban RPC client
│       ├── engine/            # Trust Tier Engine
│       └── db/                # PostgreSQL schema
├── cli/                # CLI tool (TypeScript)
│   └── src/
│       └── commands/          # register, verify, lookup, etc.
└── frontend/           # Next.js frontend (TypeScript)
    └── src/
        ├── app/               # Pages (landing, directory, profiles, docs)
        └── components/        # Navbar, Footer, AgentCard, etc.
```

---

## 🔧 Prerequisites

- **Rust** 1.84+ with `wasm32v1-none` target
- **Stellar CLI** v25+ (`stellar`)
- **Node.js** 20+ 
- **pnpm** 10+
- **Docker** (for PostgreSQL + Redis)

```bash
# Install Rust wasm target
rustup target add wasm32v1-none

# Install Stellar CLI
cargo install stellar-cli

# Verify setup
stellar --version    # v25.x
rustc --version      # 1.84+
node --version       # v20+
```

---

## 🚀 Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cryptoeights/orbit-protocol.git
cd orbit-protocol
```

### 2. Smart Contracts

```bash
cd contracts

# Build all 5 contracts
stellar contract build

# Run unit tests (73 tests)
cargo test

# Expected output:
# test result: ok. 20 passed (agent-registry)
# test result: ok. 12 passed (verification)
# test result: ok. 13 passed (reputation)
# test result: ok. 12 passed (passport)
# test result: ok. 16 passed (multi-wallet)
```

### 3. Deploy to Stellar Testnet

```bash
# Generate and fund a testnet account
stellar keys generate --global orbit-deployer
stellar keys fund orbit-deployer --network testnet

# Deploy AgentRegistry
stellar contract deploy \
  --wasm target/wasm32v1-none/release/agent_registry.wasm \
  --source orbit-deployer \
  --network testnet \
  --alias agent-registry

# Initialize
stellar contract invoke \
  --id agent-registry \
  --source orbit-deployer \
  --network testnet \
  -- initialize --admin orbit-deployer

# Deploy remaining contracts (verification, reputation, passport, multi-wallet)
# See contracts/scripts/deploy.sh for the full deployment script
```

### 4. API Server

```bash
cd api

# Install dependencies
pnpm install

# Start PostgreSQL + Redis via Docker
docker compose up -d

# Create database tables
docker exec api-postgres-1 psql -U orbit -d orbit_protocol -c "
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id BIGINT UNIQUE NOT NULL,
    wallet TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    metadata_uri TEXT,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_tier TEXT DEFAULT 'none' NOT NULL,
    reputation_score INTEGER DEFAULT 0 NOT NULL,
    total_interactions INTEGER DEFAULT 0 NOT NULL,
    has_passport BOOLEAN DEFAULT FALSE NOT NULL,
    passport_id BIGINT,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_cards (
    wallet TEXT PRIMARY KEY,
    card_json JSONB NOT NULL,
    validated BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS linked_wallets (
    agent_id BIGINT NOT NULL,
    wallet TEXT NOT NULL,
    is_authority BOOLEAN DEFAULT FALSE NOT NULL,
    linked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (agent_id, wallet)
);"

# Create .env file with your contract IDs
cat > .env << EOF
DATABASE_URL=postgres://orbit:orbit_dev@localhost:5433/orbit_protocol
REDIS_URL=redis://localhost:6379
STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
STELLAR_NETWORK=testnet
AGENT_REGISTRY_CONTRACT_ID=<your-agent-registry-id>
VERIFICATION_CONTRACT_ID=<your-verification-id>
REPUTATION_CONTRACT_ID=<your-reputation-id>
PASSPORT_CONTRACT_ID=<your-passport-id>
MULTI_WALLET_CONTRACT_ID=<your-multi-wallet-id>
EOF

# Start API server
pnpm dev
# → Listening on http://localhost:3001
```

### 5. CLI Tool

```bash
cd cli

# Install dependencies
pnpm install

# Generate a wallet and fund it
npx tsx src/index.ts wallet generate -o ./my-wallet.json --fund

# Register an agent
npx tsx src/index.ts register -k ./my-wallet.json -n "My Agent" -d "My first agent"

# Verify the agent (pays 10 XLM)
npx tsx src/index.ts verify -k ./my-wallet.json

# Mint a soulbound passport
npx tsx src/index.ts passport mint -k ./my-wallet.json

# Look up your agent
npx tsx src/index.ts lookup <YOUR_WALLET_ADDRESS>
```

### 6. Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env.local with your Privy App ID (for auth)
echo "NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>" > .env.local

# Start development server
pnpm dev
# → Running on http://localhost:3000
```

---

## 🌐 Testnet Deployment

All 5 smart contracts are deployed and operational on **Stellar Testnet**:

| Contract | Testnet Address | Functions |
|----------|----------------|-----------|
| AgentRegistry | `CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF` | register, update, deactivate, get_agent |
| Verification | `CAVCJ2UMXMYMAJN7YNQ4RNBQ4SXFCV36QRGZWSHXVEK2CX7UG42LEVN5` | verify_agent, is_verified, revoke |
| Reputation | `CAS4TMQYODZGN3OL2LC4KNLESHTDP6V5DY2ZEVZRBBQQXDUX665AQOFM` | submit_feedback, get_reputation |
| Passport | `CBD4LGX2FCZO7G2MOD6DWURS3RMVIQR3WYAK3RRWYOU5M2U7TF27VT3B` | mint_passport, has_passport |
| MultiWallet | `CAXKMS46TYZH5HENW7BSUT3VQ3SP4CA7BNIRQHH6NFSI62Q4KTXPPHY3` | link_wallet, transfer_authority |

**Frontend:** https://frontend-three-mu-32.vercel.app

### Verify on Testnet

```bash
# Check agent count
stellar contract invoke \
  --id CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF \
  --source orbit-deployer \
  --network testnet \
  -- agent_count
# → 53

# Look up an agent
stellar contract invoke \
  --id CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF \
  --source orbit-deployer \
  --network testnet \
  -- get_agent_by_wallet \
  --wallet GDQZEOCXWGOY2KI75PEJMIKCAVAJTBBDYIFLSIVXRQUANEGG4M2SY6NO
# → { "name": "ORBIT Test Agent", "verified": true, ... }

# View on Stellar Expert
open "https://stellar.expert/explorer/testnet/contract/CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF"
```

---

## ✨ Features

### Smart Contracts (Soroban/Rust)
- **AgentRegistry** — On-chain identity with name, description, metadata URI, status lifecycle
- **Verification** — XLM fee payment (10 XLM basic / 100 XLM premium) for verified badge
- **Reputation** — Aggregated feedback scoring (0-10000 basis points) with anti-spam rules
- **Passport** — Soulbound (non-transferable) identity proof, cross-contract verification check
- **MultiWallet** — Link up to 5 wallets with dual-auth, authority transfer for recovery

### REST API (Hono/TypeScript)
- Agent data cached in PostgreSQL with on-demand sync from Soroban contracts
- Trust Tier Engine with 6 scoring signals and Redis-cached <50ms quick check
- AgentCard JSON hosting with Zod schema validation
- Redis sliding-window rate limiting (100 req/min)
- 13 API endpoints covering all contract domains

### CLI Tool
- `orbit wallet generate` — Generate Stellar keypair with Friendbot funding
- `orbit register` — Register agent identity on-chain
- `orbit verify` — Pay XLM for verified badge
- `orbit passport mint` — Mint soulbound passport
- `orbit lookup` / `reputation` / `trust` — Query agent data

### Frontend (Next.js)
- Dark-themed landing page with feature showcase and pricing
- Agent directory with search, sort, and verified agent grid
- Agent profile pages with reputation analytics, trust breakdown, passport preview
- Documentation page with API reference, CLI reference, and SDK guide
- Privy authentication with email login

---

## 🏛️ Trust Tier Engine

Composite trust scoring from 6 signals:

| Signal | Points | Description |
|--------|--------|-------------|
| Registration | +1,000 | Agent exists and is active |
| Verification | +2,000 | Paid verification badge |
| Reputation | ×0.4 | Reputation score weighted (max +4,000) |
| Activity | +500 | Interaction within last 7 days |
| Passport | +500 | Soulbound passport minted |
| Registries | +200/each | Per verified external registry (max 5) |

**Tiers:** Unknown (0-999) → Registered (1,000-2,999) → Verified (3,000-6,999) → Trusted (7,000-8,999) → Elite (9,000-10,000)

---

## 🔑 Environment Configuration

All network-specific values are in environment variables — **no code changes needed for mainnet**:

```bash
# Testnet → Mainnet: change these values only
STELLAR_NETWORK=mainnet
STELLAR_RPC_URL=https://mainnet.sorobanrpc.com
STELLAR_NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
AGENT_REGISTRY_CONTRACT_ID=<mainnet-contract-id>
# ... redeploy contracts and update IDs
```

---

## 🧪 Testing

```bash
# Smart contract unit tests (73 tests)
cd contracts && cargo test

# API health check
curl http://localhost:3001/health

# Trust tier check
curl http://localhost:3001/api/trust/<WALLET_ADDRESS>

# Full CLI identity loop
cd cli
npx tsx src/index.ts wallet generate -o /tmp/test.json --fund
npx tsx src/index.ts register -k /tmp/test.json -n "Test Agent"
npx tsx src/index.ts verify -k /tmp/test.json
npx tsx src/index.ts passport mint -k /tmp/test.json
npx tsx src/index.ts lookup <WALLET>
```

---

## 📊 Stats

| Component | Metric |
|-----------|--------|
| Smart Contracts | 5 Soroban contracts, ~43KB WASM total |
| Unit Tests | 73 passing tests |
| API Endpoints | 13 REST endpoints |
| CLI Commands | 8 commands |
| Frontend Pages | 7 pages |
| Testnet Agents | 53 registered, all verified |
| Trust Response | <50ms (Redis cache hit) |

---

## 🛣️ Roadmap

- [x] **M001** — Core Identity & Infrastructure (testnet) ✅
- [ ] **M002** — Cross-chain Messaging, SDK, Webhooks, Multi-Registry
- [ ] **M003** — IPFS Integration, Security Audit, Mainnet Deployment

---

## 📄 License

MIT

---

**Built on Stellar. Powered by Soroban.**
