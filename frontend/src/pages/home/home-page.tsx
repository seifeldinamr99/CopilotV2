import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHomeData } from "@/hooks/useHomeData";
import { useMetaStore } from "@/store/meta-store";
import { useAuthStore } from "@/store/auth-store";
import { HeroCard } from "@/pages/home/hero-card";
import { TopCampaignsCard } from "@/pages/home/top-campaigns-card";
import { MonthlyGoalsCard } from "@/pages/home/monthly-goals-card";
import { RecommendationList } from "@/pages/home/recommendation-list";
import type { TopCampaignRow } from "@/pages/home/types";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
let todayMetricsCache: { revenue: number | null; spend: number | null; updatedAt: number | null } = {
  revenue: null,
  spend: null,
  updatedAt: null,
};

export function HomePage() {
  const {
    recommendations,
    greeting,
    recommendationsListTitle,
    topCampaignRanges,
    topCampaignsByAccount,
  } = useHomeData();
  const { t } = useI18n();

  const metaAdAccounts = useMetaStore((s) => s.adAccounts);
  const selectedAdAccountId = useMetaStore((s) => s.selectedAdAccountId);
  const setSelectedAdAccountId = useMetaStore((s) => s.setSelectedAdAccountId);
  const session = useAuthStore((s) => s.session);
  const navigate = useNavigate();

  const [range, setRange] = useState(topCampaignRanges[0]?.key ?? "last_14_days");

  const rows = useMemo(() => {
    const accountKey = selectedAdAccountId ?? metaAdAccounts[0]?.id ?? "default";
    const byRange = topCampaignsByAccount[accountKey] ?? topCampaignsByAccount.default;
    const list = byRange?.[range] ?? [];
    return [...list].sort((a, b) => b.roas - a.roas).slice(0, 5);
  }, [metaAdAccounts, range, selectedAdAccountId, topCampaignsByAccount]);

  const [remoteRows, setRemoteRows] = useState<TopCampaignRow[] | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [todaySpend, setTodaySpend] = useState<number | null>(null);
  const [todaySpendError, setTodaySpendError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  React.useEffect(() => {
    const accessToken = session?.access_token;
    const adAccountId = selectedAdAccountId ?? metaAdAccounts[0]?.id ?? null;
    if (!accessToken || !adAccountId) return;

    let canceled = false;
    const controller = new AbortController();
    setLoadingRows(true);
    setRowsError(null);

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/meta/top-campaigns?adAccountId=${encodeURIComponent(adAccountId)}&range=${encodeURIComponent(range)}`,
          { headers: { Authorization: `Bearer ${accessToken}` }, signal: controller.signal }
        );
        if (!res.ok) {
          const contentType = res.headers.get("content-type") ?? "";
          const details =
            contentType.includes("application/json")
              ? JSON.stringify(await res.json())
              : await res.text();
          throw new Error(details || `Failed to load campaigns (${res.status})`);
        }
        const data = (await res.json()) as { rows?: TopCampaignRow[] };
        if (!canceled) setRemoteRows(Array.isArray(data.rows) ? data.rows : []);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error(e);
        if (!canceled) {
          setRemoteRows([]);
          setRowsError(e instanceof Error ? e.message : "Failed to load campaigns");
        }
      } finally {
        if (!canceled) setLoadingRows(false);
      }
    })();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, [metaAdAccounts, range, selectedAdAccountId, session?.access_token]);

  const tableRows = session?.access_token ? remoteRows ?? [] : rows;
  const roasActual = useMemo(() => {
    if (!todayRevenue || !todaySpend || todaySpend <= 0) return null;
    return todayRevenue / todaySpend;
  }, [todayRevenue, todaySpend]);
  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedAt) return null;
    const deltaMs = Date.now() - lastUpdatedAt;
    if (deltaMs < 60 * 1000) return t("home.updatedJustNow");
    const minutes = Math.floor(deltaMs / (60 * 1000));
    if (minutes < 60) return t("home.updatedMinutes", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("home.updatedHours", { count: hours });
    const days = Math.floor(hours / 24);
    return t("home.updatedDays", { count: days });
  }, [lastUpdatedAt, t]);

  useEffect(() => {
    const accessToken = session?.access_token;
    const adAccountId = selectedAdAccountId ?? metaAdAccounts[0]?.id ?? null;
    if (!accessToken || !adAccountId) return;
    let canceled = false;
    setTodaySpendError(null);
    if (todayMetricsCache.revenue !== null) setTodayRevenue(todayMetricsCache.revenue);
    if (todayMetricsCache.spend !== null) setTodaySpend(todayMetricsCache.spend);
    if (todayMetricsCache.updatedAt !== null) setLastUpdatedAt(todayMetricsCache.updatedAt);

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/meta/top-campaigns?adAccountId=${encodeURIComponent(adAccountId)}&range=today`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) {
          const contentType = res.headers.get("content-type") ?? "";
          const details =
            contentType.includes("application/json")
              ? JSON.stringify(await res.json())
              : await res.text();
          throw new Error(details || `Failed to load today's spend (${res.status})`);
        }
        const data = (await res.json()) as { rows?: TopCampaignRow[] };
        const rows = Array.isArray(data.rows) ? data.rows : [];
        const spendTotal = rows.reduce((sum, row) => sum + (row.amountSpentEgp ?? 0), 0);
        const revenueTotal = rows.reduce((sum, row) => {
          const spend = row.amountSpentEgp ?? 0;
          const roas = row.roas ?? 0;
          return sum + spend * roas;
        }, 0);
        if (!canceled) {
          setTodaySpend(spendTotal);
          setTodayRevenue(revenueTotal);
          const updatedAt = Date.now();
          setLastUpdatedAt(updatedAt);
          todayMetricsCache = { spend: spendTotal, revenue: revenueTotal, updatedAt };
        }
      } catch (err) {
        if (!canceled) {
          setTodaySpend(null);
          setTodayRevenue(null);
          setTodaySpendError(err instanceof Error ? err.message : "Failed to load today's spend.");
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [metaAdAccounts, selectedAdAccountId, session?.access_token]);

  return (
    <div className="flex flex-col gap-8">
      <HeroCard
        title={greeting.title}
        subtitle={lastUpdatedLabel ?? greeting.updatedAgo}
        recommendationCount={recommendations.length}
        onAskAi={() => navigate("/ai-chat")}
      />
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <TopCampaignsCard
          rows={tableRows}
          loading={loadingRows}
          error={rowsError}
          range={range}
          onRangeChange={setRange}
          ranges={topCampaignRanges}
          adAccounts={metaAdAccounts}
          selectedAdAccountId={selectedAdAccountId}
          onSelectAdAccount={setSelectedAdAccountId}
        />
        <MonthlyGoalsCard
          revenueToday={todayRevenue}
          spendToday={todaySpend}
          roasToday={roasActual}
        />
      </div>
      <RecommendationList recommendations={recommendations} title={recommendationsListTitle} />
      {todaySpendError && <p className="text-xs text-destructive">{todaySpendError}</p>}
    </div>
  );
}
