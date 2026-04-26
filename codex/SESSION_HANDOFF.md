# Session Handoff (Paste Into New Chat)

Copy/paste this block into a new Codex session to avoid re-scanning the repo:

## Repo
- Path: `D:\OneDrive - Egypt University of Informatics\Desktop\Meta-Coplit-V2\CopilotV2`

## Current Status

- Auth: Supabase-first (Facebook OAuth + email/password signup/login). Email confirmation was disabled temporarily to allow signup; enabling it needs SMTP configuration in Supabase.
- Meta connect: Persisted flow via `POST /api/meta/connect-url` + signed `state` (token saved in DB on callback) and ticket-based callback (`/meta/callback?ticket=...`) to avoid `window.opener` issues; auto-sync on login/refresh.
- Shopify connect: OAuth flow implemented (connect URL + callback + status), with CTA/badge in the Home header; requires DB columns on `PortalUser`.
- Home: "Top campaigns" table with range toggle + ad account selector (moved into the card), calls backend `GET /api/meta/top-campaigns` and shows live errors.
  - UI validates `/api/meta/status` on login/refresh and clears cached "connected" state if the backend token isn't persisted.
- Home: Monthly goals replaced by "Daily performance" (Sales/Spend/ROAS) derived from Meta top campaigns.
- Home: Daily metrics cached in memory to show last values instantly.
- Analytics: header allows selecting + persisting Meta ad account; KPIs/charts derived from `GET /api/meta/top-campaigns`.
- Analytics modals: spend breakdown uses `GET /api/meta/spend-breakdown`; sales breakdown uses `GET /api/shopify/sales-breakdown` (requires `read_orders`).
- AI Ads: Ad Library wired to Meta Ads Library search; tabs refactored under `frontend/src/pages/ai-ads`. Brand Library now uses Supabase-backed logo/products/colors/fonts.
- AI Generation: backend `/api/ai/generate` uses Gemini image generation; frontend displays results.
- My Creatives: saved AI creatives persist via `/api/creatives` (PortalCreative).
- AI Chat: refactored into `frontend/src/pages/ai-chat/*` (page + message list + composer + API).
- AI Chat backend: sessions/messages stored in DB (`/api/ai-chat/*`), Gemini chat via `/api/ai/chat`, actions logged via `/api/ai/actions/execute`.
- AI Chat: Meta-only context (ad accounts, top campaigns, spend breakdown). Gemini selects account + range.
- Sidebar: locale switcher (EN/AR), RTL toggle, Cairo font (RTL only), translated Home + sidebar.
- Branding: page title + favicon set to Meta Copilot.
- Header: custom disconnect modal for Meta/Shopify (no browser confirm).

## Key Endpoints

- Supabase-auth required:
  - `POST /api/meta/connect-url` (returns `{ url, persisted: true }`; `503` if DB unreachable)
  - `GET /api/meta/status`
  - `GET /api/meta/ad-accounts`
  - `GET /api/meta/selected-ad-account`
  - `POST /api/meta/selected-ad-account`
  - `GET /api/meta/top-campaigns?adAccountId=...&range=...`
  - `GET /api/meta/spend-breakdown?adAccountId=...&range=...`
  - `POST /api/shopify/connect-url` (body `{ shopDomain }`)
  - `GET /api/shopify/status`
  - `GET /api/shopify/shop`
  - `GET /api/shopify/sales-breakdown?range=...`
  - `POST /api/ai/generate`
  - `POST /api/ai/chat`
  - `POST /api/ai/actions/execute`
  - `GET /api/ai-chat/sessions`
  - `POST /api/ai-chat/sessions`
  - `GET /api/ai-chat/sessions/:id/messages`
  - `POST /api/ai-chat/sessions/:id/messages`
  - `GET /api/work-station/tasks`
  - `POST /api/work-station/tasks`
  - `PATCH /api/work-station/tasks/:id`
  - `GET /api/creatives`
  - `POST /api/creatives`
  - `GET /api/brand/profile`
  - `POST /api/brand/logo`
  - `POST /api/brand/product`
  - `DELETE /api/brand/product/:id`
  - `PUT /api/brand/colors`
  - `PUT /api/brand/fonts`
- Meta OAuth callback flow:
  - `GET /api/auth/meta/callback` redirects to `/meta/callback?ticket=...`
  - `GET /api/auth/meta/ticket?ticket=...` returns `{ user, adAccounts }`
- Shopify OAuth callback flow:
  - `GET /api/auth/shopify/callback` redirects to `/shopify/callback?connected=1`

## Blockers / Known Issues

- If token persistence fails (DB unreachable during connect/callback), Meta campaigns/status will fail; retry connect when DB is reachable.
- Backend ↔ Supabase Postgres connectivity can fail depending on network; when it fails, Meta status/campaigns return `503` with `details` in dev.
- Shopify connect requires DB columns on `PortalUser`; if you don’t use Prisma migrations yet, apply `backend/prisma/manual/portal_user_shopify.sql` in Supabase SQL editor.

## What Changed Last
- Switched Home "Monthly goals" to Daily performance (Sales/Spend/ROAS) from Meta; added in-memory cache for last values.
- Added EN/AR locale switcher in sidebar with RTL toggle and Cairo font; translated Home + sidebar.
- AI chat now uses Meta-only context with Gemini-selected account + range; prompt simplified to raw responses.
- Refactored AI Chat into `frontend/src/pages/ai-chat/*` modules; kept `/ai-chat` route.
- Added Meta Copilot favicon + title; kept in-app disconnect modal for Meta/Shopify (no browser confirm).

## Current Goal (1 sentence)
Stabilize AI image generation + creatives persistence and polish analytics sourcing.

## Definition of Done (bullets)
- [ ] Apply `backend/prisma/manual/portal_user_creatives.sql` (PortalCreative table)
- [ ] `POST /api/ai/generate` returns images and UI renders them
- [ ] Saving an image creates a row in `/api/creatives` and My Creatives lists it

## Shopify Scopes
- `read_products,read_analytics,read_marketing_events` (add `read_orders` for sales breakdown)

## Errors / Logs (if any)
```
Common symptoms:
- `401 Invalid HMAC` (Shopify callback verification failed)
- `401 Shop mismatch` (callback shop != state shop)
- `503 ...` (DB connectivity issue)
```
