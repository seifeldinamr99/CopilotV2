import axios from "axios";
import { env } from "../config/env";

const META_VERSION = "v20.0";
const GRAPH_BASE = `https://graph.facebook.com/${META_VERSION}`;
const ADS_LIBRARY_VERSION = "v14.0";
const ADS_LIBRARY_GRAPH_BASE = `https://graph.facebook.com/${ADS_LIBRARY_VERSION}`;
const OAUTH_DIALOG = `https://www.facebook.com/${META_VERSION}/dialog/oauth`;
const META_SCOPES = [
  "ads_management",
  "ads_read",
  "business_management",
  "read_insights",
];

export type MetaAdAccount = {
  id: string;
  name: string;
  account_id?: string;
  currency?: string;
  timezone_name?: string;
};

export type MetaTopCampaignRow = {
  id: string;
  name: string;
  reach: number;
  purchases: number;
  roas: number;
  amountSpentEgp: number;
  costPerPurchaseEgp: number;
};

export type MetaSpendBreakdownRow = {
  id: string;
  name: string;
  spend: number;
  purchases: number;
  roas: number;
};

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return 0;
}

function pickPurchaseCount(actions: unknown): number {
  if (!Array.isArray(actions)) return 0;
  const types = new Set(["purchase", "offsite_conversion.purchase", "omni_purchase"]);
  for (const entry of actions) {
    if (!entry || typeof entry !== "object") continue;
    const actionType = (entry as any).action_type;
    const value = (entry as any).value;
    if (typeof actionType === "string" && types.has(actionType)) {
      return parseNumber(value);
    }
  }
  return 0;
}

function pickCostPerPurchase(costs: unknown): number {
  if (!Array.isArray(costs)) return 0;
  const types = new Set(["purchase", "offsite_conversion.purchase", "omni_purchase"]);
  for (const entry of costs) {
    if (!entry || typeof entry !== "object") continue;
    const actionType = (entry as any).action_type;
    const value = (entry as any).value;
    if (typeof actionType === "string" && types.has(actionType)) {
      return parseNumber(value);
    }
  }
  return 0;
}

function pickPurchaseRoas(purchaseRoas: unknown): number {
  if (!Array.isArray(purchaseRoas)) return 0;
  // Meta returns an array; typically first item has `value`
  const first = purchaseRoas[0] as any;
  return parseNumber(first?.value);
}

