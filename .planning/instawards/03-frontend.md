# Job 03 — Frontend Redesign (port brand system to code)

Status: ✅ **DONE** (2026-06-09) · Deliverable: **D3** (quality) · **Do BEFORE Job 04 (deploy)**

## Why this is its own job (and comes before VPS)
The **live frontend has not adopted the ORBIT brand system** — it still uses white
buttons / generic greys. The redesign exists **only in Figma**, not in React yet.
The deployed site is the public face + D3 evidence (screenshots in Job 07, demo
video in Job 06), so the branded design must be live **before** we deploy once.

## Source of truth
- **`DESIGN.md`** (repo root) — code-facing brand reference; has a §6 token → `globals.css` mapping table.
- **Figma file** `ec8z21t3ueCyiysqmndCNI` (ORBIT — Brand Kit & Logo). Landing redesign mocks:
  - **Variant A — "page 12 · Web — Landing Redesign"** (page `51:2`, frame `51:3`): violet/rounded/friendly.
    Brand violet gradient CTAs (`#A78BFA→#7C3AED`), violet radial glow, icon chips, Inter + JetBrains Mono.
    Sections: Navbar `51:4` · Hero `51:22` · Ecosystem `54:2` · Identity&Reputation `54:15` ·
    How It Works `54:41` · Cross-Chain `56:2` · Pricing `56:23` · Dev Experience `58:2` · Final CTA `58:63` · Footer `58:73`.
  - **Variant B — "page 13 · Web — Landing / Terminal Style"** (page `72:2`, frame `72:3`): black/mono/terminal
    (Jatevo-style). Pure black `#050506`, JetBrains Mono everywhere, sharp corners, scanlines, terminal cards.
    Sections: Nav `72:4` · Hero `72:25` · Registry Marquee `74:2` · x402 Messaging `74:13` ·
    Verifiable Trust `75:2` · Integrate `77:2` · Final CTA `77:38` · Footer `77:51`.

## ✅ DECISIONS (locked 2026-06-08)
1. **Variant B — Terminal / mono** (Figma page 13 `72:2`, root `72:3`, Jatevo-style):
   pure black `#050506`, **JetBrains Mono everywhere** + Inter Bold for huge two-tone
   display headlines, **sharp corners (radius 0)**, faint scanlines + subtle violet glow,
   right-side terminal/flow cards (numbered steps, `● status` badges), mono code/JSON
   snippets, stat bars. Accent = violet (brand) + **green for verified/live**.
2. **Scope = landing + ALL pages**: bring directory, profile (`agents/[wallet]`), docs,
   create-agent, profile up to the terminal brand too (not just the landing page).

## Acceptance criteria
- [x] Approved variant ported to `frontend/src/app/page.tsx` (+ components), using `DESIGN.md` tokens in `globals.css`.
- [x] Directory, profile, docs pages visually consistent with the brand (per chosen scope).
- [x] Responsive (mobile + desktop); no regressions (all 6 routes → HTTP 200).
- [x] `tsc --noEmit` clean; `next build` green (9/9 routes prerendered).
- [x] Looks good against testnet data (sensible empty/loading states for directory).

## Approach
1. Confirm variant + scope (above).
2. Translate `DESIGN.md` §6 tokens into `frontend/src/app/globals.css` (colors, type, radius).
3. Build/port sections as React components; reuse brand-kit component library where practical.
4. Keep Privy auth wiring intact (don't break embedded wallet).
5. Verify locally (`pnpm dev`) + typecheck, then PR.

## Figma gotchas (from prior build, save time)
- An uncaught error in a `use_figma` call rolls back the whole call — build defensively.
- `figma.currentPage=` unsupported → `await figma.setCurrentPageAsync(page)`.
- Fetch root by id via `getNodeByIdAsync`; for full-width children use `layoutSizingHorizontal="FILL"`.

## Result (2026-06-09)
- **Variant chosen:** B — Terminal / mono (Figma page 13, `72:3`). Verified live against the
  Figma mock via screenshot (hero + monitor card match closely).
- **Design system → code:** rewrote `frontend/src/app/globals.css` as a terminal token system —
  pure black `#050506`, JetBrains Mono body + Inter Bold display headlines, **radius 0**, faint
  scanlines (`body::before`), violet glow, brand-gradient CTAs, `.term-card` / `.status-badge` /
  `.label-mono` / `.input-term` utilities. Fonts loaded self-hosted via `next/font/google`
  (Inter + JetBrains_Mono) in `layout.tsx`.
- **Pages updated (scope = ALL):**
  - `page.tsx` — full landing rebuilt to Variant B sections: hero (two-tone headline + cursor +
    network-monitor terminal card), registry marquee, x402 messaging 4-card grid, Verifiable Trust
    (verification-flow terminal), Integrate (code terminal + checklist), final CTA, live ticker.
  - `Navbar.tsx`, `Footer.tsx` — terminal restyle (full-width sharp bar, mono links, column footer).
  - New `components/Logo.tsx` — Constellation mark (gradient stroke) used in nav/footer/cards.
  - `AgentCard.tsx`, `agents/page.tsx` (registry), `agents/[wallet]/page.tsx` (profile),
    `docs/page.tsx`, `create-agent/page.tsx`, `profile/page.tsx`, `security/page.tsx` — restyled.
  - `Providers.tsx` — Privy accent → brand violet `#8B5CF6`.
- **Verified:** `tsc --noEmit` clean · `next build` green (9/9) · all 6 routes HTTP 200 · live
  screenshot of hero + docs confirms brand fidelity. Privy auth wiring left intact.
- **Notes / follow-ups (out of scope, flagged separately):**
  1. `docs/page.tsx` still cites the **old package name** `@orbit-protocol/cli` in install/quickstart
     commands — should be `@orbit-protocol/agent` (renamed in Job 2).
  2. `create-agent/page.tsx` `handleRegister` posts to a **hardcoded `http://localhost:3001`** — must
     use `NEXT_PUBLIC_API_URL` (via `lib/api`) before the deployed site works (Job 4).
  3. `.claude/launch.json` (dev-preview helper) left untracked, not committed.
