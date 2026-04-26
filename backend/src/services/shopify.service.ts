import crypto from "crypto";
import axios from "axios";
import { env } from "../config/env";

function requireShopifyEnv() {
  if (!env.SHOPIFY_API_KEY) throw new Error("SHOPIFY_API_KEY is required");
  if (!env.SHOPIFY_API_SECRET) throw new Error("SHOPIFY_API_SECRET is required");
  if (!env.SHOPIFY_SCOPES) throw new Error("SHOPIFY_SCOPES is required");
  if (!env.SHOPIFY_REDIRECT_URI) throw new Error("SHOPIFY_REDIRECT_URI is required");
}

export function normalizeShopDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");

  // Accept admin URLs like: admin.shopify.com/store/<store-handle>
  const adminMatch = withoutProtocol.match(/^admin\.shopify\.com\/store\/([a-z0-9][a-z0-9-]*)/);
  const raw = adminMatch?.[1] ?? withoutProtocol.replace(/\/.*$/, "");

  const base = raw.endsWith(".myshopify.com") ? raw : `${raw}.myshopify.com`;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(base)) {
    throw new Error("Invalid shop domain");
  }
  return base;
}

export function buildShopifyAuthorizeUrl(params: { shopDomain: string; state: string }): string {
  requireShopifyEnv();
  const { shopDomain, state } = params;
  const url = new URL(`https://${shopDomain}/admin/oauth/authorize`);
  url.searchParams.set("client_id", env.SHOPIFY_API_KEY!);
  url.searchParams.set("scope", env.SHOPIFY_SCOPES!);
  url.searchParams.set("redirect_uri", env.SHOPIFY_REDIRECT_URI!);
  url.searchParams.set("state", state);
  return url.toString();
}

export function verifyShopifyHmac(query: Record<string, unknown>): boolean {
  requireShopifyEnv();
  const hmac = typeof query.hmac === "string" ? query.hmac : null;
  if (!hmac) return false;

  const pairs: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (key === "hmac" || key === "signature") continue;
    if (typeof value === "undefined" || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) pairs.push(`${key}=${String(v)}`);
    } else {
      pairs.push(`${key}=${String(value)}`);
    }
  }
  pairs.sort();
  const message = pairs.join("&");

  const digest = crypto
    .createHmac("sha256", env.SHOPIFY_API_SECRET!)
    .update(message)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "utf8"), Buffer.from(hmac, "utf8"));
  } catch {
    return false;
  }
}

export async function exchangeCodeForAccessToken(params: { shopDomain: string; code: string }) {
  requireShopifyEnv();
  const { shopDomain, code } = params;
  const { data } = await axios.post(
    `https://${shopDomain}/admin/oauth/access_token`,
    {
      client_id: env.SHOPIFY_API_KEY,
      client_secret: env.SHOPIFY_API_SECRET,
      code,
    },
    { headers: { "Content-Type": "application/json" } },
  );
  const accessToken = typeof data?.access_token === "string" ? data.access_token : null;
  if (!accessToken) throw new Error("Missing Shopify access_token");
  const scope = typeof data?.scope === "string" ? data.scope : null;
  return { accessToken, scope };
}

export async function fetchShopInfo(params: { shopDomain: string; accessToken: string }) {
  const { shopDomain, accessToken } = params;
  const { data } = await axios.get(`https://${shopDomain}/admin/api/2025-10/shop.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });
  return data?.shop as
    | {
        id?: number;
        domain?: string;
        myshopify_domain?: string;
        primary_domain?: { host?: string } | null;
      }
    | undefined;
}

export async function fetchOrders(params: {
  shopDomain: string;
  accessToken: string;
  createdAtMin: string;
  createdAtMax: string;
}) {
  const { shopDomain, accessToken, createdAtMin, createdAtMax } = params;
  const { data } = await axios.get(`https://${shopDomain}/admin/api/2025-10/orders.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
    params: {
      status: "any",
      created_at_min: createdAtMin,
      created_at_max: createdAtMax,
      limit: 250,
      fields: "id,created_at,line_items,total_price",
    },
  });
  return (data?.orders ?? []) as Array<{
    id: number;
    created_at: string;
    total_price: string;
    line_items: Array<{ product_id: number; title: string; price: string; quantity: number }>;
  }>;
}

export async function fetchCollects(params: {
  shopDomain: string;
  accessToken: string;
  productIds: number[];
}) {
  const { shopDomain, accessToken, productIds } = params;
  if (productIds.length === 0) return [];
  const { data } = await axios.get(`https://${shopDomain}/admin/api/2025-10/collects.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
    params: {
      product_id: productIds.join(","),
      limit: 250,
      fields: "product_id,collection_id",
    },
  });
  return (data?.collects ?? []) as Array<{ product_id: number; collection_id: number }>;
}

export async function fetchCollections(params: {
  shopDomain: string;
  accessToken: string;
  collectionIds: number[];
}) {
  const { shopDomain, accessToken, collectionIds } = params;
  if (collectionIds.length === 0) return [];
  const { data } = await axios.get(`https://${shopDomain}/admin/api/2025-10/custom_collections.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
    params: {
      ids: collectionIds.join(","),
      limit: 250,
      fields: "id,title,handle",
    },
  });
  return (data?.custom_collections ?? []) as Array<{ id: number; title: string; handle: string }>;
}
