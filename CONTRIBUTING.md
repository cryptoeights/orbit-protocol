# Contributing to ORBIT Protocol

Thanks for your interest in ORBIT — the identity layer for AI agents on Stellar.
This guide explains how the repo is laid out and how to propose changes.

## Repository layout

| Path | What it is |
|------|------------|
| `contracts/` | Soroban smart contracts (Rust): `agent-registry`, `verification`, `reputation`, `passport`, `multi-wallet` |
| `cli/` | `@orbit-protocol/agent` — TypeScript SDK + CLI |
| `api/` | REST API (Hono) serving agent data from testnet |
| `frontend/` | Landing page + agent directory (Next.js) |
| `deploy/` | Docker Compose + Cloudflare Tunnel deployment |

## Prerequisites

- Rust + `cargo` (with the Stellar/Soroban toolchain) for contracts
- Node.js 22 + `pnpm` for `api/`, `cli/`, `frontend/`
- Docker (optional) for running the full stack locally

## Development workflow

1. **Branch** off `main`: `git checkout -b feat/short-description`.
2. **Write tests first** (TDD). Contracts use Rust unit tests; aim for >80% coverage.
3. **Run checks locally** before pushing:
   ```bash
   # contracts
   cd contracts && cargo test --workspace && cargo fmt --all --check && cargo clippy --workspace

   # api / cli / frontend
   pnpm install && pnpm build
   ```
4. **Open a PR** against `main`. CI (GitHub Actions) must pass.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

## Code style

- Prefer small, focused files and immutable data patterns.
- Validate all external input (Zod on the TS side).
- No secrets in source — use environment variables.

## Reporting bugs / requesting features

Use the issue templates under **Issues → New issue**.
