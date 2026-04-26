import axios from "axios";
import { env } from "../config/env";

function requireImageEnv() {
  if (!env.IMAGE_API_KEY) throw new Error("IMAGE_API_KEY is required");
  if (!env.IMAGE_API_URL) throw new Error("IMAGE_API_URL is required");
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const mimeType = String(res.headers["content-type"] ?? "image/jpeg");
    const base64 = Buffer.from(res.data, "binary").toString("base64");
    return { data: base64, mimeType };
  } catch (err) {
    if (env.NODE_ENV === "development") {
      console.warn("[image-generation] Failed to fetch image:", url, err);
    }
    return null;
  }
}

export type ImageGenerationRequest = {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  brandColors?: string[];
  brandLogoUrl?: string;
  productImageUrls?: string[];
  negativePrompt?: string;
  numVariations?: number;
};

export async function generateImages(payload: ImageGenerationRequest) {
  requireImageEnv();
  const {
    prompt,
    style,
    aspectRatio,
    brandColors,
    brandLogoUrl,
    productImageUrls,
    negativePrompt,
    numVariations,
  } = payload;
  const baseUrl = env.IMAGE_API_URL!.replace(/\/$/, "");
  const isGemini = baseUrl.includes("generativelanguage.googleapis.com");

  if (isGemini) {
    const suffix = style ? `Style: ${style}.` : "";
    const ratio = aspectRatio ? `Aspect ratio: ${aspectRatio}.` : "";
    const colors = brandColors?.length ? `Brand colors: ${brandColors.join(", ")}.` : "";
    const logo = brandLogoUrl ? `Brand logo: ${brandLogoUrl}.` : "";
    const products = productImageUrls?.length
      ? `Product images: ${productImageUrls.slice(0, 3).join(", ")}.`
      : "";
    const negative = negativePrompt ? `Avoid: ${negativePrompt}.` : "";
    const content = [prompt, suffix, ratio, colors, logo, products, negative].filter(Boolean).join(" ");
    const model = env.IMAGE_MODEL ?? "gemini-2.5-flash-image";

    const imageParts: Array<{ inlineData: { data: string; mimeType: string } }> = [];
    if (brandLogoUrl) {
      const logoData = await fetchImageAsBase64(brandLogoUrl);
      if (logoData) imageParts.push({ inlineData: logoData });
    }
    if (productImageUrls?.length) {
      const topProducts = productImageUrls.slice(0, 3);
      const productData = await Promise.all(topProducts.map((url) => fetchImageAsBase64(url)));
      productData.filter(Boolean).forEach((img) => {
        if (img) imageParts.push({ inlineData: img });
      });
    }

    const { data } = await axios.post(
      `${baseUrl}/v1beta/models/${model}:generateContent?key=${env.IMAGE_API_KEY}`,
      {
        contents: [{ parts: [{ text: content }, ...imageParts] }],
        generationConfig: {
          response_modalities: ["TEXT", "IMAGE"],
          image_config: {
            aspect_ratio: aspectRatio,
          },
        },
      },
      { headers: { "Content-Type": "application/json" } },
    );

    if (env.NODE_ENV === "development") {
      // Debug Gemini response shape during integration.
      console.log("[image-generation] Gemini parts:", data?.candidates?.[0]?.content?.parts);
    }

    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const images = parts
      .map((part: any) => {
        const inline = part?.inlineData ?? part?.inline_data;
        if (!inline?.data || !inline?.mimeType?.startsWith("image/")) return null;
        return {
          url: `data:${inline.mimeType};base64,${inline.data}`,
          generation_id: null,
        };
      })
      .filter(Boolean);

    return {
      images,
      generation_time: data?.usageMetadata?.totalTokenCount ?? null,
    };
  }

  const url = `${baseUrl}/generate`;
  const { data } = await axios.post(
    url,
    {
      prompt,
      style,
      aspect_ratio: aspectRatio,
      brand_colors: brandColors,
      negative_prompt: negativePrompt,
      num_variations: numVariations,
    },
    {
      headers: {
        Authorization: `Bearer ${env.IMAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return data as {
    images?: Array<{ url?: string; generation_id?: string }>;
    generation_time?: number;
  };
}
