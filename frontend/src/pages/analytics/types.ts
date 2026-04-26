export type MetaAdAccount = {
  id?: string;
  name?: string;
  account_id?: string;
  currency?: string;
  timezone_name?: string;
};

export type MetaTopCampaign = {
  id?: string;
  name?: string;
  reach?: number;
  purchases?: number;
  roas?: number;
  amountSpentEgp?: number;
  costPerPurchaseEgp?: number;
};

export type MetaSpendBreakdownRow = {
  id: string;
  name: string;
  spend: number;
  purchases: number;
  roas: number;
};

export type MetaSpendBreakdown = {
  campaigns: MetaSpendBreakdownRow[];
  adSets: MetaSpendBreakdownRow[];
  ads: MetaSpendBreakdownRow[];
};

export type ShopifyShop = {
  id: number | null;
  domain: string | null;
  myshopifyDomain: string | null;
  primaryDomain: string | null;
};

export type ShopifySalesBreakdown = {
  products: Array<{ productId: number; title: string; sales: number; quantity: number }>;
  collections: Array<{ collectionId: number; title: string; sales: number }>;
  note?: string;
};
