# MISE — Claude Context

Restaurant management SaaS. Multi-tenant. Turkey (İzmir). MVP only.

## Stack
- **Backend**: NestJS 11 + TypeScript, PostgreSQL 18, TypeORM 0.3, Redis, Socket.io
- **Frontend**: React 19 + TypeScript, Vite, Zustand 5, React Router 7, Axios, qrcode
- **Runtime**: Bun (package manager + frontend dev server), Node.js (NestJS runtime)
- **Payments**: iyzico (3DS Hosted Form) — not yet built
- **Fiscal**: Paraşüt API (e-Arşiv / e-Fatura) — not yet built
- **Location**: `E:\mise\mise-backend` and `E:\mise\mise-frontend`

## Dev Commands
```powershell
# Backend (port 3000) — from E:\mise\mise-backend
bun run start:dev

# Frontend (port 5173) — from E:\mise\mise-frontend
bun dev

# Local PostgreSQL — already running on port 5432, no Docker needed
# psql path: C:\Program Files\PostgreSQL\18\bin\psql.exe
# DB: mise_db  user: mise  password: mise_dev_password
```

> Docker Compose (`E:\mise\docker-compose.yml`) exists for postgres+redis but
> user has PostgreSQL 18 installed locally. Use Docker only for Redis if needed.

## Local DB Setup (already applied — for reference)
```powershell
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = ""   # postgres superuser has blank password
& $psql -U postgres -h localhost -p 5432 -c "CREATE USER mise WITH PASSWORD 'mise_dev_password';"
& $psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE mise_db OWNER mise;"
$env:PGPASSWORD = "mise_dev_password"
& $psql -U mise -h localhost -p 5432 -d mise_db -f "E:\mise\mise-backend\schema.sql"
& $psql -U mise -h localhost -p 5432 -d mise_db -f "E:\mise\mise-backend\seed.sql"
```

## Test Credentials
| Email | Password | Role | Use |
|-------|----------|------|-----|
| admin@mise.test | admin123 | admin | Admin panel `/admin` |
| kitchen@mise.test | admin123 | kitchen | KDS `/kitchen` |

Test restaurant: `a1111111-0000-0000-0000-000000000001`  
Test tables: QR tokens `QR-TABLE-01`, `QR-TABLE-02`, `QR-TABLE-03`

## Key Business Rules (never skip these)
1. **Price snapshot** — freeze `unitPriceSnapshot`, `kdzRateSnapshot`, `otvRateSnapshot`, `nameSnapshot` at order time. Never recalculate from live menu.
2. **KDV** — food/non-alcohol: 10%, alcohol: 20%. ÖTV is separate for alcohol.
3. **Alcohol block** — reject orders with `isAlcohol=true` between 22:00–06:00.
4. **Session TTL** — 4 hours from `openedAt`. Return 410 GONE after expiry.
5. **Multi-tenant** — every query must scope by `restaurantId`. Staff get it from JWT, customers from session lookup.
6. **KVKK** — only collect customer TCKN/VKN if they explicitly request fatura. Store `consentGivenAt`.
7. **Fiscal async** — payment success → queue job → Paraşüt XML → save ETTN. Never block payment response on fiscal.
8. **Currency** — always TRY, display as `₺45,50` (tr-TR locale).

## API Base
`/api/v1/` — no auth on customer routes, JWT Bearer required on all staff/admin routes.

## Database Entities & Tables
```
restaurants
users                        ← staff accounts, scoped to restaurant
tables                       ← qrToken is the UUID used in QR codes
table_sessions
orders → order_items → order_item_modifiers
order_events
menu_categories → menu_items → modifier_groups → modifiers
```
Schema SQL: `E:\mise\mise-backend\schema.sql`  
Seed SQL:   `E:\mise\mise-backend\seed.sql`

