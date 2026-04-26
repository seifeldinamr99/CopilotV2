# Project Context (Keep Updated)

## Goal (MVP)
- Build a 3-page dashboard: **Home**, **AI Ads**, **Analytics**.
- Phase 1 focus: Meta OAuth connection, campaign/metrics fetching, basic dashboard endpoints.

## Repo Layout
- `backend/` — Node/Express + Prisma + Postgres + Bull/Redis jobs
- `frontend/` — React/Vite UI
- `docs/` — product docs (SRS, scoping, requirements)
- `codex/` — **this folder**, the durable working set for Codex

## Local Dev
- Frontend dev server: Vite (port shown by Vite output)
- Backend API: `http://localhost:4000` (typical)
- API base path: `/api`

## Environment Variables (Backend)
Document the canonical required env vars here (names only; no secrets):
- `DATABASE_URL`
- `JWT_SECRET`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI`
- `ENCRYPTION_KEY`
- `REDIS_URL`

## Environment Variables (Frontend)
- `VITE_API_URL` (example: `http://localhost:4000/api`)
- Supabase vars (if/when enabled):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Architecture Snapshot
**Backend layers**
- `src/controllers/*` — HTTP handlers, no business logic beyond orchestration
- `src/services/*` — business logic + external API calls
- `src/jobs/*` — Bull queues/schedulers for periodic sync
- `src/config/*` — env, database, redis
- `prisma/schema.prisma` — DB schema

**Frontend**
- `src/layouts/` — dashboard shell layout
- `src/pages/` — route pages (Home/AI Ads/Analytics)
- `src/hooks/` — UI data hooks

## Non-Negotiable Invariants
- One feature = one small patch/PR.
- Every PR updates `codex/STATUS.md`.
- Keep contracts stable: update `codex/API_CONTRACT.md` when endpoints change.

## Auth Boundary (Important)

We currently have two auth mechanisms on the backend, and they must remain clearly separated:

1) **Portal auth (Supabase)** — used by the production web app
- Frontend logs users in via Supabase (Facebook / email).
- Backend verifies the Supabase access token via `requireSupabaseAuth`.
- Portal endpoints (Meta integration, dashboards, etc.) MUST use Supabase auth.
- Files:
  - `backend/src/middleware/supabase-auth.ts`
  - `backend/src/routes/meta.routes.ts`
  - `backend/src/controllers/meta.controller.ts`

2) **Legacy backend JWT auth** — kept for now (internal/dev)
- `/api/auth/register` and `/api/auth/login` issue a backend JWT.
- Do NOT use this token for portal flows.
- Files:
  - `backend/src/middleware/auth.ts`
  - `backend/src/controllers/auth.controller.ts`
  - `backend/src/routes/auth.routes.ts`

Rule of thumb:
- If an endpoint is consumed by the React portal UI, it should require **Supabase auth**.
- If an endpoint is for legacy testing/dev only, it may use **backend JWT auth**, but it must be documented as such in `codex/API_CONTRACT.md`.
