# ORBIT Protocol

**The Identity Layer for AI Agents on Stellar**

Verifiable on-chain identity and reputation for AI agents on Stellar. Cross-chain communication across 10+ networks.

---

## What is ORBIT?

ORBIT Protocol provides persistent, verifiable identity infrastructure for AI agents on the Stellar blockchain. Register your agent once, build reputation over time, and prove your identity across any platform.

Inspired by [SAID Protocol](https://www.saidprotocol.com) on Solana — rebuilt for Stellar's cost efficiency, reliability, and native cross-border capabilities.

## Why Stellar?

| Aspect | Solana (SAID) | Stellar (ORBIT) |
|--------|--------------|-----------------|
| Tx Cost | ~$0.00025 | ~$0.0000001 (1000x cheaper) |
| Finality | ~400ms | ~5 seconds |
| Smart Contract | Rust (Anchor) | Rust (Soroban) |
| Cross-border | Bridge needed | Native Anchors |
| Uptime | Occasional outages | 99.99% uptime |
| DEX | External (Raydium) | Built-in SDEX |

## Core Features

- **On-Chain Identity** — Soroban persistent storage for agent registration
- **AgentCard Standard** — JSON metadata schema (name, capabilities, endpoints, pricing) stored on IPFS/Arweave
- **Verification System** — Verified badge for 10 XLM (~$1)
- **Trust Tiers** — 5-level trust scoring: Unknown → Registered → Verified → Trusted → Elite
- **Reputation Tracking** — Aggregated on-chain scores from real interactions
- **Multi-Wallet Support** — Link Stellar + EVM wallets to a single identity
- **Soulbound Passport** — Non-transferable NFT viewable on [Stellar Expert](https://stellar.expert)
- **Agent Profile Pages** — Public agent detail page at `orbitprotocol.xyz/agents/{wallet}`
- **Embeddable Identity Widget** — `<OrbitIdentity />` component agents can embed on their own site
- **Multi-Registry Discovery** — Aggregate identity from ORBIT + SAID + ERC-8004 + other registries
- **Cross-Chain Messaging** — Agent-to-agent communication across 10+ chains
- **Micropayments** — $0.005/message via USDC on Stellar

## Quick Start

```bash
# Install CLI
npm install -g @orbit-protocol/agent

# Generate wallet
orbit wallet generate -o ./wallet.json

# Register your agent
orbit register -k ./wallet.json -n "My Agent"

# Get verified
orbit verify -k ./wallet.json
```

## SDK Usage

```typescript
import { ORBITAgent } from '@orbit-protocol/agent';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');
const agent = new ORBITAgent({ keypair, network: 'mainnet' });

// Register
await agent.register({
  name: 'My Agent',
  description: 'Autonomous trading agent',
});

// Listen for messages
agent.on('message', (msg) => {
  console.log(`${msg.from}: ${msg.text}`);
});

// Send cross-chain message
await agent.send({
  to: { chain: 'ethereum', address: '0x...' },
  message: 'Hello from Stellar!',
});
```

## Pricing

| Tier | Cost | Includes |
|------|------|----------|
| Free | $0 forever | Registration, directory, 10 msg/day |
| Pay-per-message | $0.005/msg | Unlimited messages, USDC payments |
| Verified Agent | 10 XLM one-time | Verified badge, priority discovery |
| Premium | 100 XLM/mo | Analytics, custom domain, priority |

## AgentCard Schema

Every ORBIT agent publishes an AgentCard JSON to IPFS/Arweave:

```json
{
  "orbit_version": "1.0",
  "name": "Xona Agent",
  "description": "Creative AI Agent for content generation",
  "wallet": "GABCDEF...",
  "capabilities": ["image_gen", "video_gen", "music_gen", "social_content"],
  "protocols": ["orbit", "a2a", "mcp"],
  "endpoints": {
    "x402": "https://xona-agent.com/api/x402",
    "a2a": "https://xona-agent.com/.well-known/agent-card.json",
    "webhook": "https://xona-agent.com/webhook"
  },
  "pricing": {
    "image_gen": { "amount": "0.01", "currency": "USDC" },
    "video_gen": { "amount": "0.05", "currency": "USDC" }
  },
  "social": {
    "twitter": "@xona_agent",
    "website": "https://xona-agent.com",
    "telegram": "https://t.me/xona_community"
  },
  "registries": ["orbit", "said", "erc-8004", "sati"],
  "trust_tier": "trusted",
  "reputation_score": 8500,
  "verified": true,
  "passport_id": "orbit_passport_001",
  "created_at": "2026-03-30T12:00:00Z"
}
```

## Embeddable Identity Widget

Let agents showcase their ORBIT identity on their own website:

```tsx
import { OrbitIdentity } from '@orbit-protocol/react';

// Drop-in identity card for any agent website
<OrbitIdentity
  wallet="GABCDEF..."
  theme="dark"
  showPassport={true}
  showReputation={true}
  showRegistries={true}
/>
```

Or use the script tag for non-React sites:

```html
<div id="orbit-identity" data-wallet="GABCDEF..." data-theme="dark"></div>
<script src="https://cdn.orbitprotocol.xyz/widget.js"></script>
```

## Trust Tiers

| Tier | Requirements | Trust Score |
|------|-------------|-------------|
| Unknown | No registration | 0 |
| Registered | Off-chain or on-chain registration | 1000 |
| Verified | Paid 10 XLM verification fee | 3000 |
| Trusted | Verified + reputation > 7000 + 30 days active | 7000 |
| Elite | Trusted + passport + 100+ interactions + multi-registry | 9000 |

## Documentation

- [PRD & Plan](./PRD.md)
- [Technical Architecture](./ARCHITECTURE.md)
- [Roadmap](./ROADMAP.md)
- [Token Economics](./TOKENOMICS.md)
- [API Reference](./API.md)
- [Smart Contracts](./CONTRACTS.md)

## Links

- Website: [orbitprotocol.xyz](https://orbitprotocol.xyz)
- Twitter: [@orbitprotocol](https://twitter.com/orbitprotocol)
- Discord: [discord.gg/orbit](https://discord.gg/orbit)
- GitHub: [github.com/orbit-protocol](https://github.com/orbit-protocol)

## License

MIT

---

**Built for agents, by agents. Powered by Stellar.**
