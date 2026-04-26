-- Manual migration: add PortalCreative table for saved AI creatives
-- Use this if Prisma migrations cannot run against your DB.

CREATE TABLE IF NOT EXISTS "PortalCreative" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "portalUserId" TEXT NOT NULL REFERENCES "PortalUser" ("id") ON DELETE CASCADE,
  "name" TEXT,
  "imageUrl" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "style" TEXT,
  "aspectRatio" TEXT,
  "model" TEXT,
  "generationTime" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "PortalCreative_portalUserId_idx" ON "PortalCreative" ("portalUserId");
CREATE INDEX IF NOT EXISTS "PortalCreative_createdAt_idx" ON "PortalCreative" ("createdAt");
CREATE INDEX IF NOT EXISTS "PortalCreative_name_idx" ON "PortalCreative" ("name");
CREATE INDEX IF NOT EXISTS "PortalCreative_portalUserId_createdAt_idx" ON "PortalCreative" ("portalUserId", "createdAt" DESC);
