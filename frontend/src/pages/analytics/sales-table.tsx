import { EmptyTable } from "@/pages/analytics/empty-table";
import { formatCurrency } from "@/pages/analytics/utils";

type Props<T extends { title: string; sales: number }> = {
  title: string;
  rows?: T[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
};

export function SalesTable<T extends { title: string; sales: number }>({
  title,
  rows,
  loading,
  error,
  emptyMessage,
}: Props<T>) {
  if (loading) return <EmptyTable message={`Loading ${title.toLowerCase()}...`} />;
  if (error) return <EmptyTable message={error} />;
  if (!rows || rows.length === 0) return <EmptyTable message={emptyMessage} />;

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
              <th className="py-2 text-right">Sales (EGP)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.title}
                className={`border-t border-white/5 ${idx % 2 === 0 ? "bg-white/[0.02]" : ""}`}
              >
                <td className="py-2 text-white/80">{row.title}</td>
                <td className="py-2 text-right text-white/70">{formatCurrency(row.sales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
