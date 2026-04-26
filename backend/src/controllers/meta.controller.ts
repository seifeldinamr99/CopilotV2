import type { Request, Response } from "express";
import crypto from "crypto";
import { MetaService } from "../services/meta.service";
import { decrypt } from "../utils/encryption";
import { signMetaState } from "../utils/jwt";
import { prisma } from "../config/database";
import { getOrCreatePortalUser } from "../services/portal-user.service";
import { env } from "../config/env";

function computeSinceUntil(range: string): { since: string; until: string } {
  const now = new Date();
  const until = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const since = new Date(until);

  const subDays = (days: number) => since.setUTCDate(since.getUTCDate() - days);
  switch (range) {
    case "today":
      break;
    case "last_14_days":
      subDays(14);
      break;
    case "last_month":
      subDays(30);
      break;
    case "last_3_months":
      subDays(90);
      break;
    case "last_6_months":
      subDays(180);
      break;
    case "last_year":
      subDays(365);
      break;
    default:
      subDays(14);
  }

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { since: fmt(since), until: fmt(until) };
}

export async function metaConnectUrlHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const state = signMetaState({
      userId: portalUser.id,
      nonce: crypto.randomBytes(16).toString("hex"),
    });
    const url = MetaService.getLoginUrl(state);
    return res.json({ url, persisted: true });
  } catch (err) {
    console.error("metaConnectUrlHandler error:", err);
    // Persisted flow is required for /api/meta/status and /api/meta/top-campaigns to work.
    return res.status(503).json({
      message: "Meta connect unavailable (database unreachable). Please try again.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaStatusHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const stored = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { metaAccessToken: true },
    });

    return res.json({ connected: Boolean(stored?.metaAccessToken) });
  } catch (err) {
    console.error("metaStatusHandler error:", err);
    // If DB is unavailable, treat as disconnected instead of crashing the UI.
    return res.status(503).json({
      message: "Meta status unavailable.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaAdAccountsHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const user = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken) {
      return res.status(409).json({ message: "Meta not connected." });
    }

    const accessToken = decrypt(user.metaAccessToken);
    const profile = await MetaService.getMe(accessToken);
    const adAccounts = await MetaService.getAdAccounts(accessToken);

    return res.json({ profile, adAccounts });
  } catch (err) {
    console.error("metaAdAccountsHandler error:", err);
    return res.status(503).json({
      message: "Failed to load Meta accounts.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaTopCampaignsHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const adAccountId = typeof req.query.adAccountId === "string" ? req.query.adAccountId : null;
  const range = typeof req.query.range === "string" ? req.query.range : "last_14_days";

  if (!adAccountId) return res.status(400).json({ message: "Missing adAccountId" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const user = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken) {
      return res.status(409).json({ message: "Meta not connected." });
    }

    const accessToken = decrypt(user.metaAccessToken);
    const { since, until } = computeSinceUntil(range);
    const rows = await MetaService.getTopCampaignsByRoas({
      accessToken,
      adAccountId,
      since,
      until,
      limit: 5,
    });

    return res.json({ range, since, until, rows });
  } catch (err) {
    console.error("metaTopCampaignsHandler error:", err);
    return res.status(503).json({
      message: "Failed to load campaigns from Meta.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaSpendBreakdownHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const adAccountId = typeof req.query.adAccountId === "string" ? req.query.adAccountId : null;
  const range = typeof req.query.range === "string" ? req.query.range : "last_14_days";

  if (!adAccountId) return res.status(400).json({ message: "Missing adAccountId" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const user = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken) {
      return res.status(409).json({ message: "Meta not connected." });
    }

    const accessToken = decrypt(user.metaAccessToken);
    const { since, until } = computeSinceUntil(range);

    const [campaigns, adSets, ads] = await Promise.all([
      MetaService.getSpendBreakdown({ accessToken, adAccountId, since, until, level: "campaign", limit: 50 }),
      MetaService.getSpendBreakdown({ accessToken, adAccountId, since, until, level: "adset", limit: 50 }),
      MetaService.getSpendBreakdown({ accessToken, adAccountId, since, until, level: "ad", limit: 50 }),
    ]);

    return res.json({ range, since, until, campaigns, adSets, ads });
  } catch (err) {
    console.error("metaSpendBreakdownHandler error:", err);
    return res.status(503).json({
      message: "Failed to load Meta spend breakdown.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaDisconnectHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    await prisma.portalUser.update({
      where: { id: portalUser.id },
      data: { metaAccessToken: null },
    });

    return res.json({ disconnected: true });
  } catch (err) {
    console.error("metaDisconnectHandler error:", err);
    return res.status(503).json({
      message: "Failed to disconnect Meta.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaSelectedAdAccountGetHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const stored = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { metaSelectedAdAccountId: true },
    });

    return res.json({ adAccountId: stored?.metaSelectedAdAccountId ?? null });
  } catch (err) {
    console.error("metaSelectedAdAccountGetHandler error:", err);
    return res.status(503).json({
      message: "Failed to load selected Meta ad account.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaSelectedAdAccountSetHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const adAccountId =
    typeof req.body?.adAccountId === "string" ? req.body.adAccountId.trim() : null;

  if (adAccountId !== null && adAccountId.length === 0) {
    return res.status(400).json({ message: "Invalid adAccountId" });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    await prisma.portalUser.update({
      where: { id: portalUser.id },
      data: { metaSelectedAdAccountId: adAccountId },
    });

    return res.json({ adAccountId });
  } catch (err) {
    console.error("metaSelectedAdAccountSetHandler error:", err);
    return res.status(503).json({
      message: "Failed to save selected Meta ad account.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function metaAdsLibrarySearchHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const searchTerms = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const country = typeof req.query.country === "string" ? req.query.country.trim().toUpperCase() : "US";
  const status =
    typeof req.query.status === "string" ? req.query.status.trim().toUpperCase() : "ALL";
  const after = typeof req.query.after === "string" ? req.query.after : undefined;
  const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 24;
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(48, limitRaw)) : 24;

  if (!searchTerms) return res.status(400).json({ message: "Missing q (search terms)" });
  if (!/^[A-Z]{2}$/.test(country)) return res.status(400).json({ message: "Invalid country code" });
  if (!["ALL", "ACTIVE", "INACTIVE"].includes(status)) return res.status(400).json({ message: "Invalid status" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const user = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { metaAccessToken: true },
    });

    if (!user?.metaAccessToken) return res.status(409).json({ message: "Meta not connected." });

    const accessToken = decrypt(user.metaAccessToken);
    const { ads, paging } = await MetaService.searchAdsLibrary({
      accessToken,
      searchTerms,
      country,
      adActiveStatus: status as any,
      limit,
      ...(after ? { after } : {}),
    });

    return res.json({
      q: searchTerms,
      country,
      status,
      ads,
      paging,
    });
  } catch (err) {
    console.error("metaAdsLibrarySearchHandler error:", err);
    return res.status(503).json({
      message: "Failed to search Meta Ads Library.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
