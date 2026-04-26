-- Manual migration: add Brand Library tables
-- Use this if Prisma migrations cannot run against your DB.

create table if not exists "PortalBrandProfile" (
  "id" text primary key default gen_random_uuid()::text,
  "portalUserId" text not null unique references "PortalUser" ("id") on delete cascade,
  "logoUrl" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "PortalBrandAsset" (
  "id" text primary key default gen_random_uuid()::text,
  "portalUserId" text not null references "PortalUser" ("id") on delete cascade,
  "type" text not null,
  "url" text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "PortalBrandColor" (
  "id" text primary key default gen_random_uuid()::text,
  "portalUserId" text not null references "PortalUser" ("id") on delete cascade,
  "hex" text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "PortalBrandFont" (
  "id" text primary key default gen_random_uuid()::text,
  "portalUserId" text not null references "PortalUser" ("id") on delete cascade,
  "family" text not null,
  "variant" text,
  "source" text not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists "PortalBrandProfile_portalUserId_idx" on "PortalBrandProfile" ("portalUserId");
create index if not exists "PortalBrandAsset_portalUserId_idx" on "PortalBrandAsset" ("portalUserId");
create index if not exists "PortalBrandAsset_type_idx" on "PortalBrandAsset" ("type");
create index if not exists "PortalBrandColor_portalUserId_idx" on "PortalBrandColor" ("portalUserId");
create index if not exists "PortalBrandFont_portalUserId_idx" on "PortalBrandFont" ("portalUserId");
