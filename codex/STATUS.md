# Status (Update Every Change)

## Current Phase
- Phase: 1 (Core)
- Milestone: Supabase auth + Meta connect (portal)
- Date: 2025-12-14

## Done
- [x] Root `npm run dev` starts frontend+backend.
- [x] Meta OAuth popup flow returns profile + ad accounts.
- [x] Backend persists encrypted Meta token (PortalUser) when callback state is signed.
- [x] Meta endpoints secured with Supabase JWT (connect-url/status/ad-accounts).
- [x] Meta popup flow hardened with ticket redirect when `window.opener` is blocked.
- [x] Dashboard auto-syncs Meta status/accounts on login/refresh (no manual refresh button).
- [x] Prevent "fake connected" Meta UI state: on login/refresh, frontend validates `/api/meta/status` and clears cached state if not persisted.
- [x] Shopify connect modal uses the domain-first flow before opening OAuth.
- [x] Add `/api/shopify/shop` to fetch basic connected store info.
- [x] Analytics page updated to MVP dashboard layout (metrics + charts placeholders).
- [x] Persist selected Meta ad account for Analytics and fetch Meta/Shopify data in header.
- [x] Document Analytics MVP data flow in `codex/API_CONTRACT.md`.
- [x] Enhance Analytics cards and charts (units, trends, mapping clarity, empty states, label truncation).
- [x] Add Meta spend breakdown and Shopify sales breakdown endpoints; wire Analytics modals to them.
- [ ] Ad Library search occasionally fails with Meta ads_archive OAuthException (code 1); needs retry/backoff or fallback handling.
- [x] Implement AI Ads tabs UI for Brand Library, My AI Generations, and My Creatives with empty states.
- [x] Expand My AI Generations UI with advanced settings and preview states (stubbed).
- [x] Add Nano Banana generation endpoint and wire My AI Generations to call it (token-protected).
- [x] Switch image generation service to use Google Imagen when `IMAGE_API_URL` points to generativelanguage.googleapis.com.
- [x] Add My Creatives persistence (PortalCreative) with list/create endpoints and Save action.
- [x] Add AI chat page shell (`/ai-chat`) with full-width layout.
- [x] Wire "Ask AI Marketer" button to navigate to `/ai-chat`.
- [x] Move Meta ad account selector to the Home "Top campaigns" card.
- [x] Replace Monthly Goals with "Daily performance" (Sales/Spend/ROAS) based on Meta data.
- [x] Add in-memory cache for Home daily metrics to show last values instantly.
- [x] Refactor Home page into smaller components under `frontend/src/pages/home`.
- [x] Refactor AI Ads page into tab components under `frontend/src/pages/ai-ads`.
- [x] Move AI Ads page entry to `frontend/src/pages/ai-ads/ai-ads-page.tsx`.
- [x] Remove Monthly Goals month selection + localStorage usage.
- [x] Refactor Analytics page into modules under `frontend/src/pages/analytics` and move entry file.
- [x] Add Brand Library models/endpoints and wire Brand Library tab to Supabase data.
- [x] Add `PortalCreative.name` with save modal + download prompt; My Creatives search by name.
- [x] AI generation uses structured brand assets (colors/logo/product image URLs).
- [x] Add Brand Library data models + backend endpoints (logo/products/colors/fonts).
- [x] Wire Brand Library tab to Supabase-backed profile (logo/products/colors/fonts).
- [x] Add My Creatives rename modal; wire Edit to PATCH `/api/creatives/:id`.
- [x] Add collapsible dashboard sidebar with toggle + updated nav labels (Creative Studio).
- [x] Add in-app disconnect modal for Meta/Shopify (no browser confirm).
- [x] Add locale switcher (EN/AR) in sidebar + RTL toggle.
- [x] Translate Home page + sidebar to Arabic; add Cairo font (RTL only).
- [x] Add Meta Copilot favicon + title.
- [x] Refactor AI Chat page into `frontend/src/pages/ai-chat/*` modules.
- [x] Add Work Station page with task priorities/time windows + AI chat link; tasks editable.
- [x] Add AI chat data models + endpoints; wire AI chat UI to sessions/messages API.
- [x] Add `/api/ai/chat` (Gemini response + actions) and `/api/ai/actions/execute` (allowlist + log).
- [x] AI chat now pulls Meta-only context (ad accounts, top campaigns, spend breakdown) and uses Gemini to select account + range.
- [ ] Gemini API intermittently returns 503 (service unavailable); rotate key, confirm quotas, try gemini-2.0-flash if needed.

## In Progress
- [ ] Shopify: connect one store via OAuth (DoD: user can connect store, token persisted, `/api/shopify/status` returns connected; Home shows Shopify badge).

## Execution Plan (AI Chat + Actions)
1) Data layer
   - Add Prisma models + manual SQL for AI chat sessions, messages, and action logs.
   - Update `codex/DB_SCHEMA.md` with the new models.
2) Backend APIs
   - Implement chat CRUD endpoints.
   - Implement `POST /api/ai/chat` and `POST /api/ai/actions/execute` with validation + allowlist.
   - Add action history and recommendations list endpoints.
3) Prompt + context
   - Build context summarizers for Meta + Shopify (token-limited).
   - Add language auto-detect (respond in user’s last message language).
4) Frontend UI
   - Add dedicated `/ai-chat` page (ChatGPT-style). ✅
   - Wire homepage buttons (Ask AI Marketer, Completed, Edit) to modals/pages.
   - Hook recommendation actions to backend actions (Launch/Delete).
5) Safety + telemetry
   - Require Supabase JWT for all AI endpoints.
   - Add audit logging, rate limits, and error tracking.

## Next (Top 10)
1) Run Prisma migration to add `PortalUser` table.
2) Verify Facebook OAuth (Supabase) redirects and session persists.
3) Fix email/password signup error if still blocked.
4) Fix frontend build errors in `frontend/src/pages/home/home-page.tsx` (unused vars).
5) Switch Meta store source of truth fully to backend (stop persisting ad accounts in localStorage).
6) Implement Meta token refresh + reconnect flow.
7) Implement Shopify OAuth connect (one store per user).
8) Add Shopify Analytics KPIs + charts (after connect is stable).
9) Expand i18n beyond Home page (Analytics, AI Chat, AI Ads, Work Station).

## Blockers / Risks
- Prisma migrations may fail to connect from some IPv4 networks; use Supabase SQL editor fallback (`backend/prisma/manual/portal_user.sql`).
- Shopify connect requires adding columns to `PortalUser`; apply SQL via Supabase editor if no Prisma migrations are set up (`backend/prisma/manual/portal_user_shopify.sql`).

## Commands
- Root dev: `npm run dev`
- Backend only: `cd backend && npm run dev`
- Frontend only: `cd frontend && npm run dev`
