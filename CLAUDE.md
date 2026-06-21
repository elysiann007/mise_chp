# CafeHookahPub (mise_chp) — Claude Context

This is **mise_chp** — a premium venue website for **Cafe Hookah Pub**, serving food, hookah, and alcoholic beverages. **This is NOT the restaurant SaaS.** No QR ordering, no multi-tenant, no sessions — completely different product.

---

## Project Vision

A dark, premium, game-like website where guests discover the venue and interact with the menu. The hookah builder is the centrepiece — users compose their own hookah blend from real tobacco brands and aromas. Design: amber × black × white.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript, Vite 8, React Router 7 |
| CSS | Tailwind v4 — amber/zinc/stone design system only |
| Animation | Framer Motion |
| i18n | i18next — 8 languages: TR, EN, DE, AR, EL, ES, IT, RU |
| AI Chatbot | Gemini 2.5 Flash Lite via Bun dev server (dev) / Vercel Edge Function (prod) |
| Runtime | Bun |

**Locations:**
- Frontend: `E:\mise_chp\mise-frontend`
- Backend (old MISE SaaS — not used by this site): `E:\mise_chp\mise-backend`

---

## Dev Commands

```powershell
# Frontend + AI server together (recommended)
cd E:\mise_chp\mise-frontend
bun run dev:all        # Vite on :5173 + Gemini API server on :3001

# Separately:
bun dev                # Vite only
bun run dev:api        # Gemini API server only (port 3001)

# Production build
bun run build
```

---

## Venue Info (source of truth: `src/constants/venue.ts`)

```ts
VENUE = {
  name:      'Cafe Hookah Pub',
  phone:     '+90 506 026 08 75',   // tel: links everywhere, Gemini prompt
  address:   'Alsancak, İzmir, Türkiye',
  lat:       38.4356142,
  lng:       27.1405841,
  mapUrl:    'https://www.google.com/maps/...',
  instagram: '',   // fill when ready
  tiktok:    '',   // fill when ready
}
```

**Phone is wired to:** Navbar "Reserve a Table" button, Footer, Home location section, Gemini AI prompt. Update `venue.ts` once — everything updates.

---

## AI Chatbot (Hookah AI)

- **Model:** `gemini-2.5-flash-lite` (free tier, stable)
- **Dev server:** `mise-frontend/dev-server.ts` → Bun HTTP server on port 3001
- **Edge Function:** `mise-frontend/api/chat.ts` → Vercel Edge Function for production
- **System prompt:** `mise-frontend/api/_prompt.ts` — contains real menu data, prices, phone, hours
- **Vite proxy:** `/api` → `http://localhost:3001`
- **Env var:** `GEMINI_API_KEY` in `mise-frontend/.env`
- **Frontend component:** `src/components/ChatBot/ChatBot.tsx`
- **Brand:** "Hookah AI" — do NOT use "CHP" anywhere (political connotation in Turkey)

---

## Frontend Pages

| Route | Purpose |
|-------|---------|
| `/` | Full-screen hero, pillars (hookah/food/drinks), stats, hours, location + phone |
| `/menu` | Three pillars: Hookah / Food / Drinks |
| `/menu/hookah` | Gamified hookah blend builder |
| `/menu/food` | Full-scroll atmospheric food menu |
| `/menu/drinks` | Full-scroll drinks menu |
| `/about` | Venue story |
| `*` | 404 NotFound page |

---

## Hookah Builder (`/menu/hookah`)

**5 real brands from physical menu:**

| Brand | Price | # Aromas |
|-------|-------|----------|
| Revoshi | ₺500 | 27 |
| Hookah Special | ₺500 | 5 (Ice Cream series) |
| Al Fakher | ₺500 | 3 |
| Nakhla | ₺550 | 3 |
| Adalya | ₺500 | 8 |

**UX flow:**
1. Pick tobacco brand (step 1) → switches aroma browser tab
2. Browse aromas by brand tab (step 2) — can cross-brand mix
3. Set percentages (step 3) — clamped, total cannot exceed 100%
4. When 100% complete → static text "Siparişiniz için garson çağırın" (no button, no WhatsApp)
5. Blend persists in `localStorage` (`chp-blend`, `chp-model`)

**Data source:** `src/constants/menu.ts` (FOOD_MENU, DRINKS_MENU). Hookah brands/aromas are hardcoded in `HookahBuilder.tsx`.

---

## Menu Data (`src/constants/menu.ts`)

