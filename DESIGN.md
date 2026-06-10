# ORBIT — Design System & Brand Guidelines

> Single source of truth for ORBIT's visual identity. Use this for any design, UI, or
> frontend work (incl. redesigns). The master/editable version lives in Figma; this file
> is the durable, code-facing reference.

**Figma file:** https://www.figma.com/design/ec8z21t3ueCyiysqmndCNI (ORBIT — Brand Kit & Logo)
**Owner:** Crypto Eights (cryptoeights@gmail.com) · team `team::1168000604439449895`
**Official domain:** `orbitprotocol.dev` · social handle `@orbitprotocol`

ORBIT = **Identity Infrastructure for AI Agents on Stellar** (verifiable on-chain identity,
reputation, soulbound passports via Soroban). The visual language is **dark-first, cosmic,
credible** — proof over hype.

---

## 1. Logo

**Mark: "Constellation"** — two crossing tilted ellipses (orbits) + a central core + two
nodes (large top-right, small bottom-left). It reads as an agent network / orbital system.

- Built as vector. Reference SVG (200×200 viewBox):
  ```
  <ellipse cx="100" cy="100" rx="88" ry="33" transform="rotate(25 100 100)" fill="none" stroke="{stroke}" stroke-width="8"/>
  <ellipse cx="100" cy="100" rx="88" ry="33" transform="rotate(-25 100 100)" fill="none" stroke="{stroke}" stroke-width="8"/>
  <circle cx="100" cy="100" r="16" fill="{stroke}"/>
  <circle cx="180" cy="63"  r="11" fill="{node}"/>
  <circle cx="20"  cy="137" r="7"  fill="{node}"/>
  ```
- **Colour variants:** Full-colour (gradient stroke, `{node}` = white) is primary on dark.
  On light backgrounds use the gradient stroke with `{node}` = `#1A1726` (dark nodes).
  Mono-white and mono-black for single-colour contexts. Gradient-filled rounded square = app icon.
- **Clear space:** ≥ the core diameter (X) on all sides. **Min size:** icon-only down to 16px (favicon).
- **Don't:** recolour off-brand, rotate, stretch, add effects, or swap the wordmark font.

---

## 2. Colour

Dark-first palette. Hex values are canonical.

### Primary — Violet
| Token | Hex | Use |
|-------|-----|-----|
| Violet 400 | `#A78BFA` | gradient start, accents |
| **Violet 500 (base)** | `#8B5CF6` | primary actions, brand |
| Violet 600 | `#7C3AED` | gradient end, hover |
| 50/100/200/300/700/800/900 | `#F5F3FF`/`#EDE9FE`/`#DDD6FE`/`#C4B5FD`/`#6D28D9`/`#5B21B6`/`#4C1D95` | tints & shades |

**Brand gradient:** `linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)` — logo, hero accents, key CTAs only.

### Neutral — Dark UI
| Role | Hex |
|------|-----|
| Background | `#0A0A0A` |
| Surface (card) | `#111113` |
| Surface hover | `#161618` |
| Border subtle | `#1E1E22` |
| Border | `#262630` |
| Text muted | `#6A6A72` |
| Text secondary | `#9A9AA2` |
| Text primary | `#F5F5F5` |
| White | `#FFFFFF` |

### Semantic
Success `#22C55E` · Info `#3B82F6` · Warning `#F59E0B` · Error `#EF4444` · Highlight `#A855F7`

### Light theme tokens (for on-light surfaces / light mode)
Background `#F4F3F8` · Ink `#1A1726` · Sub `#5A5668` · Border `#E4E1EC`

### Trust-tier colours (ORBIT-specific)
Tier 0 Unverified → muted grey · Tier 1 Basic → blue · Tier 2 Verified → green · **Tier 3 Trusted → brand gradient.**

---

## 3. Typography

**Inter** is the single brand typeface. **JetBrains Mono** is the companion for code, hashes & addresses.

| Style | Weight | Size / line-height |
|-------|--------|--------------------|
| Display | Bold | 48 / 56 |
| Heading 1 | Bold | 36 / 44 |
| Heading 2 | Semi Bold | 28 / 36 |
| Heading 3 | Semi Bold | 22 / 30 |
| Body Large | Regular | 18 / 28 |
| Body | Regular | 16 / 24 |
| Body Small | Regular | 14 / 20 |
| Caption | Medium | 12 / 16 (tracked +2) |
| Label | Semi Bold | 13 / 18 |