export class MetaService {
  static getLoginUrl(state: string) {
    const params = new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: env.META_REDIRECT_URI,
      scope: META_SCOPES.join(","),
      response_type: "code",
      state,
    });
    return `${OAUTH_DIALOG}?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string) {
    const { data } = await axios.get(`${GRAPH_BASE}/oauth/access_token`, {
      params: {
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        redirect_uri: env.META_REDIRECT_URI,
        code,
      },
    });
    return {
      accessToken: data.access_token as string,
      expiresIn: data.expires_in as number,
    };
  }

  static async exchangeForLongLivedToken(token: string) {
    const { data } = await axios.get(`${GRAPH_BASE}/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        fb_exchange_token: token,
      },
    });
    return {
      accessToken: data.access_token as string,
      expiresIn: data.expires_in as number,
    };
  }

  static async getMe(accessToken: string) {
    const { data } = await axios.get(`${GRAPH_BASE}/me`, {
      params: { access_token: accessToken, fields: "id,name" },
    });
    return { id: data.id as string, name: data.name as string };
  }

  static async getAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
    const { data } = await axios.get(`${GRAPH_BASE}/me/adaccounts`, {
      params: {
        access_token: accessToken,
        fields: "id,name,account_id,currency,timezone_name",
        limit: 100,
      },
    });

    return (data?.data ?? []) as MetaAdAccount[];
  }

  static async getTopCampaignsByRoas(params: {
    accessToken: string;
    adAccountId: string;
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
    limit?: number;
  }): Promise<MetaTopCampaignRow[]> {
    const { accessToken, adAccountId, since, until, limit = 5 } = params;

    const accountId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

    const { data } = await axios.get(`${GRAPH_BASE}/${accountId}/insights`, {
      params: {
        access_token: accessToken,
        level: "campaign",
        time_range: JSON.stringify({ since, until }),
        fields: [
          "campaign_id",
          "campaign_name",
          "reach",
          "spend",
          "actions",
          "cost_per_action_type",
          "purchase_roas",
        ].join(","),
        limit: 500,
      },
    });

    const rows = (data?.data ?? []) as any[];

    return rows
      .map((row) => {
        const purchases = pickPurchaseCount(row.actions);
        const roas = pickPurchaseRoas(row.purchase_roas);
        const amountSpent = parseNumber(row.spend);
        const costPerPurchase = pickCostPerPurchase(row.cost_per_action_type);
        return {
          id: String(row.campaign_id ?? ""),
          name: String(row.campaign_name ?? ""),
          reach: parseNumber(row.reach),
          purchases,
          roas,
          amountSpentEgp: amountSpent,
          costPerPurchaseEgp: costPerPurchase || (purchases > 0 ? amountSpent / purchases : 0),
        } satisfies MetaTopCampaignRow;
      })
      .filter((r) => r.id && r.name)
      .sort((a, b) => b.roas - a.roas)
      .slice(0, limit);
  }

  static async getSpendBreakdown(params: {
    accessToken: string;
    adAccountId: string;
    since: string;
    until: string;
    level: "campaign" | "adset" | "ad";
    limit?: number;
  }): Promise<MetaSpendBreakdownRow[]> {
    const { accessToken, adAccountId, since, until, level, limit = 50 } = params;
    const accountId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

    const fieldsByLevel = {
      campaign: ["campaign_id", "campaign_name"],
      adset: ["adset_id", "adset_name"],
      ad: ["ad_id", "ad_name"],
    } as const;

    const { data } = await axios.get(`${GRAPH_BASE}/${accountId}/insights`, {
      params: {
        access_token: accessToken,
        level,
        time_range: JSON.stringify({ since, until }),
        fields: [...fieldsByLevel[level], "spend", "actions", "purchase_roas"].join(","),
        limit: 500,
      },
    });

    const rows = (data?.data ?? []) as any[];

    const mapped = rows.map((row) => {
      const purchases = pickPurchaseCount(row.actions);
      const roas = pickPurchaseRoas(row.purchase_roas);
      const spend = parseNumber(row.spend);
      const idKey = level === "campaign" ? "campaign_id" : level === "adset" ? "adset_id" : "ad_id";
      const nameKey = level === "campaign" ? "campaign_name" : level === "adset" ? "adset_name" : "ad_name";
      return {
        id: String(row[idKey] ?? ""),
        name: String(row[nameKey] ?? ""),
        spend,
        purchases,
        roas,
      } satisfies MetaSpendBreakdownRow;
    });

    return mapped
      .filter((row) => row.id && row.name)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, limit);
  }

  static async searchAdsLibrary(params: {
    accessToken: string;
    searchTerms: string;
    country: string;
    adActiveStatus?: "ALL" | "ACTIVE" | "INACTIVE";
    limit?: number;
    after?: string;
  }): Promise<{ ads: any[]; paging?: any }> {
    const {
      accessToken,
      searchTerms,
      country,
      adActiveStatus = "ALL",
      limit = 24,
      after,
    } = params;

    const fields = [
      "id",
      "page_id",
      "ad_creation_time",
      "ad_delivery_start_time",
      "ad_delivery_stop_time",
      "ad_snapshot_url",
      "page_name",
      "publisher_platforms",
    ].join(",");

    const attempts: Array<{ base: string; adReachedCountries: string }> = [
      // Docs style (array)
      { base: ADS_LIBRARY_GRAPH_BASE, adReachedCountries: JSON.stringify([country]) },
      // Fallbacks for inconsistent behavior across versions
      { base: ADS_LIBRARY_GRAPH_BASE, adReachedCountries: country },
      { base: GRAPH_BASE, adReachedCountries: JSON.stringify([country]) },
      { base: GRAPH_BASE, adReachedCountries: country },
    ];

    let lastError: unknown = null;
    let lastIsOpaqueFailure = false;

    for (const attempt of attempts) {
      try {
        const { data } = await axios.get(`${attempt.base}/ads_archive`, {
          params: {
            access_token: accessToken,
            search_terms: searchTerms,
            ad_reached_countries: attempt.adReachedCountries,
            ad_active_status: adActiveStatus,
            search_page_ids: "",
            ad_type: "ALL",
            search_type: "KEYWORD_UNORDERED",
            fields,
            limit,
            ...(after ? { after } : {}),
          },
        });

        return { ads: (data?.data ?? []) as any[], paging: data?.paging };
      } catch (err: any) {
        lastError = err;
        const metaErrorCode = err?.response?.data?.error?.code;
        const opaqueFailure = err?.response?.status === 500 && metaErrorCode === 1;
        lastIsOpaqueFailure = opaqueFailure;
        // If it's not the opaque Ads Library failure, don't keep retrying different shapes.
        if (!opaqueFailure) break;
      }
    }

    if (lastIsOpaqueFailure) {
      console.warn("Meta ads_archive returned an opaque error; returning empty results.");
      return { ads: [], paging: undefined };
    }

    const err: any = lastError;
    const status = err?.response?.status as number | undefined;
    const payload = err?.response?.data as unknown;
    const details =
      payload && typeof payload === "object"
        ? JSON.stringify(payload)
        : String(payload ?? err?.message ?? err);
    throw new Error(`Meta ads_archive failed${status ? ` (${status})` : ""}: ${details}`);
  }
}
