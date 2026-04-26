-- Run this in Supabase SQL Editor if Prisma migrations cannot connect.
-- Creates the PortalUser table used for Supabase-authenticated portal users.

create table if not exists "PortalUser" (
  "id" text primary key default gen_random_uuid()::text,
  "supabaseUserId" text not null unique,
  "email" text,
  "name" text,
  "metaAccessToken" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "PortalUser_supabaseUserId_idx" on "PortalUser" ("supabaseUserId");
create index if not exists "PortalUser_email_idx" on "PortalUser" ("email");

