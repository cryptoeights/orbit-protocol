# Job 04 — Deploy to VPS, Go Live at orbitprotocol.dev

Status: ✅ **DONE 2026-06-10** · Deliverable: **D3** · Depends on: **#3 (frontend redesign live first)**

## Goal
Get the full stack live: `orbitprotocol.dev` (frontend) + `api.orbitprotocol.dev` (API),
serving testnet data, on the DigitalOcean VPS.

## Infra facts
- VPS: `ubuntu-s-2vcpu-8gb-160gb-intel-sgp1`, IP **152.42.179.139**. SSH access = same
  as the sibling Solana/b402 project folder (outside orbit-protocol).
- DNS: **Cloudflare**. Plan: **Cloudflare Tunnel** (no exposed ports) → containers.
- Deploy assets already in repo: `deploy/docker-compose.yml`, `deploy/cloudflared/`,
  `deploy/README.md`, Dockerfiles in `api/` and `frontend/`.
- Multi-project VPS: Orbit is 1 of 3 projects; shared docker network `web`.

## Acceptance criteria
- [ ] `https://orbitprotocol.dev` loads the landing page (HTTPS via Cloudflare).
- [ ] `https://api.orbitprotocol.dev` responds; frontend reads agents from it.
- [ ] Agent directory shows registered testnet agents; profile pages work.
- [ ] DB schema applied (`docker compose run --rm api pnpm db:push`).
- [ ] Screenshots captured for `06-evidence.md`.

## Steps (see deploy/README.md for full version)
1. SSH to VPS; install Docker; `docker network create web`.
2. Clone repo to `/opt/orbit`; `deploy/.env` from `.env.example` (set POSTGRES_PASSWORD, Privy app id).
3. Cloudflare Tunnel: create tunnel, token → `deploy/cloudflared/.env`, add public hostnames
   `orbitprotocol.dev → frontend:3000`, `api.orbitprotocol.dev → api:3001`.
4. `docker compose up -d --build`; `docker compose run --rm api pnpm db:push`.
5. Verify via the live URLs.

## ⚠️ SOW deviation
SOW D3 says "deployed on **Vercel**". We self-host on VPS. Evidence requirement is
"Live URL + screenshots" (hosting is an implementation detail), but **inform Kenny**
so the Ambassador verification has no gap. Note this in `06-evidence.md`.

## Open questions
- Real Privy app ID for production build (frontend bakes `NEXT_PUBLIC_PRIVY_APP_ID` at build).
- Does the API need a funded admin key on the VPS for any write paths? (verification fees etc.)

## Progress 2026-06-10 (this chat)
- ✅ Docker + compose installed on VPS; shared network `web` created.
- ✅ Repo cloned to `/opt/orbit`; `deploy/.env` written (generated strong
  POSTGRES_PASSWORD, Privy app id `cmngnyavv014f0cjyr62uxvlo`, contract IDs,
  `NEXT_PUBLIC_API_URL=https://api.orbitprotocol.dev`). chmod 600.
- ⚠️ Frontend image build failed: new pnpm hard-fails on unapproved dependency
  build scripts (`ERR_PNPM_IGNORED_BUILDS`). **Fixed** by pinning
  `packageManager: pnpm@10.29.3` + `pnpm.onlyBuiltDependencies` in
  `frontend/package.json` — PR #12 merged to main (CI green); VPS clone reset
  to merged main.
- ✅ Full stack up: `orbit-postgres-1`, `orbit-redis-1`, `orbit-api-1`,
  `orbit-frontend-1`. DB schema pushed (`pnpm db:push` → changes applied).
- ✅ Verified inside docker network `web`: frontend:3000 → HTTP 200;
  api:3001/health → healthy (database ok, redis ok, all 5 contract IDs).
- ✅ Cloudflare Tunnel: no CF API token exists anywhere locally/VPS →
  used `cloudflared tunnel login` flow (user authorized in browser; first
  attempt failed — nonroot container couldn't write cert; rerun `--user root`).
  `tunnel create orbit` → id `d1663c84-5556-4253-8ea6-72daa6217e6f`;
  `tunnel route dns` added CNAMEs for both hostnames; cert-based (locally
  managed) tunnel — config at `/root/.cloudflared/config.yml`, NOT the repo's
  token-based compose. Container `cloudflared` (`--restart unless-stopped`,
  network `web`, `--user root -e HOME=/root`).
- Existing Caddy (b402 proxy, ports 80/443) untouched — tunnel needs no ports.
- ~~Note for user: add `https://orbitprotocol.dev` to the Privy app's allowed
  domains/origins.~~ **OBSOLETE same day:** Privy removed entirely (PR #13) —
  auth is Freighter-only; `NEXT_PUBLIC_PRIVY_APP_ID` purged from env/compose.

## Result
- Live frontend URL: **https://orbitprotocol.dev** — HTTP 200, HTTP/2 + TLS,
  branded title; all routes 200: `/`, `/agents`, `/create-agent`, `/docs`,
  `/profile`, `/security`.
- Live API URL: **https://api.orbitprotocol.dev** — `/health` → healthy
  (database ok, redis ok, testnet, all 5 contract IDs).
- Notes:
  - API `/api/agents` returns `total: 0` — prod DB is fresh; directory relies
    on the client-side **chain fallback** (reads contracts via simulation),
    same code proven working in the 2026-06-10 web on-chain session. Visual
    browser check + screenshots NOT yet done this chat (Chrome extension was
    offline) → fold into Job 5 (e2e) / Job 6 (video) which need them anyway.
  - Tunnel is cert-based via `docker run`, not `deploy/cloudflared/`
    token compose — update `deploy/README.md` later or migrate to token flow.
  - `frontend/package.json` fix (pnpm pin + onlyBuiltDependencies) merged as
    PR #12; VPS clone reset to merged main.
  - Day-2 ops: `cd /opt/orbit && git pull && cd deploy && docker compose up -d --build`.
  - ⚠️ Still must inform Kenny re: VPS-instead-of-Vercel SOW deviation.
