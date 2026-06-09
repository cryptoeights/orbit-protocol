# Job 03 — Frontend Redesign (port brand system to code)

Status: ⬜ TODO · Deliverable: **D3** (quality) · **Do BEFORE Job 04 (deploy)**

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
- [ ] Approved variant ported to `frontend/src/app/page.tsx` (+ components), using `DESIGN.md` tokens in `globals.css`.
- [ ] Directory, profile, docs pages visually consistent with the brand (per chosen scope).
- [ ] Responsive (mobile + desktop); no regressions.
- [ ] `pnpm exec tsc --noEmit` clean; CI green.
- [ ] Looks good against testnet data (or sensible empty states).

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

## Result (fill at end of chat)
- Variant chosen:
- Pages updated:
- Notes:
