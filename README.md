# FlexLiving Reviews – Full-Stack Assessment

A small full-stack app for ingesting, moderating, and visualizing property reviews.  
Backend is a Fastify + Prisma service; frontend is a Next.js dashboard.

---

## 1) Features

- **Sync reviews** from Hostaway (mockable fetch client) → persist with Prisma.
- **Moderation**: approve/deny, toggle “display on website”.
- **Filtering**: by property, channel, rating threshold, status, date range.
- **Analytics**: totals, averages, distributions, by-channel, over-time, per-property.
- **Secure actions** via `x-api-key` header (simple admin auth).
- **Seed + tests** to validate core flows.

---

## 2) Tech Stack

- **Backend**: Node 20+, TypeScript, Fastify, zod, Prisma, SQLite (dev)
- **Frontend**: Next.js (App Router), React, Tailwind, Lucide Icons
- **Tooling**: Vitest, tsx/ts-node, pino, nodemon

---

## 3) Quickstart (Local)

### Requirements
- Node **v20+**
- pnpm or npm
- SQLite (bundled with Prisma for dev)

### Backend

```bash
cd backend

# Install
npm i

# Copy env
cp .env.example .env

# (Windows PowerShell)
# copy .env.example .env

# Generate Prisma client & migrate dev DB
npm run prisma:generate
npm run prisma:migrate   # name the migration (e.g., init)

# (Optional) seed sample data
npm run seed

# Start dev
npm run dev
# API at http://localhost:3001
```

**.env (backend)**
```ini
# Server
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
FRONTEND_URL=http://localhost:3000

# Simple admin key for privileged ops (set your own!)
ADMIN_API_KEY=

# DB (SQLite for dev)
DATABASE_URL="file:./dev.db"

# Hostaway (use your own or mock during tests)
HOSTAWAY_API_URL=https://api.hostaway.com/v1
HOSTAWAY_ACCOUNT_ID=00000
HOSTAWAY_API_KEY=replace_with_your_hostaway_key
```

> ⚠️ Do **not** commit real API keys.

### Frontend

```bash
cd frontend
npm i

# Frontend env
cp .env.example .env
# (Windows) copy .env.example .env.local

# Start dev
npm run dev
# UI at http://localhost:3000
```

**.env.local (frontend)**
```ini
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_API_KEY=the_same_value_as_backend_ADMIN_API_KEY
```

---

## 4) Database & Prisma

- Dev uses SQLite: `file:./dev.db`.
- JSON columns are persisted as **stringified JSON** (for cross-connector support).
- Run:
  ```bash
  npm run prisma:generate
  npm run prisma:migrate
  npm run seed     # optional sample rows
  ```

---

## 5) Running the App

1) **Backend**: `http://localhost:3001`  
2) **Frontend**: `http://localhost:3000` (Dashboard)

From the dashboard you can:
- Filter & explore reviews
- Click **Sync Reviews** (sends `x-api-key`) to pull Hostaway data
- Approve / toggle display

---

## 6) API Reference (selected)

Base URL: `http://localhost:3001/api`

### `GET /reviews`
Query params:
- `propertyId`, `channel`, `minRating`, `approved` (`true|false`),  
  `startDate`, `endDate` (ISO), `sortBy` (`submittedAt|rating|property`),  
  `sortOrder` (`asc|desc`), `page` (1+), `limit`.

**Example**
```bash
curl "http://localhost:3001/api/reviews?minRating=4&page=1&limit=20"
```

**Response**
```json
{
  "status": "success",
  "data": {
    "reviews": [ /* ... */ ],
    "total": 42,
    "pages": 3
  }
}
```

### `GET /reviews/analytics`
Returns totals, averages, distributions, by-channel, over-time, per-property.

```bash
curl "http://localhost:3001/api/reviews/analytics?minRating=4"
```

### `POST /reviews/sync` *(protected)*
Header: `x-api-key: <ADMIN_API_KEY>`

```bash
# Windows PowerShell
curl.exe -X POST "http://localhost:3001/api/reviews/sync" -H "x-api-key: YOUR_KEY"

# macOS/Linux
curl -X POST http://localhost:3001/api/reviews/sync -H "x-api-key: YOUR_KEY"
```

**Response**
```json
{ "status":"success", "data": { "hostaway": { "synced": 3 } } }
```

### `POST /reviews/:id/approve` *(protected)*
Body: `{"approved": true, "displayOnWebsite": true}`

```bash
curl -X POST "http://localhost:3001/api/reviews/REVIEW_ID/approve" \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"approved\":true,\"displayOnWebsite\":true}"
```

---

## 7) Key Design & Logic Decisions

- **Stringified JSON** for `reviewCategories` to work across SQLite/Postgres (SQLite has no native JSON type in Prisma connector).
- **Idempotent upsert** on sync using composite unique (`sourceId + source`) to prevent duplicates.
- **Derived rating**: if Hostaway provides category scores out of 10, average and map to 1–5 stars.
- **Lightweight auth**: `x-api-key` only for admin actions (enough for assessment; swap for OAuth/Session/JWT in prod).
- **Service layer** centralizes:
  - `buildWhere(filters)` → Prisma query
  - `orderBy(filters)` → sorting
  - `analytics(filters)` → all aggregates in one call

---

## 8) Tests

Run:
```bash
cd backend
npm run test
```

Coverage:
- Service normalization (rating/category parsing)
- `buildWhere` formation
- API list, analytics (happy paths)
- Protected routes with/without `x-api-key`

> Some integration tests mock `reviewService` to isolate the route.  
> On Windows shells, prefer `curl.exe` and wrap headers in quotes as shown above.

---

## 9) Troubleshooting

- **401 Unauthorized on sync/approve**
  - Ensure both frontend and backend use the **same** `ADMIN_API_KEY`.
  - Requests must include header: `x-api-key: <key>`.

- **Windows `curl` header parsing**
  - Use `curl.exe` and **double quotes**:  
    `curl.exe -X POST "http://..." -H "x-api-key: KEY"`

- **Prisma JSON error (SQLite)**
  - Keep `reviewCategories` as `String` in schema and `JSON.stringify(...)` on write, `JSON.parse(...)` on read (UI).

- **pino-pretty error**
  - Ensure `pino-pretty` is installed if you enable pretty transport, or keep default `LOG_LEVEL=info`.

- **Frontend 401**
  - Check `NEXT_PUBLIC_API_BASE` and `NEXT_PUBLIC_ADMIN_API_KEY` in `frontend/.env.local`.

---

## 10) Google Reviews (notes)

- The code is structured so a `googleClient.ts` can mirror `hostawayClient.ts`.
- Add a new **source** (e.g., `"google"`) and plug into the same upsert & normalization pipeline.
- Ensure terms of service and API quotas are respected.

---

## 11) Production Notes

- Swap SQLite with **Postgres** and migrate the Prisma schema (keep stringified JSON or switch to native JSONB).
- Replace `x-api-key` with a real auth strategy.
- Add input validation (zod) on all endpoints, rate limiting, request logging, and error observability.
- Containerize and use a process manager (PM2) or serverless.

---

## 12) Scripts (backend)

```bash
# Dev server
npm run dev

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run seed

# Tests
npm run test
```

---

## 13) License

For assessment use only.
