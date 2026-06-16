# Job 05 — End-to-End Verification

Status: ✅ DONE (2026-06-15) · Deliverable: cross-cutting (D1+D2+D3) · Depends on: #2, #4

## Goal
Prove the full loop works on testnet: a developer uses the published CLI to register
an agent, and it appears (verified) in the live directory.

## Acceptance criteria
- [x] `orbit wallet generate --fund` → new Stellar keypair, funded via Friendbot (10k test XLM).
- [x] `orbit register ...` → agent written to AgentRegistry on testnet (agent #57). Tx captured.
- [x] `orbit verify ...` → pays 10 XLM, verified badge set (basic tier). Tx captured.
- [x] `orbit lookup ...` → returns the agent's on-chain data + AgentCard (shows ✅ basic after sync).
- [x] The agent shows up at `https://orbitprotocol.dev` directory + profile page with VERIFIED badge.
- [x] Tx hashes collected (stellar.expert testnet links) — see Result below.

## Notes
- Needs the published package (#2) and live site/API (#3).
- Use a throwaway funded testnet account (friendbot for XLM).
- Record exact commands run — they double as the demo-video script (Job 05).

## Result (2026-06-15)

**Throwaway testnet agent (E2E Verify Agent, #57)**
- Wallet: `GB67SPYGNUAXAK2BZYVDYSRKC4UMPPHBVAVYMJG4FNTQ4WQNPMWG6QRV`
- Register tx: `c4a2e00acaae98fb53927ab3e4d14b1631fddcffb9d2998749b153eb4e41dd95`
  → https://stellar.expert/explorer/testnet/tx/c4a2e00acaae98fb53927ab3e4d14b1631fddcffb9d2998749b153eb4e41dd95
- Verify tx (basic, 10 XLM): `26f455fee182ef7f6d77288a20d3a87244fbf37abbcaf77173d2a7bc0c9da857`
  → https://stellar.expert/explorer/testnet/tx/26f455fee182ef7f6d77288a20d3a87244fbf37abbcaf77173d2a7bc0c9da857
- Friendbot funding (create_account): `bfcf57d90d6237abf66a0053ee963c79e4a502db2decce154073f62187485332`
- Agent profile URL: https://orbitprotocol.dev/agents/GB67SPYGNUAXAK2BZYVDYSRKC4UMPPHBVAVYMJG4FNTQ4WQNPMWG6QRV
- Directory: https://orbitprotocol.dev/agents (shows agent with ✓ VERIFIED, "50 · VERIFIED")

### Exact commands run (doubles as Job 6 demo script)
```
orbit wallet generate --output e2e-key.json --fund
orbit register -k e2e-key.json -n "E2E Verify Agent" \
  -d "End-to-end verification run for Instawards Job 5" \
  -m "https://orbitprotocol.dev/agents/e2e"
orbit verify -k e2e-key.json --tier basic
orbit lookup GB67SPYGNUAXAK2BZYVDYSRKC4UMPPHBVAVYMJG4FNTQ4WQNPMWG6QRV
```

### CLI fixes made during this job (uncommitted, working tree)
- `register`/`verify` now print the **tx hash + stellar.expert link** (`buildAndSubmit`
  returns `txHash`; new `explorerTx()` helper in `utils.ts`). Needed for evidence capture.
- **Bug fixed:** `verify` did not re-sync the API cache, so the directory/profile kept
  showing ❌ after a successful on-chain verification. Added the same
  `POST /api/agents/sync/:wallet` call that `register` already does. Now the verified
  badge appears without any manual sync.
- Files: `cli/src/{stellar.ts,utils.ts,commands/register.ts,commands/verify.ts}`. tsc clean.

### A/B test (both paths verified)
- **A — local build** (`node dist/index.js`): agent **#57**, register `c4a2e00a…`, verify `26f455fe…`. ✅
- **B — packaged artifact** (`npm pack` → installed in clean /tmp dir, **no `.env.testnet`**):
  agent **#58** `GBELNCWN…35GX`, register `87250c77…`, verify `45a52192…`, lookup shows ✅ basic. ✅

### ⚠️ Defect found + fixed during A/B test — affects D2 (npm package)
- The **published `@orbit-protocol/agent@0.1.0` is broken out-of-the-box**: `config.ts`
  defaulted all 5 contract IDs to `""` and the published package can't find `.env.testnet`
  (not bundled; relative path resolves outside the npx cache). Result: `orbit register` on a
  clean install fails with `❌ Invalid contract ID:`. Reproduced via
  `npx @orbit-protocol/agent@0.1.0 register …` in a clean dir.
- **Fix:** baked the public testnet contract IDs (+ XLM SAC) into `config.ts` as defaults
  (`TESTNET_DEFAULTS`), env vars still override. Re-verified via the tarball install above
  (path B) — full loop now works with zero config.
- **RESOLVED 2026-06-15:** published **`@orbit-protocol/agent@0.1.1`** to npm; PR #15 merged to
  `main` (repo now matches npm). Live OOB re-verified: `npx @orbit-protocol/agent@0.1.1 register`
  in a clean dir with no `.env` → agent registered, tx
  `324d34c109fa3b12b44e4fa86c6f95455a211107d26449f6857ca8f871b0eaa0`. D2 "package works" now truthful.

### Notes
- Profile + directory pages are client-rendered; verified live by running the prod
  frontend locally against `https://api.orbitprotocol.dev` and screenshotting (badge renders).
- Screenshots captured this session can be reused as D3 evidence in Job 7.
