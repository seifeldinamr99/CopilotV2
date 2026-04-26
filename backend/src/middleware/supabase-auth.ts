import type { NextFunction, Request, Response } from "express";
import axios from "axios";
import { env, getSupabaseAnonKey } from "../config/env";

declare module "express-serve-static-core" {
  interface Request {
    supabase?: {
      userId: string;
      email?: string;
    };
  }
}

export async function requireSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length);

  try {
    if (!env.SUPABASE_URL) {
      throw new Error("SUPABASE_URL is required to verify Supabase sessions.");
    }

    const anonKey = getSupabaseAnonKey();
    if (!anonKey) {
      throw new Error("SUPABASE_ANON_KEY is required to verify Supabase sessions.");
    }

    // Validate the access token by asking Supabase Auth for the current user.
    // This avoids JWKS/certs differences across Supabase deployments.
    const { data } = await axios.get(`${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    });

    const userId = typeof data?.id === "string" ? data.id : null;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const email = typeof data?.email === "string" ? data.email : null;
    req.supabase = email ? { userId, email } : { userId };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
