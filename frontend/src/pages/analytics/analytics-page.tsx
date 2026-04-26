import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { rangeOptions } from "@/pages/analytics/constants";
import { MetricCard } from "@/pages/analytics/metric-card";
import { ChartCard } from "@/pages/analytics/chart-card";
import { BarChartCard } from "@/pages/analytics/bar-chart-card";
import { DataModal } from "@/pages/analytics/data-modal";
import { BreakdownTable } from "@/pages/analytics/breakdown-table";
import { SalesTable } from "@/pages/analytics/sales-table";
import { formatCurrency } from "@/pages/analytics/utils";
import { useI18n } from "@/lib/i18n";
import type {
  MetaAdAccount,
  MetaSpendBreakdown,
  MetaTopCampaign,
  ShopifySalesBreakdown,
  ShopifyShop,
} from "@/pages/analytics/types";
import {
  fetchMetaAdAccounts,
  fetchMetaSpendBreakdown,
  fetchMetaTopCampaigns,
  fetchSelectedAdAccount,
  fetchShopifySalesBreakdown,
  fetchShopifyShop,
  saveSelectedAdAccount,
} from "@/pages/analytics/api";

export function AnalyticsPage() {
  const session = useAuthStore((s) => s.session);
  const accessToken = session?.access_token ?? null;
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";

  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [range, setRange] = useState(rangeOptions[0].value);
  const [topCampaigns, setTopCampaigns] = useState<MetaTopCampaign[]>([]);
  const [shop, setShop] = useState<ShopifyShop | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectionSaving, setSelectionSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spendBreakdown, setSpendBreakdown] = useState<MetaSpendBreakdown | null>(null);
  const [salesBreakdown, setSalesBreakdown] = useState<ShopifySalesBreakdown | null>(null);
  const [spendLoading, setSpendLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [spendError, setSpendError] = useState<string | null>(null);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [spendModalOpen, setSpendModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);

  const rangeLabel = useMemo(() => {
    return t(`analytics.range.${range}`) ?? t("analytics.range.selected");
  }, [range, t]);

  useEffect(() => {
    if (!accessToken) return;
    let canceled = false;

    (async () => {
      try {
        setError(null);
        const [meta, selected, shopData] = await Promise.all([
          fetchMetaAdAccounts(accessToken),
          fetchSelectedAdAccount(accessToken),
          fetchShopifyShop(accessToken),
        ]);

        if (canceled) return;

        setAdAccounts(Array.isArray(meta.adAccounts) ? meta.adAccounts : []);
        setSelectedAccountId(selected.adAccountId ?? null);
        setShop(shopData);
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : t("analytics.loadDependenciesError"));
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken, t]);

  useEffect(() => {
    if (!accessToken || !selectedAccountId) {
      setTopCampaigns([]);
      return;
    }

    let canceled = false;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchMetaTopCampaigns(accessToken, selectedAccountId, range);
        if (!canceled) setTopCampaigns(Array.isArray(data.rows) ? data.rows : []);
      } catch (err) {
        if (!canceled) setError(err instanceof Error ? err.message : t("analytics.loadMetaError"));
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken, selectedAccountId, range, t]);

  useEffect(() => {
    if (!accessToken || !selectedAccountId || !spendModalOpen) return;
    let canceled = false;
    setSpendLoading(true);
    setSpendError(null);

    (async () => {
      try {
        const data = await fetchMetaSpendBreakdown(accessToken, selectedAccountId, range);
        if (!canceled) setSpendBreakdown(data);
      } catch (err) {
        if (!canceled) setSpendError(err instanceof Error ? err.message : t("analytics.loadSpendError"));
      } finally {
        if (!canceled) setSpendLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken, selectedAccountId, range, spendModalOpen, t]);

  useEffect(() => {
    if (!accessToken || !revenueModalOpen) return;
    if (!shop?.myshopifyDomain) {
      setSalesBreakdown(null);
      setSalesError(t("analytics.connectShopify"));
      return;
    }
    let canceled = false;
    setSalesLoading(true);
    setSalesError(null);

    (async () => {
      try {
        const data = await fetchShopifySalesBreakdown(accessToken, range);
        if (!canceled) setSalesBreakdown(data);
      } catch (err) {
        if (canceled) return;
        const message = err instanceof Error ? err.message : t("analytics.loadShopifyError");
        if (message.includes("503")) {
          setSalesBreakdown({
            products: [],
            collections: [],
            note: t("analytics.shopifyUnavailable"),
          });
          setSalesError(null);
          return;
        }
        setSalesError(message);
      } finally {
        if (!canceled) setSalesLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken, range, revenueModalOpen, shop?.myshopifyDomain, t]);

  const totalSpend = useMemo(() => {
    return topCampaigns.reduce((sum, row) => sum + (row.amountSpentEgp ?? 0), 0);
  }, [topCampaigns]);

  const totalRevenue = useMemo(() => {
    return topCampaigns.reduce((sum, row) => {
      const spend = row.amountSpentEgp ?? 0;
      const roas = row.roas ?? 0;
      return sum + spend * roas;
    }, 0);
  }, [topCampaigns]);

  const roas = totalSpend > 0 ? totalRevenue / totalSpend : null;
  const netAdProfit = totalRevenue > 0 ? totalRevenue - totalSpend : null;
  const totalPurchases = useMemo(() => {
    return topCampaigns.reduce((sum, row) => sum + (row.purchases ?? 0), 0);
  }, [topCampaigns]);

  const metricCards = [
    {
      title: t("analytics.totalAdSpend"),
      value: totalSpend > 0 ? formatCurrency(totalSpend) : "-",
      meta: `EGP • ${rangeLabel}`,
      platforms: ["meta"],
      onClick: () => setSpendModalOpen(true),
    },
    {
      title: t("analytics.revenue"),
      value: totalRevenue > 0 ? formatCurrency(totalRevenue) : "-",
      meta: `EGP • ${rangeLabel}`,
      platforms: ["meta", "shopify"],
      onClick: () => setRevenueModalOpen(true),
    },
    {
      title: t("analytics.roasAdsOnly"),
      value: roas ? `${roas.toFixed(2)}x` : "-",
      meta: `${t("analytics.ratioLabel")} • ${rangeLabel}`,
      platforms: ["meta", "shopify"],
    },
    {
      title: t("analytics.netAdProfit"),
      value: netAdProfit !== null ? formatCurrency(netAdProfit) : "-",
      meta: `EGP • ${rangeLabel}`,
      platforms: ["meta", "shopify"],
    },
    {
      title: t("analytics.purchases"),
      value: topCampaigns.length ? `${totalPurchases}` : "-",
      meta: `${t("analytics.metaLabel")} • ${rangeLabel}`,
      platforms: ["meta"],
    },
  ];

  const chartLabels = topCampaigns.map((row) => row.name ?? t("analytics.campaign"));
  const revenueSeries = topCampaigns.map((row) => (row.amountSpentEgp ?? 0) * (row.roas ?? 0));
  const purchasesSeries = topCampaigns.map((row) => row.purchases ?? 0);

  const campaignEmptyState = useMemo(() => {
    if (loading) return t("analytics.loadingCampaigns");
    if (!selectedAccountId) return t("analytics.selectAccountToLoad");
    if (chartLabels.length === 0) return t("analytics.noCampaignData");
    return undefined;
  }, [chartLabels.length, loading, selectedAccountId, t]);

  const mappingLabel = useMemo(() => {
    if (!shop?.myshopifyDomain || !selectedAccountId) return null;
    const account = adAccounts.find((item) => item.id === selectedAccountId);
    const accountLabel = account?.name ?? account?.account_id ?? selectedAccountId;
    return `${shop.myshopifyDomain} → ${accountLabel}`;
  }, [adAccounts, selectedAccountId, shop?.myshopifyDomain]);

  return (
    <div className={`space-y-6 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t("analytics.title")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t("analytics.subtitle")}</h2>
            <p className="mt-2 text-sm text-white/60">{t("analytics.description")}</p>
            {shop?.myshopifyDomain && (
              <p className="mt-3 text-xs text-white/60">
                {t("analytics.shopifyStore")}: {shop.myshopifyDomain}
              </p>
            )}
            {mappingLabel && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span>
                  {t("analytics.mapping")}: {mappingLabel}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {t("analytics.changeMapping")}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-white/60">{t("analytics.adAccount")}</span>
              <select
                className="bg-transparent text-sm text-white outline-none"
                value={selectedAccountId ?? ""}
                onChange={async (event) => {
                  if (!accessToken) return;
                  const value = event.target.value || null;
                  setSelectedAccountId(value);
                  try {
                    setSelectionSaving(true);
                    await saveSelectedAdAccount(accessToken, value);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : t("analytics.saveSelectionError"));
                  } finally {
                    setSelectionSaving(false);
                  }
                }}
              >
                <option value="" className="text-slate-900">
                  {t("analytics.selectAccount")}
                </option>
                {adAccounts.map((account) => (
                  <option key={account.id} value={account.id ?? ""} className="text-slate-900">
                    {account.name ?? account.account_id ?? account.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-white/60">{t("analytics.dateRange")}</span>
              <select
                className="bg-transparent text-sm text-white outline-none"
                value={range}
                onChange={(event) => setRange(event.target.value)}
              >
                {rangeOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {t(`analytics.range.${option.value}`)}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="secondary" className="border border-white/10 bg-white/10 text-white">
              {t("analytics.share")}
            </Button>
          </div>
        </div>
        {(error || selectionSaving) && (
          <div className="mt-4 text-xs text-white/60">
            {selectionSaving ? t("analytics.savingSelection") : error}
          </div>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={t("analytics.revenue")}
          subtitle={t("analytics.estimatedRevenueByCampaign")}
          labels={chartLabels}
          values={revenueSeries}
          format="currency"
          emptyState={campaignEmptyState}
        />
        <BarChartCard
          title={t("analytics.purchases")}
          subtitle={t("analytics.purchasesByCampaign")}
          labels={chartLabels}
          values={purchasesSeries}
          emptyState={campaignEmptyState}
        />
      </section>

      <DataModal
        open={spendModalOpen}
        onClose={() => setSpendModalOpen(false)}
        title={t("analytics.spendBreakdown")}
        subtitle={t("analytics.spendBreakdownSubtitle")}
      >
        <div className="space-y-6">
          <BreakdownTable
            title={t("analytics.campaigns")}
            rows={spendBreakdown?.campaigns}
            loading={spendLoading}
            error={spendError}
          />
          <BreakdownTable
            title={t("analytics.adSets")}
            rows={spendBreakdown?.adSets}
            loading={spendLoading}
            error={spendError}
          />
          <BreakdownTable
            title={t("analytics.ads")}
            rows={spendBreakdown?.ads}
            loading={spendLoading}
            error={spendError}
          />
        </div>
      </DataModal>

      <DataModal
        open={revenueModalOpen}
        onClose={() => setRevenueModalOpen(false)}
        title={t("analytics.topProductsCollections")}
        subtitle={t("analytics.requiresShopifyReadOrders")}
      >
        <div className="space-y-6">
          <SalesTable
            title={t("analytics.topProducts")}
            rows={salesBreakdown?.products}
            loading={salesLoading}
            error={salesError}
            emptyMessage={t("analytics.noProductSales")}
          />
          <SalesTable
            title={t("analytics.topCollections")}
            rows={salesBreakdown?.collections}
            loading={salesLoading}
            error={salesError}
            emptyMessage={t("analytics.noCollectionSales")}
          />
          {salesBreakdown?.note && <p className="text-xs text-white/50">{salesBreakdown.note}</p>}
        </div>
      </DataModal>
    </div>
  );
}
