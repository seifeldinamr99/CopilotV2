# API Contract (MVP)

Keep this file in sync with actual implementation. If an endpoint changes, update this.

## Conventions
- Base URL: `${VITE_API_URL}` (typically `http://localhost:4000/api`)
- Auth:
  - Document whether endpoints use backend JWT (`Authorization: Bearer <token>`) or Supabase JWT.
  - Avoid mixing auth styles without documenting it.

## Auth

### `POST /auth/register`
- Request: `{ email, password, name }`
- Response: `{ token, user }`

### `POST /auth/login`
- Request: `{ email, password }`
- Response: `{ token, user }`

### `GET /auth/meta/connect`
- Purpose: Start Meta OAuth; returns a URL (or redirects if using popup-redirect mode).
- Response: `{ url }`

### `GET /auth/meta/callback`
- Purpose: Meta OAuth callback.
- Response: Redirects to frontend `/meta/callback?ticket=...` (ticket-based flow avoids relying on `window.opener`).

### `GET /auth/meta/ticket?ticket=...`
- Purpose: Exchange a short-lived ticket for `{ user, adAccounts }` after Meta OAuth callback.
- Response: `{ user, adAccounts }`

## Meta (Backend-Token Mode)

These endpoints require Supabase JWT auth (access token):

- Header: `Authorization: Bearer <token>`

### `POST /meta/connect-url`
- Purpose: Generate a Meta OAuth URL that encodes the current backend user in the `state` parameter, enabling token persistence on callback.
- Response: `{ url, persisted: true }`
- Errors:
  - `503` if the database is unreachable (persisted flow is required for `/meta/status` and `/meta/top-campaigns`).

### `GET /meta/status`
- Purpose: Check if the current backend user has a stored Meta token.
- Response: `{ connected: boolean }`

### `GET /meta/ad-accounts`
- Purpose: Fetch profile + ad accounts using the stored token (no popup needed).
- Response: `{ profile, adAccounts }`

### `GET /meta/selected-ad-account`
- Purpose: Get the selected Meta ad account for the current user.
- Response: `{ adAccountId: string | null }`

### `POST /meta/selected-ad-account`
- Purpose: Persist the selected Meta ad account for the current user.
- Request: `{ adAccountId: string | null }`
- Response: `{ adAccountId: string | null }`

### `GET /meta/top-campaigns?adAccountId=...&range=...`
- Purpose: Return top 5 campaigns by highest ROAS for an ad account and date range.
- Range: `last_14_days | last_month | last_3_months | last_6_months | last_year`
- Response: `{ range, since, until, rows }` where `rows` has `{ id, name, reach, purchases, roas, amountSpentEgp, costPerPurchaseEgp }`

### `GET /meta/spend-breakdown?adAccountId=...&range=...`
- Purpose: Return spend breakdown for campaigns, ad sets, and ads.
- Range: `last_14_days | last_month | last_3_months | last_6_months | last_year`
- Response: `{ range, since, until, campaigns, adSets, ads }`

### `GET /meta/ads-library/search?q=...&country=...&status=...&limit=...&after=...`
- Purpose: Search the Meta Ads Library (`ads_archive`) using the stored Meta token.
- Query:
  - `q` (required) search terms
  - `country` (2-letter code, default `US`)
  - `status` (`ALL|ACTIVE|INACTIVE`, default `ALL`)
  - `limit` (1-48, default `24`)
  - `after` (optional paging cursor)
- Response: `{ q, country, status, ads, paging }`

## Shopify (Supabase-Auth, One Store Per User)

These endpoints require Supabase JWT auth (access token):

- Header: `Authorization: Bearer <token>`

### `POST /shopify/connect-url`
- Purpose: Start Shopify OAuth and return a URL to open in a popup/redirect.
- Request: `{ shopDomain }`
- Response: `{ url }`

### `GET /auth/shopify/callback`
- Purpose: Shopify OAuth callback (verify HMAC, exchange code for token, persist store + token).
- Response: Redirects to frontend `/shopify/callback?connected=1`

### `GET /shopify/status`
- Purpose: Check if Shopify is connected for the current user.
- Response: `{ connected: boolean, shopDomain?: string }`

### `GET /shopify/shop`
- Purpose: Fetch basic shop info for the connected store.
- Response: `{ shop: { id, domain, myshopifyDomain, primaryDomain } | null }`

### `GET /shopify/sales-breakdown?range=...`
- Purpose: Return top products and collections by sales.
- Range: `last_14_days | last_month | last_3_months | last_6_months | last_year`
- Response: `{ range, since, until, products, collections, note? }`
- Notes: requires Shopify `read_orders` scope to populate sales.

## AI (Gemini Image)

These endpoints require Supabase JWT auth (access token).