## What's Built (MVP progress)
- [x] Project scaffold — monorepo at `E:\mise`
- [x] Docker Compose — postgres + redis (optional, user has local PG)
- [x] All TypeORM entities (11 tables + User entity)
- [x] Local PostgreSQL 18 — schema applied, seed data loaded
- [x] Sessions module — `POST /api/v1/sessions`, `GET /api/v1/sessions/:token`
- [x] Orders module — `POST /api/v1/sessions/:token/orders`, `GET /api/v1/sessions/:token/orders`, `GET /api/v1/orders/:id`
- [x] WebSocket gateway — Socket.io `/orders` namespace; rooms: `kitchen:{restaurantId}`, `session:{token}`; events: `order:placed`, `order:status-changed`, `order:ready`
- [x] Customer flow UI — QRScanner → Menu → ItemDetail → Cart → OrderTracking (pages/customer/)
- [x] Auth module — `POST /api/v1/auth/login` → JWT; `JwtAuthGuard`, `RolesGuard`, `@CurrentUser`, `@Roles` decorators
- [x] Kitchen Display System — `GET /api/v1/kitchen/orders?station=kitchen|bar`, `PATCH /api/v1/kitchen/items/:id/status`; `/kitchen` frontend page (dark KDS, tap to advance status, real-time WS)
- [x] Admin panel — `/admin/dashboard`, `/admin/menu`, `/admin/tables`
  - Dashboard: active sessions, today's orders
  - Menu manager: categories + items + modifier groups + modifiers (full CRUD inline)
  - Table manager: CRUD with live QR code canvas
- [ ] Bills & payments (iyzico 3DS)
- [ ] Fiscal documents (Paraşüt e-Arşiv)

## Folder Map
```
mise-backend/src/
  database/
    entities/        restaurant, table, table-session, menu-category, menu-item,
                     modifier-group, modifier, order, order-item,
                     order-item-modifier, order-event, user
  sessions/          QR → open/validate session
  orders/            place order, get order, get session orders
  kitchen/           KDS active orders, item status update
  admin/             dashboard, menu CRUD, table CRUD
  auth/
    strategies/      jwt.strategy.ts
    types/           jwt-payload.type.ts
    dto/             login.dto.ts
  websocket/         OrdersGateway (Socket.io)
  common/
    guards/          JwtAuthGuard, RolesGuard
    decorators/      @CurrentUser, @Roles
    exceptions/      BusinessException
    filters/         GlobalExceptionFilter
    utils/           calculate-kdv.ts, format-money-tr.ts
  shared/
    enums/           OrderStatus, OrderItemStatus, SessionStatus, PrepStation, UserRole
    constants/       tax-rates.constant.ts (KDV rates, alcohol hours, session TTL)

mise-frontend/src/
  pages/
    customer/        QRScanner, Menu, ItemDetail, Cart, OrderTracking
    staff/           Login, Kitchen (KDS)
    admin/           AdminLayout, Dashboard, MenuManager, TableManager
  store/             sessionStore, cartStore, authStore (all zustand+persist)
  services/api/      client.ts, sessions.api.ts, orders.api.ts,
                     auth.api.ts, kitchen.api.ts, admin.api.ts
  hooks/             useWebSocket.ts
  types/             entity.types.ts
  utils/             formatCurrency.ts (formatTRY)
```

## Env Files
```
mise-backend/.env
  DATABASE_URL=postgresql://mise:mise_dev_password@localhost:5432/mise_db
  JWT_SECRET=change_me_in_production
  JWT_EXPIRATION=24h
  NODE_ENV=development   ← SSL disabled when development; enabled only in production

mise-frontend/.env
  VITE_API_URL=http://localhost:3000
  VITE_WEBSOCKET_URL=http://localhost:3000
  VITE_FRONTEND_URL=http://localhost:5173   ← used to build QR code URLs
```

---

## Rules — Code Style

- No comments that describe WHAT the code does. Only add a comment when the WHY is non-obvious (hidden constraint, workaround, subtle invariant).
- No trailing summary after edits. The diff speaks for itself.
- No features beyond what the task requires. No abstractions for hypothetical future needs.
- No error handling for impossible scenarios. Only validate at system boundaries (user input, external APIs).
- No backwards-compat shims, renamed `_unused` vars, or `// removed` markers. Delete dead code completely.

---

## Rules — TypeScript

- `import type` for all type-only imports — `verbatimModuleSyntax` is enabled in the frontend tsconfig.
- Prefer `type` over `interface` for API shapes and DTOs; use `interface` for things that will be implemented/extended.
- Enum values must come from `shared/enums/` — never use raw strings where an enum exists.
- `Number(x)` when reading `numeric` columns from TypeORM (they come back as strings from pg driver).
- `as any` is acceptable only for known library type-gap workarounds (e.g. `@nestjs/jwt` `expiresIn` expects branded `StringValue` — cast needed).

---

## Rules — NestJS / Backend

