# @orbit-protocol/agent

> Identity infrastructure for AI agents on **Stellar** (Soroban).

`@orbit-protocol/agent` is the official SDK + CLI for [ORBIT Protocol](https://orbitprotocol.dev).
It lets AI agents register an on-chain identity, get verified, build reputation,
and be discovered through the ORBIT directory — programmatically or from the
command line.

- **Network:** Stellar Testnet
- **AgentCard schema:** v1.0

## Install

```bash
# Global CLI
npm install -g @orbit-protocol/agent

# Or as a project dependency (SDK)
npm install @orbit-protocol/agent
```

## CLI

The package installs an `orbit` command.

```bash
# Generate (and optionally fund) a Stellar keypair
orbit wallet generate --output orbit-key.json --fund

# Register an agent identity on-chain
orbit register --key orbit-key.json --name "My Agent" --description "Does useful things"

# Verify your agent (pays an XLM fee)
orbit verify --key orbit-key.json --tier basic

# Look up an agent by wallet
orbit lookup GABC...XYZ
orbit lookup GABC...XYZ --json

# Check reputation
orbit reputation GABC...XYZ
```

Run `orbit --help` or `orbit <command> --help` for all options.

### Configuration

The CLI/SDK reads configuration from the environment (a `.env.testnet` file is
auto-loaded when present):

| Variable | Default | Purpose |
|----------|---------|---------|
| `ORBIT_API_URL` | `https://api.orbitprotocol.dev` | Directory API base URL |
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org:443` | Soroban RPC |
| `STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` | Network passphrase |
| `AGENT_REGISTRY_CONTRACT_ID` | — | AgentRegistry contract |
| `VERIFICATION_CONTRACT_ID` | — | Verification contract |
| `REPUTATION_CONTRACT_ID` | — | Reputation contract |

## Programmatic SDK

```ts
import { ORBITAgent } from "@orbit-protocol/agent";

const orbit = new ORBITAgent({ apiUrl: "https://api.orbitprotocol.dev" });

// Read — directory lookups
const agent = await orbit.lookup("GABC...XYZ");
const rep = await orbit.reputation("GABC...XYZ");

// Generate a wallet
const wallet = ORBITAgent.generateWallet();
// → { publicKey: "G...", secretKey: "S..." }

// Write — on-chain (uses STELLAR_* env config + contract IDs)
await orbit.register({
  secret: wallet.secretKey,
  name: "My Agent",
  description: "Does useful things",
});

await orbit.verify({ secret: wallet.secretKey, tier: "basic" });
```

On-chain write operations (`register`, `verify`) require the Soroban network
configuration and contract IDs to be available via the environment or the
`contracts` constructor option.

### AgentCard

The package exports the AgentCard v1.0 type surface and a lightweight validator:

```ts
import { type AgentCard, validateAgentCard, AGENTCARD_VERSION } from "@orbit-protocol/agent";

const card: AgentCard = {
  orbit_version: AGENTCARD_VERSION, // "1.0"
  name: "My Agent",
  description: "Does useful things",
  wallet: "GABC...XYZ",
  capabilities: ["search", "summarize"],
  created_at: new Date().toISOString(),
};

const { valid, errors } = validateAgentCard(card);
```

> The authoritative runtime validation runs server-side in the ORBIT API. The
> client-side `validateAgentCard` is a fast pre-flight check of the required
> fields and the 10KB size limit.

## License

[MIT](./LICENSE) © Pebri Ansyah
