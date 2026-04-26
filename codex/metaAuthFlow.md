# Meta Auth Flow (Popup OAuth)

This doc describes how the app connects to Meta (Facebook) and how the UI learns that the connection succeeded.

## Components

- Backend (Express, OAuth callback + ticket): `backend/src/controllers/meta-auth.controller.ts`
- Backend (Express, persisted connect URL + Meta APIs): `backend/src/controllers/meta.controller.ts`
- Backend (Meta Graph helpers): `backend/src/services/meta.service.ts`
- Frontend popup + state: `frontend/src/hooks/useMetaConnection.tsx`, `frontend/src/store/meta-store.ts`
- Frontend login modal connect: `frontend/src/pages/login-page.tsx`

## URLs (local dev)

- Start OAuth (persisted): `POST http://localhost:4000/api/meta/connect-url` (requires Supabase auth; returns `{ url, persisted }`)
- Start OAuth (legacy/stateless): `GET http://localhost:4000/api/auth/meta/connect?redirect=1`
- OAuth callback: `GET http://localhost:4000/api/auth/meta/callback`
- Ticket exchange: `GET http://localhost:4000/api/auth/meta/ticket?ticket=...`
- Health check: `GET http://localhost:4000/api/health`

## Flow Overview (persisted path)

1. User clicks “Connect Meta Business” (dashboard) or “Continue with Facebook” (login modal).
2. Frontend calls `POST /api/meta/connect-url` with `Authorization: Bearer <supabase_access_token>`.
3. Backend returns `{ url, persisted }`:
   - `persisted: true`: OAuth `state` is a signed token containing the current portal user id, so the callback can store the long-lived token in Postgres.
   - `persisted: false`: backend couldn’t reach the DB and generated a random `state` (UI can still complete the popup via ticket exchange, but `/api/meta/status` will remain disconnected).
4. Frontend opens a popup window to the returned `url`.
5. Meta redirects back to `META_REDIRECT_URI` (the backend callback).
6. Backend exchanges the code for tokens, fetches `me` + `adAccounts`, and:
   - Persists the encrypted long-lived token if `state` verifies as a signed token.
   - Redirects to `${PORTAL_ORIGIN}/meta/callback?ticket=...` (ticket-based to avoid COOP/`window.opener` issues).
7. Frontend callback page calls `GET /api/auth/meta/ticket?ticket=...`, stores `{ user, adAccounts }` in the Zustand store/localStorage, and signals the opener (`postMessage`) when possible.

## Backend Details

### `POST /api/meta/connect-url`

- Requires Supabase auth (`Authorization: Bearer <supabase_access_token>`).
- Creates/loads the portal user in Postgres and signs a JWT-like `state` containing `{ userId, nonce }`.
- Returns `{ url, persisted: true }`.
- If the DB is temporarily unreachable, returns `{ url, persisted: false }` with a random `state` (stateless mode).

### `GET /api/auth/meta/connect`

- Legacy/stateless starter endpoint.
- Generates random `state` and builds the OAuth dialog URL via `MetaService.getLoginUrl(state)`.
- If `?redirect=1` is present, it redirects immediately (best for popups).
- Otherwise it returns JSON: `{ url }`.

### `GET /api/auth/meta/callback`

- Reads `code` and `state` from query params.
- Exchanges `code` → short-lived token → long-lived token.
- Fetches:
  - `GET /me` (id, name)
  - `GET /me/adaccounts` (id, name, account_id, currency, timezone_name)
- If `state` verifies as a signed token created by `POST /api/meta/connect-url`, persists the encrypted long-lived access token to Postgres for that user.
- Issues a short-lived signed `ticket` and redirects to:
  - `${PORTAL_ORIGIN}/meta/callback?ticket=...`

### `GET /api/auth/meta/ticket?ticket=...`

- Purpose: Exchange a short-lived signed ticket for the callback payload.
- Response: `{ user, adAccounts }`

## Frontend State + UI

`frontend/src/store/meta-store.ts` persists:

- `connected` (boolean)
- `profile` (Meta profile `{ id, name }`)
- `adAccounts` (array)
- `selectedAdAccountId`

Storage key: `meta_connection_v1` in `localStorage`.

## Common Failure Modes

- `409 Meta not connected`:
  - UI used a stateless flow (or the DB was unreachable during `POST /api/meta/connect-url` and it returned `persisted: false`), so no token was stored for `/api/meta/status`.
- Popup opens but no connection state updates:
  - Ticket-based callback is required (no `window.opener` dependency).
- `503` from `/api/meta/status` or `/api/meta/top-campaigns`:
  - DB is unreachable (backend will include `details` in development).

## Environment Variables (backend)

Defined in `backend/src/config/env.ts` and loaded from `backend/.env`:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI` (should match callback route, e.g. `http://localhost:4000/api/auth/meta/callback`)
- `PORT` (default `4000`)
- `PORTAL_ORIGIN` (frontend origin for redirect, e.g. `http://localhost:5173`)