- Every DB query that touches tenant data **must** be scoped by `restaurantId`. No exceptions.
- Never use `findByIds()` — deprecated in TypeORM 0.3+. Use `find({ where: { id: In([...]) } })` with `In` from `typeorm`.
- Batch DB writes — never `await repo.save()` inside a loop. Build the array first, then one `repo.save(array)`.
- Hoist all DB reads above loops. No queries inside `for` or `.map()`.
- Throw `BusinessException(code, HttpStatus, detail)` for domain errors. Never throw raw `Error` from services.
- `BusinessException` codes are SCREAMING_SNAKE_CASE strings (e.g. `'SESSION_EXPIRED'`, `'ALCOHOL_SALES_BLOCKED'`).
- DTOs live in `module/dto/`. Validate with `class-validator`. Always `whitelist: true` on the global pipe (already set).
- Guards live in `common/guards/` (shared) or `module/guards/` (module-specific).
- Constants go in `shared/constants/`. Enums go in `shared/enums/`. No magic numbers or strings in service files.
- **`@JoinColumn` must use snake_case** — SnakeNamingStrategy does NOT apply to the `name` inside `@JoinColumn({ name })`. Always write `@JoinColumn({ name: 'restaurant_id' })` not `'restaurantId'`.
- SSL is disabled for local dev: `ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false` in DatabaseModule.

---

## Rules — React / Frontend

- `import type` for all type imports (enforced by tsconfig).
- Zustand stores: computed values are functions (`totalPrice: () => ...`) — call as `store.totalPrice()`, not as a selector.
- Use `useMemo` for any derived value that involves a `reduce` or `Array.from` inside a component.
- `.sort()` mutates — always spread before sorting: `[...arr].sort(...)`. Arrays from the session store are shared state.
- Callbacks passed to hooks that take `[sessionToken]` as deps must be stored in refs to avoid stale closures.
- No inline styles objects defined inside JSX — define them in a `styles` object outside the component.
- API calls go in `services/api/*.api.ts`. Never call `axios`/`client` directly from components or stores.
- All currency display goes through `formatTRY()` from `utils/formatCurrency.ts`. Never format money inline.
- Routes: `/` QR scan, `/menu` menu, `/cart` cart, `/order/:id` tracking, `/login` staff login, `/kitchen` KDS, `/admin/*` admin.

---

## Rules — Database / TypeORM

- All entities use `@PrimaryGeneratedColumn('uuid')`.
- Price/tax columns: `numeric(10,2)` for amounts, `numeric(4,2)` for rates. Always `Number(x)` when reading them in code.
- Snapshot columns (`unitPriceSnapshot`, `kdzRateSnapshot`, `nameSnapshot`, etc.) are written once at order time and never updated.
- Use QueryBuilder when filtering on nested relations (TypeORM `find` does not support `where` on joined tables).
- `synchronize: false` always — schema is managed via `schema.sql`. Do not change to `true`.
- New tables → add to `schema.sql` and `database.module.ts` ENTITIES array.

---

## Rules — Security

- Never log JWT secrets, API keys, or TCKN/VKN values.
- iyzico webhook: always verify HMAC-SHA256 signature before processing. Guard is in `payments/guards/webhook-signature.guard.ts`.
- KVKK: TCKN/VKN must be encrypted at rest. Only store if `consentGivenAt` is set.
- No raw SQL string interpolation. Always use TypeORM parameters or query builder bindings.
- CORS is locked to `FRONTEND_URL` env var — never `origin: '*'` in production.

---

## Patterns to Reuse

| Need | Use |
|------|-----|
| Domain error | `throw new BusinessException('CODE', HttpStatus.X)` |
| Currency display | `formatTRY(amount)` — `utils/formatCurrency.ts` |
| KDV math | `calculateLineKdv/Otv/Total` — `common/utils/calculate-kdv.ts` |
| Session validation | `sessionsService.validateSession(token)` — returns session or throws |
| Scoped menu load | `SessionsService.getMenu(restaurantId)` — filters inactive cats + items |
| Batch modifier query | `modifierRepo.find({ where: { id: In(ids) } })` |
| Alcohol time check | `ALCOHOL_BLOCK_START_HOUR` / `ALCOHOL_BLOCK_END_HOUR` from constants |
| Session expiry | `SESSION_TTL_MS` from constants |
| Protect staff route | `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN, ...)` |
| Get current staff | `@CurrentUser() user: JwtPayload` — gives `sub`, `restaurantId`, `role`, `email` |
| Admin ownership check | `adminService.assertOwned(repo, id, restaurantId)` — throws NOT_FOUND if mismatch |
| QR URL for table | `` `${VITE_FRONTEND_URL}/?qr=${table.qrToken}` `` |
| Kitchen WS subscription | `useWebSocket({ restaurantId, onOrderPlaced, onOrderStatusChanged })` |
| Customer WS subscription | `useWebSocket({ sessionToken, onOrderStatusChanged, onOrderReady })` |

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
