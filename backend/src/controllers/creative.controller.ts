import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { getOrCreatePortalUser } from "../services/portal-user.service";
import { env } from "../config/env";

const createSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  imageUrl: z.string().min(1),
  prompt: z.string().min(1),
  style: z.string().optional(),
  aspectRatio: z.string().optional(),
  model: z.string().optional(),
  generationTime: z.string().optional(),
});

const renameSchema = z.object({
  name: z.string().min(1).max(120),
});

export async function listCreativesHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const rows = await prisma.portalCreative.findMany({
      where: { portalUser: { supabaseUserId: req.supabase.userId } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json({ creatives: rows });
  } catch (err) {
    console.error("listCreativesHandler error:", err);
    return res.status(503).json({
      message: "Failed to load creatives.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function createCreativeHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const creative = await prisma.portalCreative.create({
      data: {
        portalUserId: portalUser.id,
        name: parsed.data.name ?? null,
        imageUrl: parsed.data.imageUrl,
        prompt: parsed.data.prompt,
        style: parsed.data.style ?? null,
        aspectRatio: parsed.data.aspectRatio ?? null,
        model: parsed.data.model ?? null,
        generationTime: parsed.data.generationTime ?? null,
      },
    });

    return res.json({ creative });
  } catch (err) {
    console.error("createCreativeHandler error:", err);
    return res.status(503).json({
      message: "Failed to save creative.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function updateCreativeNameHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const creativeId = typeof req.params.id === "string" ? req.params.id : null;
  if (!creativeId) return res.status(400).json({ message: "Missing creative id" });

  const parsed = renameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const creative = await prisma.portalCreative.update({
      where: { id: creativeId, portalUserId: portalUser.id },
      data: { name: parsed.data.name },
    });

    return res.json({ creative });
  } catch (err) {
    console.error("updateCreativeNameHandler error:", err);
    return res.status(503).json({
      message: "Failed to update creative name.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
