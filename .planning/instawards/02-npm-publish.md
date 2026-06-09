# Job 02 — Rename SDK → `@orbit-protocol/agent` + Publish to npm

Status: ✅ **DONE** · Deliverable: **D2**

## Goal
Publish the TypeScript SDK + CLI to npm under the **SOW-mandated** name
**`@orbit-protocol/agent`** (currently `@orbit-protocol/cli`).

## Acceptance criteria
- [ ] `cli/package.json` name = `@orbit-protocol/agent` (version e.g. 0.1.0).
- [ ] Package builds (`pnpm build` → `dist/`) and `bin` maps the `orbit` CLI.
- [ ] CLI commands work: `orbit wallet generate`, `orbit register`, `orbit verify`, `orbit lookup`.
- [ ] Programmatic `ORBITAgent` class exported.
- [ ] AgentCard JSON schema v1.0 referenced/exported (lives in `api/src/types/agentcard.ts`; decide if SDK re-exports it).
- [ ] README + usage examples in the package.
- [ ] **Published & visible** at https://www.npmjs.com/package/@orbit-protocol/agent
- [ ] npm link recorded in `06-evidence.md`.

## Approach
1. Rename package; update bin name, README, any internal references to `@orbit-protocol/cli`.
2. Ensure `files`, `bin`, `main`/`exports`, `types` fields are correct for publish.
3. Verify the npm org/scope `@orbit-protocol` is owned by the user (create org or publish under scope; `npm login` first).
4. `npm publish --access public` (scoped packages default to restricted).
5. Smoke test: `npx @orbit-protocol/agent@latest lookup ...` in a clean dir.

## Notes / gotchas
- Scoped public publish needs `--access public`.
- The default `NEXT_PUBLIC_API_URL` / CLI `apiUrl` should point to the live API
  (`https://api.orbitprotocol.dev`) — coordinate with Job 03.
- Decide what counts as "SDK": currently `cli/` holds both CLI + `ORBITAgent`. SOW
  lists one package `@orbit-protocol/agent` covering both — keep it one package.

## Result (fill at end of chat)
- npm URL: **https://www.npmjs.com/package/@orbit-protocol/agent**
- Published version: **0.1.0** (published 2026-06-08)
- Post-publish smoke test (Approach B): `npx @orbit-protocol/agent@latest --version` → `0.1.0` ✅

### Progress 2026-06-08 — PUBLISHED ✅
All package changes done, verified via **Approach A (dry-run)**, then **published**
by the user (`npm publish --access public`) and confirmed live via **Approach B**.

Done:
- Renamed `cli/package.json` → `@orbit-protocol/agent`; added `bin.orbit`, `files`,
  `main`/`module`/`types`/`exports` (split lib vs CLI entry), MIT license, author,
  repo/homepage/bugs, engines, keywords, `publishConfig.access=public`, `prepublishOnly`.
- New `cli/src/agent.ts` → **`ORBITAgent`** class (generateWallet, lookup, reputation,
  register, verify) wrapping existing stellar/api helpers.
- New `cli/src/lib.ts` → side-effect-free SDK entry (importing it does NOT run the CLI).
- New `cli/src/agentcard.ts` → dependency-free **AgentCard v1.0** type surface +
  `validateAgentCard` + `AGENTCARD_VERSION`/`MAX_CARD_SIZE` (mirrors `api/src/types/agentcard.ts`).
- `cli/README.md` + `cli/LICENSE` (MIT) added → will render on npm page.
- `cli/src/config.ts`: default `apiUrl` → `https://api.orbitprotocol.dev` (was localhost),
  dotenv `quiet:true` to stop banner polluting CLI output.

Verified (Approach A — installed packed tarball in a clean temp dir):
- `orbit --help` / `--version` (0.1.0) work; no dotenv banner.
- ESM `import { ORBITAgent, validateAgentCard }` works; generateWallet → G…/S…;
  good card valid, bad card → 6 errors; no CLI side effect on import.
- Tarball = 12 kB / 33 files, includes dist + README + LICENSE.

### Remaining steps for the user (do after `npm login`)
```bash
# 1. Create npm account at npmjs.com, then:
npm login
npm whoami            # confirm logged in

# 2. Create the @orbit-protocol scope/org (free, public):
#    npmjs.com → top-right avatar → "Add Organization" → name: orbit-protocol → Free/public.
#    (Or publish under the scope directly if you own the username @orbit-protocol.)

# 3. Publish (run from cli/; prepublishOnly rebuilds dist):
cd cli
npm publish --access public

# 4. Approach B — post-publish smoke test in a clean dir:
cd $(mktemp -d) && npm init -y >/dev/null
npx @orbit-protocol/agent@latest --version
npx @orbit-protocol/agent@latest --help
```
Then record the npm URL above and in `06-evidence.md`.
