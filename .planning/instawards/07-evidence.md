# Job 07 — Evidence Submission Package

Status: ✅ DONE (2026-06-17) · Depends on: #1–#6 · Submission doc: `EVIDENCE-SUBMISSION.md`

## Goal
Compile all evidence into one document the Ambassador Lead (Kenny) submits via the
Instawards Airtable form. Map each deliverable to its proof.

## Evidence checklist (from SOW §6)
### D1 — Smart Contracts
- [x] Public GitHub repo link: https://github.com/cryptoeights/orbit-protocol (200, public)
- [x] Testnet deployment → stellar.expert contract pages (deployed 2026-04-01, deployer `GDQZEOCX…`):
  - AgentRegistry: https://stellar.expert/explorer/testnet/contract/CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF
  - Verification: https://stellar.expert/explorer/testnet/contract/CAVCJ2UMXMYMAJN7YNQ4RNBQ4SXFCV36QRGZWSHXVEK2CX7UG42LEVN5
- [x] Coverage report (>80%) → from Job 01: **96.33% lines** (agent-registry + verification). Report at `contracts/coverage/` (`summary.txt` + `lcov.info` + `README.md`); regenerated in CI `contracts.yml` → `Coverage` job (`coverage-lcov` artifact).

### D2 — SDK + CLI
- [x] npm package link: https://www.npmjs.com/package/@orbit-protocol/agent — **published, latest `v0.1.1`**. Verified live via `npm view @orbit-protocol/agent version` → `0.1.1`.
- [x] CLI demo video → https://www.youtube.com/watch?v=JQqOvmD348w (Job 06)
- [x] Screenshot/recording of full flow → captured in CLI video (real testnet tx on screen, agent #61)

### D3 — Landing Page
- [x] Live URL: https://orbitprotocol.dev (200) → Job 04
- [x] Screenshots (directory + profile pages) → from Job 05/06; profile https://orbitprotocol.dev/agents/GDL4SHVXMS5ORXKRQEMMFX4C733AAD4XE4JYHPVD43VAZKHBUIPH7M34
- [x] Site walkthrough video → https://www.youtube.com/watch?v=ioPVA0R-9VE (Job 06)

## ⚠️ Must include note
- **Hosting deviation**: SOW says Vercel; delivered on self-hosted VPS (Docker + Cloudflare
  Tunnel). Same live URL, same functionality. Documented in `EVIDENCE-SUBMISSION.md`.
  ⬜ **ACTION: Pebri to tell Kenny verbally/in writing before he submits.**
- **Domain**: SOW says `orbitprotocol` (`.xyz`); live is `orbitprotocol.dev`.

## Deliverable
- [x] A single Markdown with all evidence filled, links live & checked → `EVIDENCE-SUBMISSION.md`.
- [ ] Hand to Kenny for Airtable submission.

## Result (2026-06-17)
- Submission doc location: `.planning/instawards/EVIDENCE-SUBMISSION.md` (self-contained, SOW §6 mapped)
- All evidence links verified live this session: repo 200, npm v0.1.1, both contracts on stellar.expert, site routes 200, API healthy, 2 YouTube videos.
- Submitted on: ⬜ _pending — hand `EVIDENCE-SUBMISSION.md` to Kenny for Airtable_
