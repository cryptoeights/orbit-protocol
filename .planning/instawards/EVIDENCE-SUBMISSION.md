# ORBIT Protocol — Instawards Evidence of Completion

**Project:** ORBIT Protocol — The Identity Layer for AI Agents on Stellar
**Builder:** Pebri Ansyah (cryptoeights@gmail.com)
**Ambassador Chapter:** Indonesia — Lead: Kenny Rivaldi
**Network:** Stellar Testnet (Soroban)
**Submitted:** 2026-06-17

This document maps every SOW §6 evidence requirement to live, verifiable proof. All
three deliverables (D1–D3) are complete; two Phase-2 contracts were also delivered ahead
of scope (see "Bonus").

---

## Deliverable 1 — Soroban Smart Contracts (Testnet)

| Evidence (SOW §6) | Proof |
|---|---|
| Public GitHub repo | https://github.com/cryptoeights/orbit-protocol |
| Testnet deployment (stellar.expert) — **AgentRegistry** | https://stellar.expert/explorer/testnet/contract/CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF |
| Testnet deployment (stellar.expert) — **Verification** | https://stellar.expert/explorer/testnet/contract/CAVCJ2UMXMYMAJN7YNQ4RNBQ4SXFCV36QRGZWSHXVEK2CX7UG42LEVN5 |
| Test coverage report (>80%) — **summary** | https://github.com/cryptoeights/orbit-protocol/blob/main/contracts/coverage/summary.txt |
| Test coverage report — README | https://github.com/cryptoeights/orbit-protocol/blob/main/contracts/coverage/README.md |
| Test coverage report — raw lcov | https://github.com/cryptoeights/orbit-protocol/blob/main/contracts/coverage/lcov.info |
| CI — test/coverage workflow | https://github.com/cryptoeights/orbit-protocol/blob/main/.github/workflows/contracts.yml |
| CI — run history (green) + `coverage-lcov` artifact | https://github.com/cryptoeights/orbit-protocol/actions/workflows/contracts.yml |
| Test source — AgentRegistry (20 tests) | https://github.com/cryptoeights/orbit-protocol/blob/main/contracts/contracts/agent-registry/src/test.rs |
| Test source — Verification (12 tests) | https://github.com/cryptoeights/orbit-protocol/blob/main/contracts/contracts/verification/src/test.rs |

- **Coverage: 96.33% lines** (agent-registry + verification), 32 tests passing — exceeds the >80% requirement.
- Deployed on Stellar Testnet **2026-04-01** (deployer `GDQZEOCXWGOY2KI75PEJMIKCAVAJTBBDYIFLSIVXRQUANEGG4M2SY6NO`). Each contract's creation/invocation transactions are viewable on its stellar.expert page above.
- Written in Rust with `soroban-sdk`. AgentRegistry (register / update / deactivate / lookup) + Verification (pay 10 XLM → verified badge, check, admin revoke).
- Coverage detail: agent-registry 20 tests, verification 12 tests; lines 96.33%, regions 96.84%, functions 90.43% — all ≥80%. Reproduce locally: `cd contracts && cargo llvm-cov -p agent-registry -p verification --summary-only`.

---

## Deliverable 2 — TypeScript SDK + CLI

| Evidence (SOW §6) | Proof |
|---|---|
| npm package | https://www.npmjs.com/package/@orbit-protocol/agent — **published, latest `v0.1.1`** |
| CLI demo video (wallet → register → verify → lookup, via CLI on Testnet) | https://www.youtube.com/watch?v=JQqOvmD348w |
| Screenshot / recording of full flow | Captured in the CLI video above (real testnet tx confirmations on screen) |

- Works out-of-the-box with **zero config**: `npx @orbit-protocol/agent register …` (testnet contract IDs baked in; v0.1.1 fixed the OOB defect from v0.1.0).
- CLI commands: `orbit wallet generate`, `orbit register`, `orbit verify`, `orbit lookup`. Programmatic `ORBITAgent` class + AgentCard JSON schema v1.0.
- **Live end-to-end proof captured this engagement (demo agent #61):**
  - Wallet: `GDL4SHVXMS5ORXKRQEMMFX4C733AAD4XE4JYHPVD43VAZKHBUIPH7M34`
  - Register tx: https://stellar.expert/explorer/testnet/tx/8d01c08c3ad08287a5716593b4242f87d6ff022c04a6979b1ab5989ea44735c3
  - Verify tx (basic, 10 XLM): https://stellar.expert/explorer/testnet/tx/4047953fe218ea7d6839e1270814e2db6176b0499cd92f5c8362a96875d7546b

---

## Deliverable 3 — Landing Page + Agent Directory

| Evidence (SOW §6) | Proof |
|---|---|
| Live URL | https://orbitprotocol.dev |
| Agent directory (search / filter by verified) | https://orbitprotocol.dev/agents |
| Agent profile page w/ verification badge | https://orbitprotocol.dev/agents/GDL4SHVXMS5ORXKRQEMMFX4C733AAD4XE4JYHPVD43VAZKHBUIPH7M34 |
| Quick-Start docs | https://orbitprotocol.dev/docs |
| Site walkthrough video | https://www.youtube.com/watch?v=ioPVA0R-9VE |

- Next.js + Tailwind, responsive, terminal/mono brand design. Directory reads live testnet data; profile pages show identity, verification badge, and trust tier.
- Backing REST API live at https://api.orbitprotocol.dev (`/health` → 200).

---

## ⚠️ Disclosure — deviations from SOW text (for transparent review)

1. **Hosting: VPS instead of Vercel.** SOW §4.1/§6 names Vercel; the site is self-hosted on a DigitalOcean VPS via Docker Compose + Cloudflare Tunnel. **Same live URL, same functionality, fully public.** No impact on the deliverable's substance.
2. **Domain `.dev` instead of `.xyz`.** SOW references `orbitprotocol` (originally planned `.xyz`); the live domain is **orbitprotocol.dev**.

---

## 🎁 Bonus — delivered ahead of scope (Phase 2 items)

The SOW lists these as out-of-scope (Phase 2), but the contracts were already deployed to testnet during this engagement:

- Reputation: `CAS4TMQYODZGN3OL2LC4KNLESHTDP6V5DY2ZEVZRBBQQXDUX665AQOFM`
- Soulbound Passport NFT: `CBD4LGX2FCZO7G2MOD6DWURS3RMVIQR3WYAK3RRWYOU5M2U7TF27VT3B`
- MultiWallet: `CAXKMS46TYZH5HENW7BSUT3VQ3SP4CA7BNIRQHH6NFSI62Q4KTXPPHY3`

(Security audit remains intentionally out-of-scope — planned for Phase 2 before mainnet, per SOW §4.1.)

---

## Evidence Verification Checklist (SOW §6.2)

| Deliverable | Status |
|---|---|
| D1 — Smart Contracts | ✅ Present (repo + on-chain + 96.33% coverage) |
| D2 — SDK + CLI | ✅ Present (npm v0.1.1 + CLI demo video) |
| D3 — Landing Page | ✅ Present (live site + walkthrough video) |
