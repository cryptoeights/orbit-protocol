# Job 00 — GitHub Activity / Repo Health ✅ DONE

Status: **DONE** (2026-06-06) · Merged via PR #1

## Goal
Make the public repo look active & professional for the Instawards reviewer, and
set up groundwork for deployment.

## What shipped (on `main`, commits 7c768ea → df356e6)
- **Docker stack**: multi-stage Dockerfiles for `api` and `frontend` (Next standalone),
  `deploy/docker-compose.yml` (frontend+api+postgres+redis, no exposed ports),
  `deploy/cloudflared/` (Cloudflare Tunnel), `deploy/README.md` (VPS + multi-project guide).
- **Next.js**: enabled `output: "standalone"`.
- **Domain**: renamed all `orbitprotocol.xyz` → `orbitprotocol.dev`.
- **CI (GitHub Actions)** — all green:
  - `.github/workflows/contracts.yml`: cargo build + test, fmt/clippy (non-blocking),
    **llvm-cov coverage** job (uploads `lcov.info` artifact).
  - `.github/workflows/ci.yml`: pnpm build for `api` + `cli`, **tsc --noEmit** for `frontend`.
- **Licensing/hygiene**: MIT `LICENSE`, `CONTRIBUTING.md`, issue + PR templates, README badges.
- **Bug fixes (found by new CI)**: Zod 4 `z.record()` needs key+value (api `agentcard.ts`);
  typed `fetch().json()` results (cli `utils.ts`).

## Notes / gotchas for future chats
- `pnpm/action-setup@v4` needs `version: 10` pinned (no root `package.json` to auto-detect).
- Frontend **full `next build` fails in CI** because Privy provider rejects placeholder
  app IDs at prerender → CI uses `tsc --noEmit` instead. Real build happens at deploy time.
- Local typecheck works: `cd <api|cli> && node node_modules/typescript/bin/tsc`
  (frontend: add `--noEmit`). No global cargo/pnpm on this machine.
- Contracts CI coverage job already exists → reuse its output for Job 01.
