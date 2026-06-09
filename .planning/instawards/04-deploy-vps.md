# Job 04 — Deploy to VPS, Go Live at orbitprotocol.dev

Status: ⬜ TODO · Deliverable: **D3** · Depends on: **#3 (frontend redesign live first)**

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

## Result (fill at end of chat)
- Live frontend URL:
- Live API URL:
- Notes:
