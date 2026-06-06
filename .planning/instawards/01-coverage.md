# Job 01 — Contract Coverage Report (>80%)

Status: ⬜ TODO · Deliverable: **D1** (evidence)

## Goal
Produce a verifiable test coverage report for the in-scope contracts showing **>80%**,
to attach as Instawards evidence.

## Scope
- In-scope contracts: **agent-registry** (20 tests), **verification** (12 tests).
- (reputation/passport/multi-wallet exist but are Phase 2 / out-of-scope — fine to include but not required.)

## Acceptance criteria
- [ ] Coverage run produces a number ≥ 80% for agent-registry + verification.
- [ ] Human-readable report saved (e.g. `contracts/coverage/` HTML or a committed summary).
- [ ] CI `contracts.yml` coverage job is green and uploads `lcov.info` artifact.
- [ ] A copy of the coverage summary recorded here + linked in `06-evidence.md`.

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

## Result (fill at end of chat)
- Coverage %:
- Report location:
- Evidence link:
