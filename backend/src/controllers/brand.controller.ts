import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { getOrCreatePortalUser } from "../services/portal-user.service";
import {
  deleteFromBucket,
  getLogoBucket,
  getProductBucket,
  getPublicUrl,
  uploadToBucket,
} from "../services/supabase-storage.service";

const base64Schema = z.string().min(1);
const uploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  dataBase64: base64Schema,
});

const colorsSchema = z.object({
  colors: z.array(z.string().regex(/^#([0-9a-fA-F]{6})$/)).max(10),
});

const fontsSchema = z.object({
  fonts: z
    .array(
      z.object({
        family: z.string().min(1),
        variant: z.string().optional(),
      })
    )
    .max(10),
});

function toBuffer(dataBase64: string) {
  return Buffer.from(dataBase64, "base64");
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function getBrandProfileHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const [profile, assets, colors, fonts] = await Promise.all([
      prisma.portalBrandProfile.findUnique({ where: { portalUserId: portalUser.id } }),
      prisma.portalBrandAsset.findMany({
        where: { portalUserId: portalUser.id, type: "product_image" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.portalBrandColor.findMany({
        where: { portalUserId: portalUser.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.portalBrandFont.findMany({
        where: { portalUserId: portalUser.id },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return res.json({
      logoUrl: profile?.logoUrl ?? null,
      products: assets,
      colors: colors.map((c) => c.hex),
      fonts: fonts.map((f) => ({ family: f.family, variant: f.variant ?? null })),
    });
  } catch (err) {
    console.error("getBrandProfileHandler error:", err);
    return res.status(503).json({
      message: "Failed to load brand profile.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function uploadLogoHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const path = `${portalUser.id}/logo-${Date.now()}-${safeName(parsed.data.fileName)}`;
    await uploadToBucket({
      bucket: getLogoBucket(),
      path,
      contentType: parsed.data.contentType,
      buffer: toBuffer(parsed.data.dataBase64),
    });

    const logoUrl = getPublicUrl(getLogoBucket(), path);

    await prisma.portalBrandProfile.upsert({
      where: { portalUserId: portalUser.id },
      create: { portalUserId: portalUser.id, logoUrl },
      update: { logoUrl },
    });

    return res.json({ logoUrl });
  } catch (err) {
    console.error("uploadLogoHandler error:", err);
    return res.status(503).json({
      message: "Failed to upload logo.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function uploadProductHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const count = await prisma.portalBrandAsset.count({
      where: { portalUserId: portalUser.id, type: "product_image" },
    });
    if (count >= 10) {
      return res.status(400).json({ message: "Product image limit reached (10)." });
    }

    const path = `${portalUser.id}/product-${Date.now()}-${safeName(parsed.data.fileName)}`;
    await uploadToBucket({
      bucket: getProductBucket(),
      path,
      contentType: parsed.data.contentType,
      buffer: toBuffer(parsed.data.dataBase64),
    });

    const url = getPublicUrl(getProductBucket(), path);
    const asset = await prisma.portalBrandAsset.create({
      data: {
        portalUserId: portalUser.id,
        type: "product_image",
        url,
      },
    });

    return res.json({ asset });
  } catch (err) {
    console.error("uploadProductHandler error:", err);
    return res.status(503).json({
      message: "Failed to upload product image.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function deleteProductHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const assetId = typeof req.params.id === "string" ? req.params.id : null;
  if (!assetId) return res.status(400).json({ message: "Missing asset id" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const asset = await prisma.portalBrandAsset.findFirst({
      where: { id: assetId, portalUserId: portalUser.id, type: "product_image" },
    });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    const bucket = getProductBucket();
    const base = getPublicUrl(bucket, "");
    const path = asset.url.replace(base, "").replace(/^\/+/, "");
    if (path) {
      await deleteFromBucket(bucket, path);
    }

    await prisma.portalBrandAsset.delete({ where: { id: asset.id } });

    return res.json({ deleted: true });
  } catch (err) {
    console.error("deleteProductHandler error:", err);
    return res.status(503).json({
      message: "Failed to delete product image.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function updateColorsHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = colorsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    await prisma.$transaction([
      prisma.portalBrandColor.deleteMany({ where: { portalUserId: portalUser.id } }),
      prisma.portalBrandColor.createMany({
        data: parsed.data.colors.map((hex) => ({ portalUserId: portalUser.id, hex })),
      }),
    ]);

    return res.json({ colors: parsed.data.colors });
  } catch (err) {
    console.error("updateColorsHandler error:", err);
    return res.status(503).json({
      message: "Failed to update brand colors.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function updateFontsHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const parsed = fontsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    await prisma.$transaction([
      prisma.portalBrandFont.deleteMany({ where: { portalUserId: portalUser.id } }),
      prisma.portalBrandFont.createMany({
        data: parsed.data.fonts.map((font) => ({
          portalUserId: portalUser.id,
          family: font.family,
          variant: font.variant ?? null,
          source: "google_fonts",
        })),
      }),
    ]);

    return res.json({ fonts: parsed.data.fonts });
  } catch (err) {
    console.error("updateFontsHandler error:", err);
    return res.status(503).json({
      message: "Failed to update brand fonts.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
