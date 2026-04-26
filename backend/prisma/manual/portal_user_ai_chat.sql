CREATE TABLE IF NOT EXISTS "PortalAIChatSession" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "portalUserId" TEXT NOT NULL REFERENCES "PortalUser" ("id") ON DELETE CASCADE,
  "title" TEXT,
  "language" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lastMessageAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "PortalAIChatMessage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL REFERENCES "PortalAIChatSession" ("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "metaJson" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "PortalAIActionLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "portalUserId" TEXT NOT NULL REFERENCES "PortalUser" ("id") ON DELETE CASCADE,
  "sessionId" TEXT REFERENCES "PortalAIChatSession" ("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "paramsJson" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "completedAt" TIMESTAMPTZ,
  "error" TEXT
);

CREATE INDEX IF NOT EXISTS "PortalAIChatSession_portalUserId_idx" ON "PortalAIChatSession" ("portalUserId");
CREATE INDEX IF NOT EXISTS "PortalAIChatSession_portalUserId_lastMessageAt_idx" ON "PortalAIChatSession" ("portalUserId", "lastMessageAt");
CREATE INDEX IF NOT EXISTS "PortalAIChatSession_portalUserId_createdAt_idx" ON "PortalAIChatSession" ("portalUserId", "createdAt");

CREATE INDEX IF NOT EXISTS "PortalAIChatMessage_sessionId_idx" ON "PortalAIChatMessage" ("sessionId");
CREATE INDEX IF NOT EXISTS "PortalAIChatMessage_sessionId_createdAt_idx" ON "PortalAIChatMessage" ("sessionId", "createdAt");

CREATE INDEX IF NOT EXISTS "PortalAIActionLog_portalUserId_idx" ON "PortalAIActionLog" ("portalUserId");
CREATE INDEX IF NOT EXISTS "PortalAIActionLog_portalUserId_requestedAt_idx" ON "PortalAIActionLog" ("portalUserId", "requestedAt");
CREATE INDEX IF NOT EXISTS "PortalAIActionLog_sessionId_requestedAt_idx" ON "PortalAIActionLog" ("sessionId", "requestedAt");
