import type { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../config/database";
import { getOrCreatePortalUser } from "../services/portal-user.service";
import { decrypt, encrypt } from "../utils/encryption";
import { signShopifyState, verifyShopifyState } from "../utils/jwt";
import { env, getPortalOrigin } from "../config/env";
import {
  buildShopifyAuthorizeUrl,
  exchangeCodeForAccessToken,
  fetchShopInfo,
  fetchOrders,
  fetchCollects,
  fetchCollections,
  normalizeShopDomain,
  verifyShopifyHmac,
} from "../services/shopify.service";

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

export async function shopifyConnectUrlHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const rawShopDomain = typeof req.body?.shopDomain === "string" ? req.body.shopDomain : null;
  if (!rawShopDomain) return res.status(400).json({ message: "Missing shopDomain" });

  try {
    const shopDomain = normalizeShopDomain(rawShopDomain);

    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const state = signShopifyState({
      userId: portalUser.id,
      shopDomain,
      nonce: crypto.randomBytes(16).toString("hex"),
    });

    const url = buildShopifyAuthorizeUrl({ shopDomain, state });
    return res.json({ url });
  } catch (err) {
    console.error("shopifyConnectUrlHandler error:", err);
    return res.status(500).json({
      message: "Failed to start Shopify connect.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function shopifyCallbackHandler(req: Request, res: Response) {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const shop = typeof req.query.shop === "string" ? req.query.shop : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;

  if (!verifyShopifyHmac(req.query as any)) return res.status(401).send("Invalid HMAC");
  if (!code) return res.status(400).send("Missing code");
  if (!shop) return res.status(400).send("Missing shop");
  if (!state) return res.status(400).send("Missing state");

  try {
    const decoded = verifyShopifyState(state);
    const shopDomain = normalizeShopDomain(shop);

    const { accessToken } = await exchangeCodeForAccessToken({ shopDomain, code });

    // Shopify may redirect with a different domain than the one the user typed (aliases / connected domains).
    // If that happens, validate that the callback shop is still the intended store by checking the Shop object.
    if (decoded.shopDomain !== shopDomain) {
      const info = await fetchShopInfo({ shopDomain, accessToken });
      const candidates = [
        info?.myshopify_domain,
        info?.domain,
        info?.primary_domain?.host ?? undefined,
      ]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .map((v) => normalizeShopDomain(v));

      const expected = normalizeShopDomain(decoded.shopDomain);
      const matches = candidates.includes(expected);

      if (!matches) {
        console.warn("shopifyCallbackHandler: shop mismatch rejected", {
          expected,
          got: shopDomain,
          candidates,
        });
        return res
          .status(401)
          .send(env.NODE_ENV === "development"
            ? `Shop mismatch (expected ${expected}, got ${shopDomain}).`
            : "Shop mismatch");
      }
    }

    await prisma.portalUser.update({
      where: { id: decoded.userId },
      data: {
        shopifyShopDomain: shopDomain,
        shopifyAccessToken: encrypt(accessToken),
      },
    });

    const portalOrigin = getPortalOrigin().replace(/\/$/, "");
    return res.redirect(`${portalOrigin}/shopify/callback?connected=1`);
  } catch (err) {
    console.error("shopifyCallbackHandler error:", err);
    return res.status(500).send(env.NODE_ENV === "development" ? String((err as any)?.message ?? err) : "OAuth failed");
  }
}

export async function shopifyStatusHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const stored = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { shopifyAccessToken: true, shopifyShopDomain: true },
    });

    return res.json({
      connected: Boolean(stored?.shopifyAccessToken),
      ...(stored?.shopifyShopDomain ? { shopDomain: stored.shopifyShopDomain } : {}),
    });
  } catch (err) {
    console.error("shopifyStatusHandler error:", err);
    return res.status(503).json({
      message: "Shopify status unavailable.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function shopifyShopHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const stored = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { shopifyAccessToken: true, shopifyShopDomain: true },
    });

    if (!stored?.shopifyAccessToken || !stored.shopifyShopDomain) {
      return res.status(409).json({ message: "Shopify not connected." });
    }

    const accessToken = decrypt(stored.shopifyAccessToken);
    const info = await fetchShopInfo({
      shopDomain: stored.shopifyShopDomain,
      accessToken,
    });

    const shop = info
      ? {
          id: info.id ?? null,
          domain: info.domain ?? null,
          myshopifyDomain: info.myshopify_domain ?? null,
          primaryDomain: info.primary_domain?.host ?? null,
        }
      : null;

    return res.json({ shop });
  } catch (err) {
    console.error("shopifyShopHandler error:", err);
    return res.status(503).json({
      message: "Failed to load Shopify shop info.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function shopifySalesBreakdownHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  const range = typeof req.query.range === "string" ? req.query.range : "last_14_days";

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    const stored = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
      select: { shopifyAccessToken: true, shopifyShopDomain: true },
    });

    if (!stored?.shopifyAccessToken || !stored.shopifyShopDomain) {
      return res.status(409).json({ message: "Shopify not connected." });
    }

    const accessToken = decrypt(stored.shopifyAccessToken);
    const { since, until } = computeSinceUntil(range);

    const orders = await fetchOrders({
      shopDomain: stored.shopifyShopDomain,
      accessToken,
      createdAtMin: `${since}T00:00:00Z`,
      createdAtMax: `${until}T23:59:59Z`,
    });

    const productTotals = new Map<number, { title: string; sales: number; quantity: number }>();
    for (const order of orders) {
      for (const item of order.line_items ?? []) {
        const price = Number(item.price ?? 0);
        const sales = price * (item.quantity ?? 0);
        const existing = productTotals.get(item.product_id) ?? {
          title: item.title,
          sales: 0,
          quantity: 0,
        };
        existing.sales += sales;
        existing.quantity += item.quantity ?? 0;
        productTotals.set(item.product_id, existing);
      }
    }

    const topProducts = Array.from(productTotals.entries())
      .map(([productId, data]) => ({
        productId,
        title: data.title,
        sales: data.sales,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    const collects = await fetchCollects({
      shopDomain: stored.shopifyShopDomain,
      accessToken,
      productIds: topProducts.map((p) => p.productId),
    });

    const collectionTotals = new Map<number, number>();
    for (const collect of collects) {
      const product = topProducts.find((p) => p.productId === collect.product_id);
      if (!product) continue;
      collectionTotals.set(
        collect.collection_id,
        (collectionTotals.get(collect.collection_id) ?? 0) + product.sales
      );
    }

    const collectionsMeta = await fetchCollections({
      shopDomain: stored.shopifyShopDomain,
      accessToken,
      collectionIds: Array.from(collectionTotals.keys()),
    });

    const topCollections = collectionsMeta
      .map((collection) => ({
        collectionId: collection.id,
        title: collection.title,
        sales: collectionTotals.get(collection.id) ?? 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return res.json({
      range,
      since,
      until,
      products: topProducts,
      collections: topCollections,
      note: "Requires Shopify read_orders scope to populate sales.",
    });
  } catch (err) {
    console.error("shopifySalesBreakdownHandler error:", err);
    return res.status(503).json({
      message: "Failed to load Shopify sales breakdown.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}

export async function shopifyDisconnectHandler(req: Request, res: Response) {
  if (!req.supabase) return res.status(401).json({ message: "Unauthorized" });

  try {
    const portalUser = await getOrCreatePortalUser({
      supabaseUserId: req.supabase.userId,
      ...(req.supabase.email ? { email: req.supabase.email } : {}),
    });

    await prisma.portalUser.update({
      where: { id: portalUser.id },
      data: { shopifyAccessToken: null, shopifyShopDomain: null },
    });

    return res.json({ disconnected: true });
  } catch (err) {
    console.error("shopifyDisconnectHandler error:", err);
    return res.status(503).json({
      message: "Failed to disconnect Shopify.",
      ...(env.NODE_ENV === "development" ? { details: String((err as any)?.message ?? err) } : {}),
    });
  }
}
