# Job 07 — Evidence Submission Package

Status: ⬜ TODO · Depends on: #1–#6

## Goal
Compile all evidence into one document the Ambassador Lead (Kenny) submits via the
Instawards Airtable form. Map each deliverable to its proof.

## Evidence checklist (from SOW §6)
### D1 — Smart Contracts
- [ ] Public GitHub repo link: https://github.com/cryptoeights/orbit-protocol
- [ ] Testnet tx hashes (deployment) → stellar.expert links
- [x] Coverage report (>80%) → from Job 01: **96.33% lines** (agent-registry + verification). Report at `contracts/coverage/` (HTML + `summary.txt` + `lcov.info` + `README.md`); regenerated in CI `contracts.yml` → `Coverage` job (`coverage-lcov` artifact).

### D2 — SDK + CLI
- [x] npm package link: https://www.npmjs.com/package/@orbit-protocol/agent — **published v0.1.0** (2026-06-08). Verified live via `npx @orbit-protocol/agent@latest --version` → `0.1.0`.
- [ ] CLI demo video → Job 06
- [ ] Screenshot/recording of full flow

### D3 — Landing Page
- [ ] Live URL: https://orbitprotocol.dev → Job 04
- [ ] Screenshots (directory + profile pages)
- [ ] Site walkthrough video → Job 06

## ⚠️ Must include note
- **Hosting deviation**: SOW says Vercel; delivered on self-hosted VPS. Same live URL,
  same functionality. Flagged to Kenny on <date>.

## Deliverable
- [ ] A single Markdown (or doc) with the table above filled, all links live & checked.
- [ ] Hand to Kenny for Airtable submission.

## Result (fill at end of chat)
- Submission doc location:
- Submitted on:
