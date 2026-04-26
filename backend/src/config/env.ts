import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(10),
  META_APP_ID: z.string().min(1),
  META_APP_SECRET: z.string().min(1),
  META_REDIRECT_URI: z.string().url(),
  SHOPIFY_API_KEY: z.string().min(1).optional(),
  SHOPIFY_API_SECRET: z.string().min(1).optional(),
  SHOPIFY_SCOPES: z.string().min(1).optional(),
  SHOPIFY_REDIRECT_URI: z.string().url().optional(),
  PORTAL_ORIGIN: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().min(64),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(10).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  IMAGE_API_KEY: z.string().min(1).optional(),
  IMAGE_API_URL: z.string().url().optional(),
  IMAGE_MODEL: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("? Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Missing or invalid environment variables.");
}

export const env = parsed.data;

export function getSupabaseJwksUrl(): string | null {
  const explicit = env.SUPABASE_JWKS_URL;
  if (explicit) return explicit;
  const base = env.SUPABASE_URL;
  if (!base) return null;
  // Supabase JWKS endpoint is publicly accessible here.
  return `${base.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json`;
}

export function getSupabaseAnonKey(): string | null {
  return env.SUPABASE_ANON_KEY ?? null;
}

export function getPortalOrigin(): string {
  return env.PORTAL_ORIGIN ?? "http://localhost:5173";
}
