import { Card } from "@/components/ui/card";
import type { TopCampaignsRange, TopCampaignRow } from "@/pages/home/types";
import { formatEgp, formatInt } from "@/pages/home/utils";
import { useI18n } from "@/lib/i18n";

type Props = {
  ranges: TopCampaignsRange[];
  range: string;
  onRangeChange: (value: TopCampaignsRange["key"]) => void;
  rows: TopCampaignRow[];
  loading: boolean;
  error: string | null;
  adAccounts: { id: string; name: string }[];
  selectedAdAccountId: string | null;
  onSelectAdAccount: (value: string) => void;
};

export function TopCampaignsCard({
  ranges,
  range,
  onRangeChange,
  rows,
  loading,
  error,
  adAccounts,
  selectedAdAccountId,
  onSelectAdAccount,
}: Props) {
  const { t, locale } = useI18n();
  return (
    <Card className="relative overflow-hidden border border-white/5 bg-gradient-to-br from-[#0f1626] via-[#0c1424] to-[#0a101d]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{t("home.topCampaignsTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("home.topCampaignsSubtitle")}</p>
          {error && <p className="text-xs text-destructive">{t("home.liveDataError")} {error}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {adAccounts.length > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-muted-foreground shadow-sm">
              <span>{t("home.adAccount")}</span>
              <select
                className="max-w-[220px] truncate rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-accent/40"
                value={selectedAdAccountId ?? adAccounts[0]?.id}
                onChange={(e) => onSelectAdAccount(e.target.value)}
              >
                {adAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {ranges.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => onRangeChange(r.key)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition shadow-sm",
                  r.key === range
                    ? "bg-accent/90 text-accent-foreground shadow-[0_8px_20px_-10px_rgba(56,189,248,0.6)]"
                    : "bg-black/40 text-muted-foreground hover:bg-black/55 hover:text-foreground",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className={`w-full min-w-[760px] text-sm ${locale === "ar" ? "text-right" : "text-left"}`}>
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-white/5">
              <th className="py-3 pr-4 font-medium">{t("home.table.campaignName")}</th>
              <th className="py-3 pr-4 font-medium">{t("home.table.reach")}</th>
              <th className="py-3 pr-4 font-medium">{t("home.table.purchases")}</th>
              <th className="py-3 pr-4 font-medium">{t("home.table.roas")}</th>
              <th className="py-3 pr-4 font-medium">{t("home.table.amountSpent")}</th>
              <th className="py-3 font-medium">{t("home.table.costPerResult")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={6}>
                  {t("home.loadingCampaigns")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={6}>
                  {t("home.noCampaigns")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0">
                  <td className="py-4 pr-4 font-medium text-foreground">{row.name}</td>
                  <td className="py-4 pr-4 text-muted-foreground">{formatInt(row.reach)}</td>
                  <td className="py-4 pr-4 text-muted-foreground">{formatInt(row.purchases)}</td>
                  <td className="py-4 pr-4 text-foreground">{row.roas.toFixed(2)}</td>
                  <td className="py-4 pr-4 text-muted-foreground">{formatEgp(row.amountSpentEgp)}</td>
                  <td className="py-4 text-muted-foreground">{formatEgp(row.costPerPurchaseEgp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
