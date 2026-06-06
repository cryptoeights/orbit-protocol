# Job 02 — Rename SDK → `@orbit-protocol/agent` + Publish to npm

Status: ⬜ TODO · Deliverable: **D2**

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
- npm URL:
- Published version:
