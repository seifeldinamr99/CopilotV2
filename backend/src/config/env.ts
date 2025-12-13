import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  META_APP_ID: z.string().min(5),
  META_APP_SECRET: z.string().min(10),
  META_REDIRECT_URI: z.string().url(),
  ENCRYPTION_KEY: z.string().min(64),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Missing or invalid environment variables.");
}

export const env = parsed.data;

