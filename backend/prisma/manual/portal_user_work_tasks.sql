CREATE TABLE IF NOT EXISTS "PortalWorkTask" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "portalUserId" TEXT NOT NULL REFERENCES "PortalUser" ("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "window" TEXT NOT NULL,
  "deadline" TIMESTAMPTZ NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "PortalWorkTask_portalUserId_idx" ON "PortalWorkTask" ("portalUserId");
CREATE INDEX IF NOT EXISTS "PortalWorkTask_deadline_idx" ON "PortalWorkTask" ("deadline");
CREATE INDEX IF NOT EXISTS "PortalWorkTask_priority_idx" ON "PortalWorkTask" ("priority");
CREATE INDEX IF NOT EXISTS "PortalWorkTask_window_idx" ON "PortalWorkTask" ("window");