### `POST /ai/generate`
- Purpose: Generate ad creatives from a prompt.
- Request: `{ prompt, style?, aspectRatio?, brandColors?, brandLogoUrl?, productImageUrls?, negativePrompt?, numVariations? }`
- Response: `{ images: [{ url, generation_id }], generationTime }`
- Notes: Uses Gemini image generation. Set `IMAGE_API_URL` to `https://generativelanguage.googleapis.com`.
  - Optional: set `IMAGE_MODEL` (default `gemini-2.5-flash-image`).

### `POST /ai/chat`
- Purpose: Send a chat message and receive assistant response + proposed actions.
- Request: `{ sessionId?, message, language? }`
- Response: `{ sessionId, userMessage, assistantMessage, actions }`

### `POST /ai/actions/execute`
- Purpose: Execute a confirmed AI action (allowlist only) and log it.
- Request: `{ sessionId?, action, params, reason? }`
- Response: `{ actionLog, status: "queued" }`
- Notes: does not mutate Meta yet; logs only.

## Creatives (Supabase-Auth)

### `GET /creatives`
- Purpose: List saved AI creatives for the current user.
- Response: `{ creatives: [{ id, name?, imageUrl, prompt, style, aspectRatio, model, generationTime, createdAt }] }`

### `POST /creatives`
- Purpose: Save a generated creative to My Creatives.
- Request: `{ name?, imageUrl, prompt, style?, aspectRatio?, model?, generationTime? }`
- Response: `{ creative }`

## AI Chat (Supabase-Auth)

### `GET /ai-chat/sessions`
- Purpose: List chat sessions for the current user.
- Response: `{ sessions: [{ id, title?, language?, createdAt, updatedAt, lastMessageAt }] }`

### `POST /ai-chat/sessions`
- Purpose: Create a new chat session.
- Request: `{ title?, language? }`
- Response: `{ session }`

### `DELETE /ai-chat/sessions/:id`
- Purpose: Delete a chat session and its messages.
- Response: `{ deleted: true }`

### `GET /ai-chat/sessions/:id/messages`
- Purpose: List messages for a session.
- Response: `{ session, messages: [{ id, role, content, metaJson?, createdAt }] }`

### `POST /ai-chat/sessions/:id/messages`
- Purpose: Add a message to a session.
- Request: `{ role: "user"|"assistant"|"system", content, metaJson? }`
- Response: `{ message }`

## Brand Library (Supabase-Auth)

### `GET /brand/profile`
- Purpose: Fetch logo, product images, colors, and fonts for the current user.
- Response: `{ logoUrl, products, colors, fonts }`

### `POST /brand/logo`
- Purpose: Upload and store the user logo (single file).
- Request: `{ fileName, contentType, dataBase64 }`
- Response: `{ logoUrl }`

### `POST /brand/product`
- Purpose: Upload a product image (max 10).
- Request: `{ fileName, contentType, dataBase64 }`
- Response: `{ asset }`

### `DELETE /brand/product/:id`
- Purpose: Delete a product image.
- Response: `{ deleted: true }`

### `PUT /brand/colors`
- Purpose: Replace the brand color palette.
- Request: `{ colors: string[] }`
- Response: `{ colors }`

### `PUT /brand/fonts`
- Purpose: Replace Google Fonts selections.
- Request: `{ fonts: [{ family, variant? }] }`
- Response: `{ fonts }`

## Work Station (Supabase-Auth)

### `GET /work-station/tasks`
- Purpose: List tasks for the current user.
- Response: `{ tasks: [{ id, title, priority, window, deadline, completed, createdAt, updatedAt }] }`

### `POST /work-station/tasks`
- Purpose: Create a task.
- Request: `{ title, priority: "Low"|"Medium"|"High", window: "Daily"|"Weekly"|"Monthly", deadline }`
- Response: `{ task }`

### `PATCH /work-station/tasks/:id`
- Purpose: Update a task (fields are optional).
- Request: `{ title?, priority?, window?, deadline?, completed? }`
- Response: `{ task }`
## Analytics (Current MVP)

The Analytics page currently composes data from existing Meta + Shopify endpoints.

- Meta account selection:
  - `GET /meta/ad-accounts` (populate selector)
  - `GET /meta/selected-ad-account`
  - `POST /meta/selected-ad-account`
- Metrics + charts:
  - `GET /meta/top-campaigns?adAccountId=...&range=...`
    - Used to derive spend, estimated revenue (`spend * roas`), ROAS, and net ad profit.
    - Charts are built from top campaigns (labels = campaign names).
- Shopify header info:
  - `GET /shopify/shop`

## Campaigns / Metrics

### `GET /campaign/accounts`
- Response: list of connected ad accounts.

### `GET /campaign/accounts/:accountId/campaigns`
- Response: list campaigns for an ad account.

### `GET /campaign/campaigns/:campaignId/metrics`
- Response: metrics time series for a campaign.

### `POST /campaign/campaigns/sync`
- Purpose: trigger a manual sync job.
- Response: `{ message }`
