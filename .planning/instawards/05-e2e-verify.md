# Job 05 — End-to-End Verification

Status: ⬜ TODO · Deliverable: cross-cutting (D1+D2+D3) · Depends on: #2, #4

## Goal
Prove the full loop works on testnet: a developer uses the published CLI to register
an agent, and it appears (verified) in the live directory.

## Acceptance criteria
- [ ] `orbit wallet generate` → new Stellar keypair.
- [ ] `orbit register ...` → agent written to AgentRegistry on testnet (capture tx hash).
- [ ] `orbit verify ...` → pays fee, verified badge set (capture tx hash).
- [ ] `orbit lookup ...` → returns the agent's on-chain data + AgentCard.
- [ ] The agent shows up at `https://orbitprotocol.dev` directory + profile page with badge.
- [ ] Tx hashes collected (stellar.expert testnet links) for `06-evidence.md`.

## Notes
- Needs the published package (#2) and live site/API (#3).
- Use a throwaway funded testnet account (friendbot for XLM).
- Record exact commands run — they double as the demo-video script (Job 05).

## Result (fill at end of chat)
- Register tx:
- Verify tx:
- Agent profile URL:
