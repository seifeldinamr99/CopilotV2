import { EmptyTable } from "@/pages/analytics/empty-table";
import type { MetaSpendBreakdownRow } from "@/pages/analytics/types";
import { formatCurrency } from "@/pages/analytics/utils";

type Props = {
  title: string;
  rows?: MetaSpendBreakdownRow[];
  loading: boolean;
  error: string | null;
};

export function BreakdownTable({ title, rows, loading, error }: Props) {
  if (loading) return <EmptyTable message={`Loading ${title.toLowerCase()}...`} />;
  if (error) return <EmptyTable message={error} />;
  if (!rows || rows.length === 0) return <EmptyTable message={`No ${title.toLowerCase()} data available.`} />;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
          {rows.length} rows
        </span>
      </div>
      <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950/90 text-xs uppercase text-white/50 backdrop-blur">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2 text-right">Spend (EGP)</th>
              <th className="py-2 text-right">Purchases</th>
              <th className="py-2 text-right">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-t border-white/5 ${idx % 2 === 0 ? "bg-white/[0.02]" : ""}`}
              >
                <td className="py-2 text-white/80">{row.name}</td>
                <td className="py-2 text-right text-white/80">{formatCurrency(row.spend)}</td>
                <td className="py-2 text-right text-white/70">{row.purchases ?? 0}</td>
                <td className="py-2 text-right text-white/60">{row.roas?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
