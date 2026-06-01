# CafeHookahPub Website — CLAUDE.md

## Project Overview

Premium venue website for **Cafe Hookah Pub**, located in **Alsancak, İzmir, Turkey**.
This is a static marketing/menu site — no ordering, no cart, no backend auth.
Forked from the MISE SaaS repo; all QR/KDS/ordering code has been stripped.

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Bun |
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind v4 (CSS-based config via `@theme` in `index.css` — no `tailwind.config.js`) |
| Animation | Framer Motion v12 |
| Routing | React Router v7 with `AnimatePresence` page transitions |
| i18n | i18next + react-i18next (6 languages) |
| State | React `useState` only (no Zustand, no Redux) |

## Project Structure

```
src/
├── App.tsx                      # AnimatePresence + Routes
├── main.tsx                     # imports i18n BEFORE index.css
├── index.css                    # Google Fonts → Tailwind → custom keyframes
├── i18n/
│   ├── index.ts                 # i18next init, localStorage persistence (key: chp_lang)
│   └── locales/                 # en, tr, es, it, ru, ar
├── lib/
│   ├── animations.ts            # Framer Motion variants (fadeUp, stagger, scaleIn, etc.)
│   └── utils.ts
├── constants/
│   └── menu.ts                  # FOOD_MENU + DRINKS_MENU static data (₺ prices)
├── components/
│   ├── LanguageSwitcher.tsx     # Dropdown, RTL-aware (end-0, ms-auto), sets dir on <html>
│   └── layout/
│       ├── Navbar.tsx           # Fixed top, mobile overlay, LanguageSwitcher in top bar
│       ├── Footer.tsx
│       └── PageWrapper.tsx      # Wraps every page with pageVariants motion
└── pages/
    ├── Home/Home.tsx
    ├── About/About.tsx
    └── Menu/
        ├── MenuHub.tsx
        ├── HookahBuilder/HookahBuilder.tsx   # Star feature — 3-step blend builder
        ├── FoodMenu/FoodMenu.tsx
        └── DrinksMenu/DrinksMenu.tsx
```

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/menu` | MenuHub (3-card hub) |
| `/menu/hookah` | HookahBuilder |
| `/menu/food` | FoodMenu |
| `/menu/drinks` | DrinksMenu |
| `/about` | About |
| `*` | → Home |

## Design System

- **Background:** `bg-stone-950` (#0c0a09)
- **Accent:** `amber-400` (#fbbf24)
- **Text:** white / `zinc-400` / `zinc-500`
- **Font display:** Bebas Neue (all-caps, from Google Fonts) via `font-display` utility
- **Font body:** Inter
- **Border radius:** `rounded-2xl` throughout
- **Card pattern:** `bg-zinc-900 border border-zinc-800` with amber hover glow

## i18n

- 8 languages: `en`, `tr`, `es`, `it`, `ru`, `ar`, `de`, `el`
- Arabic (`ar`) uses RTL — `document.documentElement.dir = 'rtl'` set in LanguageSwitcher
- Use logical CSS properties for RTL-safe layout: `end-0`, `ms-auto`, `text-start`
- Language persisted to `localStorage` key `chp_lang`
- **Import order in main.tsx:** `import './i18n'` MUST come before `import './index.css'`
- All page strings use `useTranslation()` — never hardcode display text

## CSS Rules

- Google Fonts `@import url(...)` MUST come BEFORE `@import "tailwindcss"` in `index.css`
- Custom theme vars live in `@theme {}` block (Tailwind v4 — no tailwind.config.js)
- Custom animations: `animate-float`, `animate-float-delayed`, `animate-fade-up-1..5`

## Animation Patterns

- Page transitions: `AnimatePresence mode="wait"` in App.tsx + `PageWrapper` on every page
- Scroll reveals: `whileInView` + `viewport={{ once: true, margin: '-60px' }}`
- Stagger grids: `variants={stagger}` on parent, `variants={scaleIn/fadeUp}` on children
- HookahBuilder step 3: `AnimatePresence` for slide-in when aromas selected
- All variants imported from `src/lib/animations.ts`

## HookahBuilder — Key Behaviour

- 3-step UI: Model selection → Aroma category tabs → Percentage sliders
- Aroma categories: `fruity`, `minty`, `floral`, `exotic`, `tobacco`
- `MODELS` and `CATEGORIES` arrays are defined **inside** the component (need `t()`)
- `CATEGORY_KEYS` constant is module-level (just the key strings)
- Progress ring: SVG, 34px radius, turns green at 100%
- `HookahVisual` component glows with primary aroma color

## Menu Data

- `FOOD_MENU` in `constants/menu.ts`: starters / mains / desserts, all ₺ prices
- `DRINKS_MENU`: cocktails / spirits / mocktails / wine
- Category `id` maps directly to i18n key: `t('food.starters')`, `t('drinks.cocktails')`, etc.
- Menu items (name, desc, price) are hardcoded in English — ready to be replaced with real data

## Build

```bash
bun run build   # tsc -b && vite build → dist/
bun run dev     # dev server
```

Build must produce 0 TypeScript errors and 0 Vite warnings.

## Location & Hours

- **Address:** Alsancak, İzmir, Turkey
- Mon–Thu: 5 PM – 2 AM
- Fri–Sat: 4 PM – 4 AM
- Sun: 5 PM – 1 AM
- Phone placeholder: `+90000000000` (update when real number provided)

## Known Issues & Next Steps (from 2026-05-18 audit)

### 🔴 Blockers
1. Delete `src/services/api/client.ts` + `src/types/entity.types.ts` (dead MISE SaaS code)
2. Remove unused packages: `socket.io-client`, `@tanstack/react-query`, `react-hook-form`, `zod`, `qrcode`, `date-fns`, `axios`
3. Add SEO meta tags to `index.html` (description, og:*, Twitter cards) — title fixed, `<meta name="generator" content="MISE">` added; og:* and Twitter cards still missing
4. Fix `.env` — localhost URLs will break Vercel deploy; add real values or remove
5. Add `vercel.json` for SPA routing
6. Fix `updatePct()` in HookahBuilder — no clamp, slider can push total past 100%

### 🟡 High Priority
7. Create `src/constants/venue.ts` — centralise phone, address, mapUrl (currently `+90000000000` everywhere)
8. Add social links to Footer (Instagram, TikTok)
9. Fix hardcoded i18n strings: Navbar/HookahBuilder `aria-label`, Footer operating hour times
10. Fix RTL gradients — `bg-gradient-to-r/l` need `rtl:` variants for Arabic
11. Add 404 page (current `*` route silently redirects to Home)
12. Wire up "Order This Blend" button (WhatsApp link or reservation modal)

### 🟢 Medium Priority
13. Persist HookahBuilder blend to localStorage
14. Add Contact / Reservation page
15. Add `public/robots.txt` + `public/sitemap.xml`
16. Add Schema.org local business JSON-LD to `index.html`
17. Extract AROMAS/MODELS to `src/constants/aromas.ts` + `hookahModels.ts`

### ⚪ Low Priority
18. Gallery / photo section
19. Events / promotions page
20. Vercel Analytics

## Developer Attribution (MISE)

- `index.html` carries `<meta name="generator" content="MISE">` and `<!-- Built on MISE Platform -->` HTML comment
- Footer bottom has `DEVELOPED BY MISE` in `text-zinc-800` (invisible at a glance, reveals on hover) — do not remove
- Page title: `Cafe Hookah Pub — Alsancak, İzmir`

## What NOT to do

- Do not add cart, ordering, QR codes, KDS, admin panels, or any SaaS features
- Do not use `tailwind.config.js` — this is Tailwind v4 with CSS-based config
- Do not use `<em>` inside Bebas Neue headings (all-caps font, italic renders wrong — use `<span>` with color class instead)
- Do not hardcode display strings — always use `t('key')` from `useTranslation()`
- Do not place `import './i18n'` after `import './index.css'` in main.tsx

## Knowledge Graph

A graphify knowledge graph of this codebase lives at:
`src/graphify-out/graph.json` — interactive HTML at `src/graphify-out/graph.html`
Run `/graphify E:\mise_chp\mise-frontend\src --update` after significant changes.
