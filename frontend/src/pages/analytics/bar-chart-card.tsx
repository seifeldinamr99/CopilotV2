import { truncateLabel } from "@/pages/analytics/utils";

type Props = {
  title: string;
  subtitle: string;
  labels: string[];
  values: number[];
  emptyState?: string;
};

export function BarChartCard({ title, subtitle, labels, values, emptyState }: Props) {
  const maxValue = Math.max(...values, 1);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/50">{subtitle}</p>
        </div>
        <div className="text-right text-xs text-white/60">Top campaigns</div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-4">
        {emptyState ? (
          <div className="flex h-40 items-center justify-center text-xs text-white/50">{emptyState}</div>
        ) : (
          <div className="flex h-40 items-end justify-between gap-2">
            {values.map((value, index) => (
              <div key={`${title}-${index}`} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="w-full rounded-t-xl bg-violet-400/70"
                  style={{ height: `${Math.max(8, (value / maxValue) * 100)}%` }}
                />
                <div className="mt-2 text-center text-[11px] text-white/50" title={labels[index]}>
                  {truncateLabel(labels[index])}
                </div>
                <div className="text-center text-[11px] text-white/70">{Math.round(value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
