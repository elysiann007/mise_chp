# CafeHookahPub (mise_chp) — Claude Context

This is **mise_chp** — a fork of MISE repurposed as a premium venue website for **CafeHookahPub**, serving food, hookah, and alcoholic beverages. **This is NOT the restaurant SaaS.** No QR ordering, no multi-tenant, no sessions — completely different product.

---

## Project Vision

A stunning, game-like website where guests discover the venue and interact with the menu. The hookah builder is the centrepiece — users compose their own hookah blend visually before visiting. Design is dark, moody, premium: yellow × black × white.

---

## Stack

- **Backend**: NestJS 11 + TypeScript, PostgreSQL 18, TypeORM 0.3
- **Frontend**: React 19 + TypeScript, Vite, Zustand 5, React Router 7, Axios
- **CSS**: Tailwind v4 — yellow/black/white design system only
- **Runtime**: Bun
- **Locations**: `E:\mise_chp\mise-backend` and `E:\mise_chp\mise-frontend`

## Dev Commands

```powershell
# Backend (port 3000) — from E:\mise_chp\mise-backend
bun run start:dev

# Frontend (port 5173) — from E:\mise_chp\mise-frontend
bun dev
```

---

## Design System

**Palette — strict, no exceptions:**
| Role | Class |
|------|-------|
| Background (dark base) | `zinc-950`, `stone-950` |
| Surface / cards | `zinc-900`, `zinc-800` |
| Primary accent | `amber-400`, `yellow-300` |
| Strong accent | `amber-500`, `yellow-400` |
| Text primary | `white` |
| Text secondary | `zinc-300`, `zinc-400` |
| Borders | `zinc-700`, `amber-500/30` |

- **NEVER** use `gray-*` — use `zinc-*` or `stone-*`
- **NEVER** use blue, green, purple, or red as primary colors
- Glow effects use `amber-400/20` or `yellow-300/10` shadows
- Typography: bold, large, editorial — not neutral/corporate

---

## Interactive Hookah Builder (Core Feature)

The hookah menu is a gamified builder — the star of the site:

1. **Model selection** — user picks a hookah model; visual (3D or animated illustration) updates
2. **Aroma categories** — Fruity / Minty / Floral / Exotic / Classic Tobacco
3. **Blend composition** — add multiple aromas; each has a percentage slider
4. **Live validation** — total must equal 100%; visual progress ring shows remaining %
5. **Visual feedback** — smoke color, glow, particle effects change based on aroma mix
6. **Share / Save** — user can copy or screenshot their blend

---

## Frontend Pages

| Route | Purpose |
|-------|---------|
| `/` | Full-screen hero — atmospheric, mood video or GSAP animation, bold CTA |
| `/menu` | Three pillars: Hookah / Food / Drinks |
| `/menu/hookah` | Gamified hookah builder |
| `/menu/food` | Atmospheric card scroll with imagery |
| `/menu/drinks` | Cocktail/beverage menu with animated visuals |
| `/about` | Venue story, atmosphere, vibe |
| `/reservation` | Future phase |

---

## Skills to Use

**Session skills (invoke via `/skill-name`):**
- `/frontend:design-review` — before every major UI milestone
- `/frontend:tailwind-theme-builder` — theme setup
- `/frontend:design-system` — consistent design language
- `/frontend:design-loop` — iterative visual design
- `/frontend:landing-page` — hero section
- `/frontend:product-showcase` — menu showcase layout
- `/design-assets:color-palette` — generate full yellow/black/white palette
- `/design-assets:icon-set-generator` — hookah/food/drink icon set
- `/design-assets:ai-image-generator` — atmospheric venue imagery
- `/dev-tools:ux-audit` — UX quality on menu flows
- `/dev-tools:responsiveness-check` — mobile must be flawless
- `/graphify` — codebase mapping and architecture

**Project-level skills (always active):**
`ui-ux-pro-max`, `react-patterns`, `shadcn`, `tailwind-theme-builder`, `webapp-testing`, `security-review`, `deep-research`, `nestjs-best-practices`, `graphify`

---

## Code Style Rules

- No comments explaining WHAT the code does — only WHY when non-obvious.
- No trailing summaries after edits.
- No features beyond what the task requires.
- No abstractions for hypothetical future needs.
- No error handling for impossible internal scenarios — only validate at boundaries.
- Delete dead code completely — no `_unused`, no `// removed` markers.

---

## TypeScript Rules

- `import type` for all type-only imports (`verbatimModuleSyntax` enabled).
- Prefer `type` over `interface` for API shapes; `interface` for things that extend.
- `as any` only for known library type-gap workarounds.

---

## NestJS / Backend Rules

- Throw `BusinessException(code, HttpStatus, detail)` for domain errors — never raw `Error`.
- `BusinessException` codes are SCREAMING_SNAKE_CASE strings.
- DTOs in `module/dto/`, validated with `class-validator`, global pipe has `whitelist: true`.
- Never `await repo.save()` inside a loop — batch saves.
- No queries inside `for` or `.map()` — hoist reads above loops.

---

## React / Frontend Rules

- Tailwind only — no inline styles, no CSS modules.
- All color tokens from the design system above — never hardcode hex values.
- Zustand for global state — no prop drilling beyond 2 levels.
- Animation: prefer CSS transitions + Tailwind `transition-*` for simple cases; use GSAP or Framer Motion for the hookah builder.
- Mobile-first: design for 390px viewport first, then scale up.
