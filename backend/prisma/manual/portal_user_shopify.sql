-- Manual migration: add Shopify fields to PortalUser
-- Use this if Prisma migrations cannot run against your DB.

ALTER TABLE "PortalUser"
  ADD COLUMN IF NOT EXISTS "shopifyShopDomain" TEXT,
  ADD COLUMN IF NOT EXISTS "shopifyAccessToken" TEXT;

CREATE INDEX IF NOT EXISTS "PortalUser_shopifyShopDomain_idx" ON "PortalUser" ("shopifyShopDomain");
D:\OneDrive - Egypt University of Informatics\Desktop\Meta-Coplit-V2\CopilotV2\backend\prisma\manual