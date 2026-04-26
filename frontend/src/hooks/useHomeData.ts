import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";

export type CampaignRange =
  | "last_14_days"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "last_year";

export type TopCampaignRow = {
  id: string;
  name: string;
  reach: number;
  purchases: number;
  roas: number;
  amountSpentEgp: number;
  costPerPurchaseEgp: number;
};

export function useHomeData() {
  const { t } = useI18n();
  const hour = new Date().getHours();
  const greetingPrefix = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  const recommendations = [
    {
      id: "rec-1",
      title: t("home.recommendation1"),
      platform: "Facebook",
      source: "AGI",
      action: t("home.actionLaunch"),
      impact: t("home.impactHigh"),
      icon: "chart",
    },
    {
      id: "rec-2",
      title: t("home.recommendation2"),
      platform: "Facebook",
      source: "AGI",
      action: t("home.actionResolve"),
      impact: t("home.impactMedium"),
      icon: "alert",
    },
    {
      id: "rec-3",
      title: t("home.recommendation3"),
      platform: "Facebook",
      source: "AGI",
      action: t("home.actionLaunch"),
      impact: t("home.impactHigh"),
      icon: "trophy",
    },
    {
      id: "rec-4",
      title: t("home.recommendation4"),
      platform: "Facebook",
      source: "AGI",
      action: t("home.actionLaunch"),
      impact: t("home.impactHigh"),
      icon: "brain",
    },
  ];

  return useMemo(
    () => ({
      greeting: {
        title: t("home.greeting", {
          time: t(`home.${greetingPrefix}`),
          count: recommendations.length,
        }),
        updatedAgo: t("home.updated", { time: "2h ago" }),
      },
      topCampaignRanges: [
        { key: "last_14_days" as const, label: t("home.range.last_14_days") },
        { key: "last_month" as const, label: t("home.range.last_month") },
        { key: "last_3_months" as const, label: t("home.range.last_3_months") },
        { key: "last_6_months" as const, label: t("home.range.last_6_months") },
        { key: "last_year" as const, label: t("home.range.last_year") },
      ],
      topCampaignsByAccount: {
        default: {
          last_14_days: [
            {
              id: "c1",
              name: "Founder pack – Prospecting",
              reach: 132_400,
              purchases: 1840,
              roas: 4.3,
              amountSpentEgp: 18_250,
              costPerPurchaseEgp: 9.92,
            },
            {
              id: "c2",
              name: "Retargeting – Cart abandoners",
              reach: 48_120,
              purchases: 690,
              roas: 3.7,
              amountSpentEgp: 7_880,
              costPerPurchaseEgp: 11.42,
            },
            {
              id: "c3",
              name: "UGC – Creative test batch 3",
              reach: 96_220,
              purchases: 1020,
              roas: 3.1,
              amountSpentEgp: 14_600,
              costPerPurchaseEgp: 14.31,
            },
            {
              id: "c4",
              name: "Lookalike 3% – Purchasers",
              reach: 210_500,
              purchases: 2210,
              roas: 2.8,
              amountSpentEgp: 29_950,
              costPerPurchaseEgp: 13.56,
            },
            {
              id: "c5",
              name: "Brand search – Always on",
              reach: 22_410,
              purchases: 410,
              roas: 2.2,
              amountSpentEgp: 4_120,
              costPerPurchaseEgp: 10.05,
            },
          ],
          last_month: [],
          last_3_months: [],
          last_6_months: [],
          last_year: [],
        },
      } as Record<string, Record<CampaignRange, TopCampaignRow[]>>,
      goals: [
        {
          label: "Revenue",
          value: 70000,
          target: 100000,
          trend: "+12%",
        },
        {
          label: "Amount spent",
          value: 30000,
          target: 50000,
          trend: "+4%",
        },
        {
          label: "Blended ROAS",
          value: 2.3,
          target: 2.1,
          trend: "+10%",
          isRatio: true,
        },
      ],
      recommendationsListTitle: t("home.recommendationsTitle"),
      recommendations,
    }),
    [greetingPrefix, recommendations, t]
  );
}
