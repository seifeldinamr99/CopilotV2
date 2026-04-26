# Shopify Connect Plan (One Store Per User)

Goal: Let a logged-in (Supabase) user connect exactly one Shopify store via OAuth, persist the store domain + encrypted access token in Postgres, and expose a simple status endpoint for the frontend.

## Assumptions

- Auth: Supabase access token required (`Authorization: Bearer <supabase_access_token>`).
- Storage: Persist Shopify token server-side only (encrypted at rest); never expose token to frontend.
- One store per user: enforce in DB logic (replace/update existing store for the user).

## Required Env Vars (backend)

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_SCOPES` (required scopes only: `read_products,read_analytics,read_marketing_events`)
  - Add `read_orders` if you want `/api/shopify/sales-breakdown` to compute product/collection sales.
- `SHOPIFY_REDIRECT_URI` (e.g. `http://localhost:4000/api/auth/shopify/callback`)
- `PORTAL_ORIGIN` (already used; e.g. `http://localhost:5173`)

## Backend Endpoints

### `POST /api/shopify/connect-url` (Supabase auth)

- Request: `{ shopDomain: string }` (e.g. `zenmood-shop.myshopify.com` or `zenmood-shop`)
- Response: `{ url: string }`
- Behavior:
  - Normalize domain to `*.myshopify.com`.
  - Create signed `state` token that binds the OAuth flow to:
    - `portalUserId` (from Supabase user → PortalUser mapping)
    - `shopDomain`
    - `nonce`
    - short expiry (10m)
  - Return the Shopify OAuth authorize URL.

### `GET /api/auth/shopify/callback` (Shopify redirect)

- Query: `code`, `shop`, `state`, `timestamp`, `hmac`
- Behavior:
  - Verify HMAC per Shopify docs (must pass before any token exchange).
  - Verify `state` (JWT-like) and ensure `shop` matches the domain embedded in `state`.
  - Exchange code for token:
    - `POST https://{shop}/admin/oauth/access_token`
    - Body: `{ client_id, client_secret, code }`
  - Persist:
    - Upsert user’s single `ShopifyStore` record (replace any existing one).
    - Store `shopDomain` and encrypted `accessToken`.
  - Redirect back to frontend:
    - Option A (simple): `${PORTAL_ORIGIN}/shopify/callback?connected=1`
    - Option B (ticket-based like Meta): `${PORTAL_ORIGIN}/shopify/callback?ticket=...` then `GET /api/auth/shopify/ticket?ticket=...`

### `GET /api/shopify/status` (Supabase auth)

- Response: `{ connected: boolean, shopDomain?: string }`
- Behavior: reads current user’s persisted ShopifyStore; no external calls.

### `GET /api/shopify/sales-breakdown` (Supabase auth)

- Response: `{ products, collections, note? }`
- Behavior: aggregates product and collection sales from orders; requires `read_orders`.

### `GET /api/shopify/shop` (Supabase auth)

- Response: `{ shop: { id, domain, myshopifyDomain, primaryDomain } | null }`
- Behavior: reads stored token and fetches shop info from Shopify.

## Persistence (DB)

Preferred model: reuse `PortalUser` (Supabase-first) rather than `User` (legacy email/password backend JWT).

Option A (recommended): extend `PortalUser`
- Add fields:
  - `shopifyShopDomain` (text, nullable)
  - `shopifyAccessToken` (text, nullable)

Option B: add `PortalShopifyStore` table
- Columns:
  - `id`, `portalUserId` (unique), `shopDomain`, `accessToken`, `createdAt`, `updatedAt`

Single-store enforcement:
- Unique on `portalUserId` (or use `PortalUser` fields).
- On connect, overwrite existing store/token for that user.

## Frontend UX

- Put “Connect Shopify” on the **Home page header area** (not Analytics), similar to the Meta connect pattern:
  - Prompt user for shop domain (input modal).
  - Call `POST /api/shopify/connect-url`.
  - Open popup to returned `url`.
  - On completion, verify via `GET /api/shopify/status`.
  - Show badge “Shopify connected” + shop domain + last sync time.
- Cache policy:
  - Frontend should not treat localStorage as source of truth; always validate status after login/refresh (same approach as Meta).

## Analytics Page UX (Shopify)

### Header + Filters

- Date range picker (e.g. Today / Last 7 / Last 30 / Custom)
- Channel filter (e.g. “All channels”)

### KPI Strip (like Shopify admin)

Add a compact KPI strip at the top of Analytics, similar to Shopify’s dashboard tiles, with mini sparklines:

1) Sessions
2) Total sales (if available via analytics access; otherwise show “Not available”)
3) Orders (only if later adding `read_orders`; for now hide or show “Not available”)
4) Conversion rate (if available; otherwise “Not available”)

Notes:
- Show % change vs previous period when possible.
- Use “Not available with current scopes/store plan” for unavailable KPIs (don’t show as 0).

## Validation Checklist

- `POST /api/shopify/connect-url` returns a valid authorize URL for the provided shop.
- Callback rejects invalid HMAC and invalid/expired `state`.
- After successful connect:
  - token is stored encrypted
  - `GET /api/shopify/status` returns `connected: true`
- Reconnecting with a different shop replaces the previous store for that user.

## Notes / Gotchas

- Shopify requires HTTPS in many cases; local dev may need a tunnel (ngrok/Cloudflare Tunnel) for callback.
- HMAC verification must use the raw query string (excluding `hmac`) and exact encoding rules.
- Use offline access tokens (default) unless you explicitly need online tokens tied to user sessions.
