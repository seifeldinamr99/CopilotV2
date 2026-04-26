# Auth + Meta Connection Plan (Supabase-First)

Goal: Users sign up / log in to the portal using Supabase (Google, Facebook, or email/password), then connect their Meta account; backend persists Meta tokens per user.

Scope note: Keep existing backend `/api/auth/login` + `/api/auth/register` endpoints, but do not use them for the portal session. Portal session uses Supabase.

## Phase 1 — Supabase Auth in Frontend

**Definition of Done**
- User can sign up/sign in with:
  - Google OAuth
  - Facebook OAuth
  - Email/password
- Session persists across refresh/reopen (Supabase session re-hydration).
- Protected routes redirect unauthenticated users to login.
- Logout clears session.

**Work**
- Ensure Supabase providers enabled + redirect URLs configured in Supabase dashboard.
- Frontend:
  - Add Google/Facebook OAuth buttons using `supabase.auth.signInWithOAuth`.
  - Add email/password signup + login using `supabase.auth.signUp` and `supabase.auth.signInWithPassword`.
  - On app boot: `supabase.auth.getSession()` + `supabase.auth.onAuthStateChange(...)` updates `useAuthStore`.
  - Add logout (`supabase.auth.signOut()`).

**Env**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

## Phase 2 — Backend Auth = Supabase JWT

**Definition of Done**
- Backend has middleware `requireSupabaseAuth` that validates Supabase JWT from `Authorization: Bearer <token>`.
- Backend extracts `sub` (Supabase user id) + email and makes it available on `req.user`.
- No secrets are hardcoded; uses env.

**Work**
- Add a Supabase JWT verification middleware using JWKS (recommended) with caching.
- Add env vars as needed (derive JWKS URL from Supabase URL if possible).

## Phase 3 — Local User Mapping (DB)

**Definition of Done**
- Database `User` model links to Supabase user via `supabaseUserId` (unique).
- On any authenticated request, backend upserts a `User` row by `supabaseUserId`.

**Work**
- Prisma schema update + migration:
  - Add `PortalUser` model for Supabase users.
- Create `getOrCreateUserFromSupabase(req.user)` helper.

**Commands**
- Generate client: `cd backend && npm run prisma:generate`
- Create/apply migration (requires Postgres running + `DATABASE_URL` set): `cd backend && npm run prisma:migrate`

## Phase 4 — Meta Connect for Logged-in Users

**Definition of Done**
- Meta connect URL is generated for the logged-in Supabase user.
- Meta callback stores encrypted Meta access token in DB for that user.
- UI shows “Meta connected” based on backend status, not only localStorage.
- `GET /api/meta/ad-accounts` works without re-opening the popup (uses stored token).

**Backend Work**
- Update `/api/meta/connect-url`, `/api/meta/status`, `/api/meta/ad-accounts` to use `requireSupabaseAuth` and DB user mapping.
- Keep callback at `/api/auth/meta/callback`:
  - Validate signed `state` (includes DB user id).
  - Encrypt and persist long-lived token in `User.metaAccessToken`.

**Frontend Work**
- After successful Supabase login, show “Connect Meta” CTA.
- Prefer backend-driven state:
  - On dashboard load: call `/api/meta/status`; if connected call `/api/meta/ad-accounts`.

**Note about “same Facebook account”**
- Supabase Facebook login and Meta Ads OAuth are separate. The UI can strongly guide users to connect immediately after Facebook login, but it cannot strictly prevent account switching in the Meta consent screen.

## Phase 5 — Production Hardening

**Definition of Done**
- `.env.example` files updated; no real secrets committed.
- Clear docs in `codex/API_CONTRACT.md` for Supabase-authenticated endpoints.
- Basic error handling for expired/invalid Meta tokens (reconnect flow).

## Tracking (Workflow)

Per `codex/WORKFLOW.md`:
- Add 1 scoped “In Progress” item to `codex/STATUS.md` with acceptance criteria for the next task you want implemented.
- After each change: update `codex/API_CONTRACT.md` and/or `codex/DB_SCHEMA.md` if relevant.
