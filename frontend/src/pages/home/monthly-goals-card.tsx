import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

type Props = {
  revenueToday: number | null;
  spendToday: number | null;
  roasToday: number | null;
};

export function MonthlyGoalsCard({ revenueToday, spendToday, roasToday }: Props) {
  const { t } = useI18n();
  return (
    <Card className="border border-white/5 bg-card/90">
      <div>
        <p className="text-sm text-muted-foreground">{t("home.today")}</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">{t("home.dailyPerformance")}</h3>
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
          <span className="text-sm font-medium text-foreground">{t("home.sales")}</span>
          <span className="text-sm text-foreground">
            {revenueToday !== null ? `EGP ${revenueToday.toLocaleString()}` : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
          <span className="text-sm font-medium text-foreground">{t("home.adSpend")}</span>
          <span className="text-sm text-foreground">
            {spendToday !== null ? `EGP ${spendToday.toLocaleString()}` : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
          <span className="text-sm font-medium text-foreground">{t("home.roas")}</span>
          <span className="text-sm text-foreground">{roasToday !== null ? `${roasToday.toFixed(2)}x` : "-"}</span>
        </div>
      </div>
    </Card>
  );
}
