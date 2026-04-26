-- Manual migration: add legacy User table (email/password auth)
-- Use this if Prisma migrations cannot run against your DB.

create table if not exists "User" (
  "id" text primary key default gen_random_uuid()::text,
  "email" text not null unique,
  "passwordHash" text not null,
  "name" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "User_email_idx" on "User" ("email");
