import type {
  MetaAdAccount,
  MetaSpendBreakdown,
  MetaTopCampaign,
  ShopifySalesBreakdown,
  ShopifyShop,
} from "@/pages/analytics/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export async function fetchMetaAdAccounts(accessToken: string) {
  const res = await fetch(`${API_BASE}/meta/ad-accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch Meta ad accounts (${res.status})`);
  return (await res.json()) as { adAccounts?: MetaAdAccount[] };
}

export async function fetchSelectedAdAccount(accessToken: string) {
  const res = await fetch(`${API_BASE}/meta/selected-ad-account`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch selected Meta ad account (${res.status})`);
  return (await res.json()) as { adAccountId: string | null };
}

export async function saveSelectedAdAccount(accessToken: string, adAccountId: string | null) {
  const res = await fetch(`${API_BASE}/meta/selected-ad-account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ adAccountId }),
  });
  if (!res.ok) throw new Error(`Failed to save selected Meta ad account (${res.status})`);
  return (await res.json()) as { adAccountId: string | null };
}

export async function fetchMetaTopCampaigns(accessToken: string, adAccountId: string, range: string) {
  const res = await fetch(
    `${API_BASE}/meta/top-campaigns?adAccountId=${encodeURIComponent(adAccountId)}&range=${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch Meta top campaigns (${res.status})`);
  return (await res.json()) as { rows?: MetaTopCampaign[] };
}

export async function fetchMetaSpendBreakdown(accessToken: string, adAccountId: string, range: string) {
  const res = await fetch(
    `${API_BASE}/meta/spend-breakdown?adAccountId=${encodeURIComponent(adAccountId)}&range=${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch Meta spend breakdown (${res.status})`);
  return (await res.json()) as MetaSpendBreakdown;
}

export async function fetchShopifyShop(accessToken: string) {
  const res = await fetch(`${API_BASE}/shopify/shop`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { shop?: ShopifyShop | null };
  return data.shop ?? null;
}

export async function fetchShopifySalesBreakdown(accessToken: string, range: string) {
  const res = await fetch(`${API_BASE}/shopify/sales-breakdown?range=${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch Shopify sales breakdown (${res.status})`);
  return (await res.json()) as ShopifySalesBreakdown;
}
