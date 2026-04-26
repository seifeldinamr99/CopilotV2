export type TopCampaignsRange = {
  key: "last_14_days" | "last_month" | "last_3_months" | "last_6_months" | "last_year";
  label: string;
};

export type TopCampaignRow = {
  id: string;
  name: string;
  reach: number;
  purchases: number;
  roas: number;
  amountSpentEgp: number;
  costPerPurchaseEgp: number;
};

export type Recommendation = {
  id: string;
  title: string;
  platform: string;
  source: string;
  action: string;
  impact: string;
  icon?: string;
};
