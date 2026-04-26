# Project Architecture (Presentation)

## Executive Summary
Meta Copilot is a marketing ops dashboard that connects Meta Ads and Shopify, surfaces performance analytics, and offers AI-assisted creative generation and chat. The system is a React/Vite frontend backed by a Node/Express API, Prisma/Postgres persistence, and background jobs. Supabase handles portal authentication; the backend stores external tokens encrypted and exposes a stable API contract consumed by the frontend.

## Goals (MVP)
- 3-page dashboard: Home, AI Ads, Analytics.
- Connect Meta via OAuth, fetch ad accounts and campaign metrics.
- Connect Shopify via OAuth, fetch shop info and sales breakdowns.
- Enable AI creative generation and chat for marketing workflows.

## System Overview
- Frontend: React/Vite dashboard UI with Supabase session, i18n, and RTL support.
- Backend: Node/Express REST API with Supabase JWT auth, legacy JWT for dev only.
- Data: Postgres via Prisma schema and migrations.
- Background jobs: Bull/Redis queues for periodic sync (Meta/Shopify as needed).
- External services: Meta Graph API, Shopify Admin API, Google Gemini for AI.

## Architecture Diagram (Logical)
User
  -> Frontend (React/Vite)
     -> Supabase Auth (login/session)
     -> Backend API (Express)
        -> Postgres (Prisma models)
        -> Redis/Bull (sync jobs)
        -> Meta Graph API (ads, accounts)
        -> Shopify API (shop, sales)
        -> Gemini (image gen + chat)

## Backend Layers
- Controllers (`backend/src/controllers/*`): HTTP orchestration and input validation.
- Services (`backend/src/services/*`): Business logic + external API integrations.
- Jobs (`backend/src/jobs/*`): Background sync and scheduled tasks.
- Config (`backend/src/config/*`): Env, database, redis, auth.
- Prisma (`backend/prisma/schema.prisma`): Source of truth for DB schema.

## Frontend Structure
- Layouts: `frontend/src/layouts/` (dashboard shell, navigation).
- Pages: `frontend/src/pages/` (Home, AI Ads, Analytics, AI Chat, Work Station).
- Hooks: `frontend/src/hooks/` (data access and side effects).
- i18n/RTL: `frontend/src/lib/i18n.tsx` with locale switcher and Cairo font for Arabic.

## Authentication & Security
Two auth systems are intentionally separated:
- Portal auth (Supabase): used by all portal endpoints.
  - Frontend obtains Supabase JWT.
  - Backend validates Supabase JWT via `requireSupabaseAuth`.
  - Used for Meta, Shopify, AI, creatives, brand library, work station.
- Legacy auth (backend JWT): kept for internal/dev endpoints only.

Token storage:
- Meta and Shopify access tokens are encrypted at rest in Postgres.
- Tokens are never sent to the frontend.

## Core Data Models (Prisma)
- PortalUser: Supabase user mapping, stored tokens, selected ad account.
- PortalCreative: Saved AI creative outputs.
- PortalBrandProfile/Asset/Color/Font: Brand library assets.
- PortalAIChatSession/Message/ActionLog: AI chat history and actions.
- PortalWorkTask: Work Station tasks.

## Key API Domains
Auth (legacy + Meta OAuth)
- `POST /auth/register`, `POST /auth/login` (dev only).
- `GET /auth/meta/connect`, `GET /auth/meta/callback`, `GET /auth/meta/ticket`.

Meta (Supabase auth)
- `POST /meta/connect-url`, `GET /meta/status`, `GET /meta/ad-accounts`.
- Metrics: `GET /meta/top-campaigns`, `GET /meta/spend-breakdown`.
- Ads Library: `GET /meta/ads-library/search`.

Shopify (Supabase auth)
- `POST /shopify/connect-url`, `GET /auth/shopify/callback`, `GET /shopify/status`.
- `GET /shopify/shop`, `GET /shopify/sales-breakdown`.

AI (Supabase auth)
- `POST /ai/generate` (Gemini image).
- `POST /ai/chat`, `POST /ai/actions/execute`.

Creatives, Brand Library, Work Station (Supabase auth)
- `GET/POST /creatives`, `GET/PUT /brand/*`, `GET/POST/PATCH /work-station/tasks`.

## User Flows (Happy Paths)
1) Portal login
   - User logs in via Supabase (Google/Facebook/email).
   - Frontend stores session; backend expects Supabase JWT.

2) Meta connect
   - Frontend calls `POST /meta/connect-url`.
   - User completes Meta OAuth in popup.
   - Backend stores encrypted token and exposes connected status.

3) Shopify connect
   - User enters shop domain, starts OAuth.
   - Backend validates callback, persists token, returns connection status.

4) Analytics
   - Frontend fetches Meta ad accounts and selected ad account.
   - Metrics come from `meta/top-campaigns` and `meta/spend-breakdown`.
   - Shopify shop info fetched for header and sales breakdown.

5) AI Creative generation
   - Frontend posts prompt and brand assets.
   - Backend calls Gemini image generation.
   - User can save outputs to My Creatives.

6) AI Chat and actions
   - Frontend starts session and posts messages.
   - Backend composes context (Meta/Shopify summaries) and calls Gemini.
   - Actions are validated via allowlist and logged.

## Data Flow & State Management
- Frontend state: React + hooks, persistent meta connection store in localStorage.
- Backend state: Postgres as source of truth for tokens and user selections.
- Caching: In-memory cache for Home metrics to improve perceived speed.
- Jobs: Bull/Redis for periodic sync and background tasks (expandable).

## Deployment & Environments
- Frontend: Vite-based SPA.
- Backend: Node/Express API server (typical `http://localhost:4000`).
- Database: Postgres.
- Redis: Used by Bull for background jobs.
- Env vars:
  - Backend: `DATABASE_URL`, `JWT_SECRET`, `META_APP_ID`, `META_APP_SECRET`,
    `META_REDIRECT_URI`, `ENCRYPTION_KEY`, `REDIS_URL`.
  - Frontend: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Current Risks / Known Issues
- Meta Ads Library API can return OAuthException (needs retries/backoff).
- Gemini API returns intermittent 503s (consider key rotation or model switch).
- Shopify connect still in progress (one-store-per-user target).

## Roadmap (Near-Term)
- Complete Shopify OAuth connection flow and status badge on Home.
- Expand i18n beyond Home page (Analytics, AI Chat, AI Ads, Work Station).
- Add Meta token refresh/reconnect flow.
- Tighten error handling and rate limits for AI + external APIs.

## Presentation Tips (Optional)
- Start with the system overview diagram.
- Emphasize Supabase-first auth boundary and encrypted token storage.
- Demo: login -> connect Meta -> analytics metrics -> AI creative -> save.
