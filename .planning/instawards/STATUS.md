# ORBIT Instawards — Master Status

> **READ THIS FIRST** at the start of every chat. It's the single source of truth
> for the Instawards engagement. Update it at the END of every chat.

Last updated: 2026-06-06 (Job #1 done)

---

## What this is

Instawards is a 30-day scoped, execution-focused grant ($5,000) to deliver
foundation-layer infrastructure for **ORBIT Protocol — the identity layer for AI
agents on Stellar**. The SOW was **accepted/approved**. This folder tracks the
remaining work to *complete* the Instaward and submit evidence.

Working style: **one chat = one job.** Each job has its own file in this folder.
At the end of a chat, write results to the job file and update the table below.

---

## Key facts & decisions (don't re-derive these)

| Thing | Value |
|-------|-------|
| Builder | Pebri Ansyah (cryptoeights@gmail.com) |
| Ambassador Chapter | Indonesia — Lead: Kenny Rivaldi |
| GitHub repo | https://github.com/cryptoeights/orbit-protocol (**public**) |
| Git workflow | **PR → wait CI green → merge to `main`** (preferred) |
| Domain | **orbitprotocol.dev** (SOW text says `.xyz` — domain changed to `.dev`) |
| VPS | DigitalOcean `ubuntu-s-2vcpu-8gb-160gb-intel-sgp1`, IP **152.42.179.139** (SGP). Access = same as sibling Solana/b402 project folder. |
| Hosting plan | **Self-host on VPS** via Docker Compose + Cloudflare Tunnel (⚠️ deviates from SOW which says "Vercel" — tell Kenny). |
| npm package name | **`@orbit-protocol/agent`** (SOW-mandated). Repo currently `@orbit-protocol/cli` → must rename. |
| Stellar network | Testnet only (mainnet is Phase 2, out of scope) |

### Deployed testnet contract IDs (in `.env.testnet`)
- AgentRegistry: `CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF`
- Verification: `CAVCJ2UMXMYMAJN7YNQ4RNBQ4SXFCV36QRGZWSHXVEK2CX7UG42LEVN5`
- Reputation: `CAS4TMQYODZGN3OL2LC4KNLESHTDP6V5DY2ZEVZRBBQQXDUX665AQOFM`
- Passport: `CBD4LGX2FCZO7G2MOD6DWURS3RMVIQR3WYAK3RRWYOU5M2U7TF27VT3B`
- MultiWallet: `CAXKMS46TYZH5HENW7BSUT3VQ3SP4CA7BNIRQHH6NFSI62Q4KTXPPHY3`

### Repo layout
`contracts/` (Rust/Soroban) · `cli/` (SDK+CLI) · `api/` (Hono REST) · `frontend/` (Next.js 16) · `deploy/` (Docker+Cloudflare)

---

## SOW deliverables (binding)

- **D1 — Smart Contracts (Testnet):** AgentRegistry + Verification in Rust, >80% coverage, deployed. Evidence: repo link, tx hashes, coverage report.
- **D2 — SDK + CLI:** npm `@orbit-protocol/agent`, CLI (wallet/register/verify/lookup), AgentCard schema v1.0, published on npm. Evidence: npm link, demo video.
- **D3 — Landing + Directory:** live site, agent directory (search/filter), profile pages, quick-start docs. Evidence: live URL, screenshots, demo video.

---

## Job board

| # | Job | File | Status | Depends on |
|---|-----|------|--------|------------|
| 0 | GitHub activity / repo health (CI, license, Docker, domain) | `00-github-activity.md` | ✅ **DONE** | — |
| 1 | Contract coverage report >80% (D1 evidence) | `01-coverage.md` | ✅ **DONE** (96.33% lines) | — |
| 2 | Rename SDK → `@orbit-protocol/agent` + publish npm (D2) | `02-npm-publish.md` | ⬜ TODO | — |
| 3 | Deploy to VPS, go live `orbitprotocol.dev` (D3) | `03-deploy-vps.md` | ⬜ TODO | — |
| 4 | End-to-end verify (CLI register → directory) | `04-e2e-verify.md` | ⬜ TODO | #2, #3 |
| 5 | Demo videos (CLI flow + site walkthrough) | `05-demo-video.md` | ⬜ TODO | #2, #3, #4 |
| 6 | Evidence submission package for Ambassador | `06-evidence.md` | ⬜ TODO | #1–#5 |

Recommended order: 1 / 2 / 3 (any order) → 4 → 5 → 6.

---

## Open decisions needing the user

- **Hosting vs SOW:** SOW says "deployed on Vercel"; plan is VPS. Inform Kenny (Ambassador Lead) so evidence review has no gap. (Tracked in `03-deploy-vps.md` and `06-evidence.md`.)

---

## Session log

| Date | Chat focus | Outcome |
|------|-----------|---------|
| 2026-06-06 | Assess SOW + plan jobs + GitHub activity (Tier 1) | Mapped 6 jobs; shipped repo health: Docker/deploy, CI (green), MIT license, domain→.dev, fixed 3 TS errors. Merged PR #1. Created this memory structure. |
| 2026-06-06 | Security: gitignore audit | Audited repo — no secrets leaked/tracked, working tree clean. Hardened .gitignore for keypairs/private keys (CLI default `orbit-key.json`, *.pem, *.key, cloudflared creds). |
| 2026-06-06 | Job #1: contract coverage (D1) | Installed Rust+cargo-llvm-cov locally (Approach B). In-scope coverage = **96.33% lines** (agent-registry+verification), ≥80% ✅. Committed report to `contracts/coverage/` (HTML+summary+lcov); added in-scope CI summary step; un-ignored coverage dir for evidence. |