All items transcribed from physical menu photos. Structure:
```ts
FOOD_MENU = [{ id, category, items: [{ key, name, desc, price }] }]
DRINKS_MENU = [{ id, category, items: [{ key, name, desc, price }] }]
```

Food categories: breakfast, toasts, boritos, salads, burgers, pizzas, chicken, meatballs, hot_starters, pasta, nuts, desserts

Drinks categories: herbal_teas, teas, sahlep, cold_drinks, special_coffees, cold_coffees, turkish_coffees, hot_chocolate, cold_chocolate, frozen, smoothies, cocktails, aperitifs, wines, import_spirits, whiskeys, raki, beers

---

## Key Files

```
mise-frontend/
├── api/
│   ├── chat.ts          # Vercel Edge Function (production chat)
│   └── _prompt.ts       # Gemini system prompt — keep menu data current
├── dev-server.ts         # Bun local API server (port 3001)
├── vercel.json           # SPA rewrite (non-api routes → index.html)
├── public/
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── constants/
    │   ├── venue.ts      # Single source of truth for venue data
    │   └── menu.ts       # Full food + drinks menu data
    ├── components/
    │   ├── ChatBot/ChatBot.tsx
    │   ├── layout/Navbar.tsx
    │   └── layout/Footer.tsx
    ├── pages/
    │   ├── Home/Home.tsx
    │   ├── Menu/MenuHub.tsx
    │   ├── Menu/HookahBuilder/HookahBuilder.tsx
    │   ├── Menu/FoodMenu/FoodMenu.tsx
    │   ├── Menu/DrinksMenu/DrinksMenu.tsx
    │   ├── About/About.tsx
    │   └── NotFound/NotFound.tsx
    └── i18n/locales/     # en tr de ar el es it ru
```

---

## Design System

**Palette — strict, no exceptions:**

| Role | Class |
|------|-------|
| Background | `zinc-950`, `stone-950` |
| Surface / cards | `zinc-900`, `zinc-800` |
| Primary accent | `amber-400`, `yellow-300` |
| Strong accent | `amber-500`, `yellow-400` |
| Text primary | `white` |
| Text secondary | `zinc-300`, `zinc-400` |
| Borders | `zinc-700`, `amber-500/30` |

- **NEVER** `gray-*` — use `zinc-*` or `stone-*`
- **NEVER** blue, green, purple, red as primary colors
- **NEVER** "CHP" anywhere — political connotation in TR; use ◎ for logo badge, "Hookah AI" for chatbot
- Glow: `amber-400/20` or `yellow-300/10`
- Aroma colors in HookahBuilder are functional data-vis colors (hex in `style={}`) — acceptable exception

---

## i18n Rules

- 10 locales: `en tr de ar el es it ru az fa`
- All keys must exist in all 10 files
- `hookah.order` = static waiter-call text (not a button), translated in all 8
- Arabic (ar) uses RTL — `end-*` / `start-*` / `ms-*` / `me-*` Tailwind logical props
- Brand names (Revoshi, Al Fakher, etc.) are NOT translated — hardcoded in component

---

## Code Style Rules

- No comments explaining WHAT the code does — only WHY when non-obvious.
- No trailing summaries after edits.
- No features beyond what the task requires.
- No abstractions for hypothetical future needs.
- Delete dead code completely — no `_unused`, no `// removed` markers.
- Tailwind only — no inline styles except functional data-vis (aroma colors).
- Mobile-first: design for 390px viewport first, then scale up.

---

## TypeScript Rules

- `import type` for all type-only imports (`verbatimModuleSyntax` enabled).
- Prefer `type` over `interface` for API shapes; `interface` for things that extend.
- `as any` only for known library type-gap workarounds.

---

## Future TODOs

- **CMS / Owner Admin Panel:** Owner currently edits `menu.ts` or GitHub directly. Future option: integrate Sanity (headless CMS) so owner can manage menu items, prices, and categories from a clean web dashboard with no coding. Short-term workaround: teach owner GitHub editor (edit file → commit → Vercel auto-deploys in 60s).

---

## What NOT to Touch

- `mise-backend/` — old MISE SaaS backend, not used by this site. The chat endpoint is handled by `dev-server.ts` (dev) and `api/chat.ts` (prod), not the NestJS backend.
- `src/services/`, `src/types/entity.types.ts` — deleted dead MISE files, don't recreate.
- `src/lib/utils.ts` — deleted (unused `cn` helper), don't recreate.
