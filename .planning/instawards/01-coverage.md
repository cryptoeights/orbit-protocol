# Job 01 — Contract Coverage Report (>80%)

Status: ✅ DONE · Deliverable: **D1** (evidence)

## Goal
Produce a verifiable test coverage report for the in-scope contracts showing **>80%**,
to attach as Instawards evidence.

## Scope
- In-scope contracts: **agent-registry** (20 tests), **verification** (12 tests).
- (reputation/passport/multi-wallet exist but are Phase 2 / out-of-scope — fine to include but not required.)

## Acceptance criteria
- [x] Coverage run produces a number ≥ 80% for agent-registry + verification → **96.33% lines**.
- [x] Human-readable report saved → `contracts/coverage/` (HTML + summary.txt + README.md).
- [x] CI `contracts.yml` coverage job uploads `lcov.info` artifact; added explicit in-scope summary step (verify green on PR).
- [x] A copy of the coverage summary recorded here (below) + to be linked in `06-evidence.md`.

## Approach
- CI already runs `cargo llvm-cov --workspace`. Either: (a) read the % from the CI
  coverage job summary, or (b) run locally if cargo is installed.
- Consider adding `--summary-only` output to the job log and/or generating an HTML
  report (`cargo llvm-cov --html`) committed under `contracts/coverage/`.
- If coverage < 80% on the in-scope contracts, add unit tests until ≥80%.

## Notes
- No cargo on the dev machine → rely on CI, or install Rust locally.
- Don't gate the % on out-of-scope contracts dragging it down — measure the
  in-scope ones (can scope llvm-cov per package if needed).

## Result

- **Coverage % (in-scope: agent-registry + verification):**
  - **Lines: 96.33%** (682 lines, 25 missed)
  - Regions: 96.84% (1362 regions, 43 missed)
  - Functions: 90.43% (94 functions, 9 missed)
  - All metrics ≥ 80% ✅. Tests: 32 passing (20 agent-registry + 12 verification), 0 failed.
- **Report location:** `contracts/coverage/` — `README.md`, `summary.txt`, `lcov.info`, `html/index.html`
- **Tooling:** cargo-llvm-cov 0.8.7, Rust stable 1.96 (installed locally — Approach B).
- **Reproduce:** `cd contracts && cargo llvm-cov -p agent-registry -p verification --summary-only`
- **Evidence link:** see `06-evidence.md` (D1 → coverage report).

### Per-file summary (committed at `contracts/coverage/summary.txt`)

| File | Lines | Cover |
|------|-------|-------|
| agent-registry/src/events.rs | 13 | 100.00% |
| agent-registry/src/lib.rs | 101 | 100.00% |
| agent-registry/src/storage.rs | 71 | 92.96% |
| agent-registry/src/test.rs | 186 | 100.00% |
| agent-registry/src/types.rs | 3 | 0.00% |
| verification/src/events.rs | 11 | 100.00% |
| verification/src/lib.rs | 90 | 90.00% |
| verification/src/storage.rs | 86 | 94.19% |
| verification/src/test.rs | 118 | 100.00% |
| verification/src/types.rs | 3 | 0.00% |
| **TOTAL** | **682** | **96.33%** |

> Note: `types.rs` shows 0% because it's pure type/derive declarations with no
> executable lines exercised at runtime — does not affect the logic coverage.
