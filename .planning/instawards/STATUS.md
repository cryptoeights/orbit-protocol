# ORBIT Instawards — Master Status

> **READ THIS FIRST** at the start of every chat. It's the single source of truth
> for the Instawards engagement. Update it at the END of every chat.

Last updated: 2026-06-15 (Job 5 DONE: full CLI→testnet→directory loop verified; tx hashes captured)

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
| 2 | Rename SDK → `@orbit-protocol/agent` + publish npm (D2) | `02-npm-publish.md` | ✅ **DONE** (npm v0.1.0 live) | — |
| 3 | **Frontend redesign — port brand system to code (Figma→React)** | `03-frontend.md` | ✅ **DONE** (Variant B terminal, all pages) | — |
| 4 | Deploy to VPS, go live `orbitprotocol.dev` (D3) | `04-deploy-vps.md` | ✅ **DONE** (site + API live) | #3 |
| 5 | End-to-end verify (CLI register → directory) | `05-e2e-verify.md` | ✅ **DONE** (agent #57, register+verify tx captured, badge live) | #2, #4 |
| 6 | Demo videos (CLI flow + site walkthrough) | `06-demo-video.md` | ⬜ TODO | #2, #4, #5 |
| 7 | Evidence submission package for Ambassador | `07-evidence.md` | ⬜ TODO | #1–#6 |

Recommended order: **5 (e2e) → 6 (video) → 7 (evidence)**.
Frontend MUST land before deploy — the deployed site is the public face + D3 evidence
(screenshots/video), so deploy the final branded design once, not the grey placeholder.

---

## Open decisions needing the user

- **Hosting vs SOW:** SOW says "deployed on Vercel"; plan is VPS. Inform Kenny (Ambassador Lead) so evidence review has no gap. (Tracked in `04-deploy-vps.md` and `07-evidence.md`.)
- ~~Frontend variant (Job 3)~~ **RESOLVED 2026-06-08:** Variant **B (terminal/mono, Figma page 13)**, scope = **landing + all pages**. See `03-frontend.md`.
- ~~Job 2 loose end (uncommitted `cli/*`, `DESIGN.md`, `.gitignore`)~~ **RESOLVED 2026-06-10:** committed & merged — repo now matches the published npm package.

---

## Session log

| Date | Chat focus | Outcome |
|------|-----------|---------|
| 2026-06-15 | Job #5: end-to-end verify (+ A/B test) | **Full loop proven on testnet, BOTH locally and from the packaged artifact.** **Path A (local build):** wallet `GB67SPYG…6QRV` → register (agent **#57**, `c4a2e00a…`) → verify basic/10 XLM (`26f455fe…`) → lookup ✅ basic. Live at **orbitprotocol.dev** profile + directory with **VERIFIED** badge (screenshotted via prod frontend run against live API). **Path B (npm pack → clean install, no .env):** agent **#58** `GBELNCWN…35GX`, register `87250c77…`, verify `45a52192…`. **CLI fixes (uncommitted, tsc clean):** (1) register/verify print **tx hash + stellar.expert link** (`buildAndSubmit` returns `txHash`, new `explorerTx()`); (2) **fixed:** `verify` never re-synced API cache → directory stayed ❌ after on-chain verify; now POSTs `/api/agents/sync/:wallet`; (3) **DEFECT found via A/B:** published `@orbit-protocol/agent@0.1.0` is **broken out-of-the-box** — `config.ts` defaulted contract IDs to `""` + can't find `.env.testnet`, so `npx … register` fails `Invalid contract ID:`. Fixed by baking public testnet IDs as `TESTNET_DEFAULTS` (env still overrides). Files: `cli/src/{config,stellar,utils,commands/register,commands/verify}.ts`. **⚠️ npm must be republished (v0.1.1)** for D2 evidence to be truthful — tracked in `05-e2e-verify.md`. |
| 2026-06-10 | Polish: favicon + drop Privy | **Favicon = ORBIT Constellation mark** (`icon.svg` + 16/32/48 `favicon.ico` 4KB + `apple-icon.png`; fixed png-to-ico 285KB bloat, PR #14). **Privy fully removed → Freighter-only** (PR #13): deleted PrivyProvider + dep (−6.2k lockfile lines), `/profile` rewritten (silent restore, connect prompt, on-chain agent/reputation/verified via simulation), `/security` copy updated, `NEXT_PUBLIC_PRIVY_APP_ID` purged from Dockerfile/compose/envs (local+VPS), CI frontend job upgraded to full `next build`. Redeployed VPS; live-verified: favicon 3,968B served, `/profile` 200, zero "privy" in HTML. Privy allowed-domains follow-up obsolete. |
| 2026-06-10 | Job #4: deploy VPS (D3) | **LIVE: https://orbitprotocol.dev + https://api.orbitprotocol.dev.** VPS: Docker installed, repo → `/opt/orbit`, `deploy/.env` (strong pg password, Privy id), stack up (pg/redis/api/frontend), schema pushed. Fixed frontend Docker build break (new pnpm `ERR_PNPM_IGNORED_BUILDS` → pin `pnpm@10.29.3` + `onlyBuiltDependencies`, PR #12 merged, CI green). Cloudflare Tunnel `orbit` (`d1663c84…`) via cert login flow (no CF API token exists); CNAMEs auto-added; cloudflared container on `web` network; b402 Caddy untouched. All 6 routes 200 + API `/health` healthy publicly. Pending: live screenshots (Chrome ext offline → do in Job 5/6), Privy allowed-domains add, inform Kenny re: Vercel→VPS deviation. |
| 2026-06-06 | Assess SOW + plan jobs + GitHub activity (Tier 1) | Mapped 6 jobs; shipped repo health: Docker/deploy, CI (green), MIT license, domain→.dev, fixed 3 TS errors. Merged PR #1. Created this memory structure. |
| 2026-06-06 | Security: gitignore audit | Audited repo — no secrets leaked/tracked, working tree clean. Hardened .gitignore for keypairs/private keys (CLI default `orbit-key.json`, *.pem, *.key, cloudflared creds). |
| 2026-06-06 | Job #1: contract coverage (D1) | Installed Rust+cargo-llvm-cov locally (Approach B). In-scope coverage = **96.33% lines** (agent-registry+verification), ≥80% ✅. Committed report to `contracts/coverage/` (HTML+summary+lcov); added in-scope CI summary step; un-ignored coverage dir for evidence. |
| 2026-06-08 | Job #2: SDK rename + npm prep (D2) | Renamed pkg → `@orbit-protocol/agent`; added `bin`/`exports`/`files`, MIT, README/LICENSE. New `ORBITAgent` class (`agent.ts`) + side-effect-free SDK entry (`lib.ts`) + dependency-free AgentCard v1.0 types (`agentcard.ts`). Default apiUrl→prod, dotenv quiet. Verified via Approach A (packed tarball installed in clean dir: bin + ESM import both work). **Publish pending** — `npm whoami`=E401, user needs npm account/login. Steps in `02-npm-publish.md`. |
| 2026-06-08 | Job #2: PUBLISHED | User created npm account + scope, ran `npm publish --access public`. **`@orbit-protocol/agent@0.1.0` live** at npmjs.com. Approach B smoke test passed (`npx … --version`→0.1.0). Recorded in evidence file (D2 ✅). |
| 2026-06-08 | Plan fix: insert Frontend job | Caught gap — frontend redesign (Figma, 2 variants) not yet ported to React; live site still un-branded. Inserted **Job 3 (frontend)** before deploy; renumbered deploy→4, e2e→5, video→6, evidence→7. Updated deps + recommended order. |
| 2026-06-09 | Job #3: frontend redesign (D3) | Ported **Variant B (terminal/mono)** from Figma to React across ALL pages. Rewrote `globals.css` as terminal token system (pure black, JetBrains Mono + Inter display, radius 0, scanlines, violet glow, brand-gradient CTAs); self-hosted fonts via `next/font/google`. Rebuilt landing + restyled nav/footer/cards/registry/profile/docs/create-agent/security; new `Logo.tsx` Constellation mark; Privy accent → brand violet. Privy wiring intact. **Verified:** tsc clean, `next build` 9/9 green, all 6 routes 200, live screenshot matches mock. Flagged 2 pre-existing content bugs for follow-up (docs cite old `@orbit-protocol/cli`; create-agent hardcodes `localhost:3001`). |
| 2026-06-10 | Design polish + web on-chain flows | **Design (user-directed):** full black `#000`, violet only on buttons/highlights/numbers, headers → Space Grotesk, white light-streak background lines (Jatevo-style); removed aurora/orbs. **Found+fixed live navbar bug:** un-layered `nav{position:relative}` in globals.css overrode Tailwind v4 `fixed z-50` (cascade layers) → nav scrolled away, all nav clicks broken. **Web on-chain (new `lib/orbit-chain.ts`, Freighter, non-custodial):** register (`register_agent` + AgentCard POST + already-registered pre-check), 👍/👎 feedback widget on profile (`submit_feedback`, owner-guard, friendly contract errors), navbar Connect/Disconnect with silent session restore. **Chain fallbacks (no API/Docker needed):** profile + registry read registry/reputation/verification contracts via zero-account simulation — registry shows real count (55), scores, ✓ verified (10/12 latest). **E2E proven:** SDK register (`SDK Test Agent` #54, tx `360378c5…`), manual register by user, on-chain feedback raised Clawpump 5000→10000 (tx `3639a194…`). **Known gaps logged:** CLI `verify`/`lookup`/`reputation` depend on offline API; docs claim unimplemented `agent.submitFeedback`; web Verify/Mint-Passport buttons not wired. |
