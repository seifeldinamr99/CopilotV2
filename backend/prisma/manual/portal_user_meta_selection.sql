-- Manual migration: add Meta selected ad account to PortalUser
-- Use this if Prisma migrations cannot run against your DB.

ALTER TABLE "PortalUser"
  ADD COLUMN IF NOT EXISTS "metaSelectedAdAccountId" TEXT;

CREATE INDEX IF NOT EXISTS "PortalUser_metaSelectedAdAccountId_idx"
  ON "PortalUser" ("metaSelectedAdAccountId");
