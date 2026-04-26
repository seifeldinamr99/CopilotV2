# DB Schema Notes (Prisma)

Source of truth: `backend/prisma/schema.prisma`.

## Core Models (MVP)
- `User`
  - Legacy email/password auth user (used by `/auth/register` and `/auth/login`).
- `PortalUser`
  - Supabase-authenticated portal user; stores connection tokens and selected Meta ad account.
  - Fields: `shopifyShopDomain`, `shopifyAccessToken`, `metaSelectedAdAccountId`.
- `PortalCreative`
  - Saved AI creatives per portal user (image URL + prompt metadata + name).
- `PortalBrandProfile`
  - One per portal user; stores logo URL.
- `PortalBrandAsset`
  - Product images (type = `product_image`).
- `PortalBrandColor`
  - Brand color palette (hex values).
- `PortalBrandFont`
  - Google Fonts selections (family + variant).
- `PortalAIChatSession`
  - Fields: `id`, `portalUserId`, `title`, `language`, `createdAt`, `updatedAt`, `lastMessageAt`.
- `PortalAIChatMessage`
  - Fields: `id`, `sessionId`, `role`, `content`, `metaJson`, `createdAt`.
- `PortalAIActionLog`
  - Fields: `id`, `portalUserId`, `sessionId`, `action`, `paramsJson`, `status`, `requestedAt`, `completedAt`, `error`.
- `PortalWorkTask`
  - Fields: `id`, `portalUserId`, `title`, `priority`, `window`, `deadline`, `completed`, `createdAt`, `updatedAt`.

## Invariants
- `PortalUser.supabaseUserId` is unique.

## Token Storage
- Store tokens encrypted at rest.
- Never send raw access tokens to the frontend.