Principles: clear over clever, one idea per block, generous spacing, 8px spacing system.

---

## 4. Components (in Figma "00 · Component Library")

Master components with variants — reuse, don't rebuild:

- **Button** — Type (Primary gradient / Secondary outline / Ghost) × Size (S/M/L). Radius 10.
- **Trust-tier Badge** — Tier 0–3 (Tier 3 = gradient). Pill, 7px dot + tracked caps label.
- **Status Badge** — Verified / Pending / Failed / On-chain.
- **Agent Card** — avatar (mark) · name.orbit · address · tier badge · reputation/verifications · CTA.
- **Input** — Default / Focused (focus = 1.5px violet border + soft ring).
- **Navbar** — glass (`rgba(14,14,18,.85)` + blur) · logo lockup · links · gradient Connect CTA.
- **Logo Icon** / **Logo Lockup**.

Reusable styles exist as Figma **Paint Styles** (`Violet/*`, `Neutral/*`, `Semantic/*`, `Light/*`,
`Brand/Gradient`), **Text Styles** (names above), and a **Variables** collection `ORBIT Tokens`
with **Dark & Light modes**.

---

## 5. Textures & motifs
- **Dot-grid background:** radial dots on a 24px grid at 8–12% opacity (white on dark, dark on light). Heroes & empty states.
- **Glow:** large blurred violet ellipse behind hero content (opacity ~16%).
- **Iconography:** line icons, 24px grid, 2px stroke, round caps/joins, lilac (`#C9B8FF`) or ink stroke.

---

## 6. Mapping to the frontend (`frontend/src/app/globals.css`)

The current frontend already ships dark tokens. To align with this system on a redesign:

| globals.css var | Current | Brand-aligned target |
|-----------------|---------|----------------------|
| `--bg-primary` | `#0a0a0a` | `#0A0A0A` ✓ |
| `--bg-card` | `#111111` | `#111113` |
| `--bg-card-hover` | `#161616` | `#161618` |
| `--border-subtle` | `#1e1e1e` | `#1E1E22` |
| `--border-card` | `#252525` | `#262630` |
| `--text-primary` | `#f5f5f5` | `#F5F5F5` ✓ |
| `--text-secondary` | `#999999` | `#9A9AA2` |
| `--text-muted` | `#666666` | `#6A6A72` |
| `--accent-purple` | `#a855f7` | **`#8B5CF6`** (Violet 500) — primary; keep `#A855F7` as `--accent-highlight` |
| `--accent-green/orange/blue` | as-is | map to Semantic Success/Warning/Info |

Add: brand gradient utility, dot-grid pattern (already present as `.dot-grid`), and the Inter +
JetBrains Mono font stack. Prefer the brand violet (`#8B5CF6`/gradient) for primary actions over
the legacy `#a855f7`.

---

## 7. Brand & content guidelines

- **Positioning:** "ORBIT is the identity layer for AI agents." Verifiable · open · fast & frictionless · accountable.
- **Voice:** clear (not hypey), technical but accessible, confident & credible, builder/community-first.
- **Content pillars (rough weekly mix):** Educate 40% · Build 25% · Grow 20% · Engage 15%.
- **Post types:** explainer, product update, milestone, build-in-public, deep-dive, tutorial,
  social proof, ecosystem, AMA, hot take, meme, tokenomics, contest, recap.
- **Don't:** talk price / imply financial returns, copy-paste shill, post without a hook or visual.

Full SMM template suite (feed 1:1, X 16:9, story 1080×1920, carousel, highlight covers, feed-grid
preview, content calendar) lives in Figma pages 09–11 as components.

---

## Figma page map
`01 Logo System` · `02 Colour & Type` · `03 UI Components` · `04 Iconography` ·
`05 Applications` · `06 About ORBIT` · `07 Content & Post Guidelines` · `08 Social Media` ·
`09 Post Templates` · `10 Stories & Highlights` · `11 Carousel & Feed` · `00 Component Library`.
