# Job 06 — Demo Videos

Status: ✅ DONE (2026-06-17) · Deliverable: **D2 + D3** (evidence) · Depends on: #2, #4, #5

## Goal
Record the demo videos the SOW requires as evidence.

## Required videos
1. **CLI flow** (D2): generate wallet → register agent → verify agent → lookup agent,
   all via CLI interacting with Stellar Testnet.
2. **Site walkthrough** (D3): landing page → agent directory (search/filter) →
   agent profile page with verification badge → quick-start docs.

## Acceptance criteria
- [x] Both videos recorded, watchable (hosted link: YouTube).
- [x] CLI video shows real testnet tx confirmations (agent #61, tx captured).
- [x] Links recorded (below + to be carried into `07-evidence.md`).

## Notes
- Reuse the exact command sequence verified in Job 04 as the script.
- Keep each short (2–4 min). Show terminal + browser.

## Result (2026-06-17)

Both demo videos recorded by builder (recorded with Focusee, uploaded via Loom/YouTube).

**Demo agent used (live testnet, captured this session — agent #61):**
- Wallet: `GDL4SHVXMS5ORXKRQEMMFX4C733AAD4XE4JYHPVD43VAZKHBUIPH7M34`
- Register tx: `8d01c08c3ad08287a5716593b4242f87d6ff022c04a6979b1ab5989ea44735c3`
  → https://stellar.expert/explorer/testnet/tx/8d01c08c3ad08287a5716593b4242f87d6ff022c04a6979b1ab5989ea44735c3
- Verify tx (basic, 10 XLM): `4047953fe218ea7d6839e1270814e2db6176b0499cd92f5c8362a96875d7546b`
  → https://stellar.expert/explorer/testnet/tx/4047953fe218ea7d6839e1270814e2db6176b0499cd92f5c8362a96875d7546b
- Profile (live): https://orbitprotocol.dev/agents/GDL4SHVXMS5ORXKRQEMMFX4C733AAD4XE4JYHPVD43VAZKHBUIPH7M34
- Verified live: API `verified:true` (basic), profile 200, present in directory.

**Video 1 — CLI flow (D2):** wallet generate --fund → register → verify → lookup, via
`npx @orbit-protocol/agent` (zero-config, OOB). Shows real testnet tx confirmations.
- Link: ✅ https://www.youtube.com/watch?v=JQqOvmD348w

**Video 2 — Site walkthrough (D3):** landing → directory (search/filter) → agent #61
profile w/ VERIFIED badge → quick-start docs.
- Link: ✅ https://www.youtube.com/watch?v=ioPVA0R-9VE
