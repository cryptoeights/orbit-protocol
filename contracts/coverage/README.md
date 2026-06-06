# Contract Coverage Report — Instawards D1 Evidence

Test coverage for the **in-scope** ORBIT contracts (`agent-registry`, `verification`).
Out-of-scope Phase-2 contracts (`reputation`, `passport`, `multi-wallet`) are excluded
so they cannot drag the in-scope number down.

## Headline result

| Metric | Coverage |
|--------|----------|
| **Lines** | **96.33%** (682 lines, 25 missed) |
| **Regions** | **96.84%** (1362 regions, 43 missed) |
| **Functions** | **90.43%** (94 functions, 9 missed) |

All metrics are **well above the 80% SOW target**. ✅

Tests: `agent-registry` 20 passing · `verification` 12 passing (32 total, 0 failed).

## How to reproduce

```bash
cd contracts
cargo llvm-cov -p agent-registry -p verification --summary-only   # prints the table
cargo llvm-cov -p agent-registry -p verification --html --output-dir coverage
```

Tooling: `cargo-llvm-cov` 0.8.7, Rust stable (1.96).

## Files

- `summary.txt` — per-file coverage table (the source of the headline numbers).
- `lcov.info` — machine-readable LCOV (scoped to the two in-scope contracts; paths
  are repo-relative).
- `html/` — browsable HTML report, **git-ignored** (it embeds absolute local paths,
  so it is not committed). Regenerate with the `--html` command above.

CI also regenerates coverage on every push/PR via
[`.github/workflows/contracts.yml`](../../.github/workflows/contracts.yml)
(`Coverage` job), uploading `lcov.info` as the `coverage-lcov` artifact.
