import type { Request, Response } from "express";
import { z } from "zod";
import { generateImages } from "../services/image-generation.service";
import { env } from "../config/env";

const generateSchema = z.object({
  prompt: z.string().min(3),
  style: z.string().min(1).optional(),
  aspectRatio: z.string().min(1).optional(),
  brandColors: z.array(z.string()).optional(),
  brandLogoUrl: z.string().url().optional(),
  productImageUrls: z.array(z.string().url()).max(10).optional(),
  negativePrompt: z.string().min(1).optional(),
  numVariations: z.number().int().min(1).max(5).optional(),
});

export async function generateAiImagesHandler(req: Request, res: Response) {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const data = await generateImages(parsed.data);
    return res.json({
      images: data.images ?? [],
      generationTime: data.generation_time ?? null,
    });
  } catch (err) {
    console.error("generateAiImagesHandler error:", err);
    return res.status(503).json({
      message: "Failed to generate images.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
