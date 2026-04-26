import { PlatformBadge } from "@/pages/analytics/platform-badge";
import { platforms } from "@/pages/analytics/constants";
import { useI18n } from "@/lib/i18n";

type MetricCardProps = {
  title: string;
  value: string;
  meta: string;
  onClick?: () => void;
  platforms: Array<keyof typeof platforms>;
};

export function MetricCard({
  title,
  value,
  meta,
  onClick,
  platforms: list,
}: MetricCardProps) {
  const { locale } = useI18n();
  const isRtl = locale === "ar";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lg transition ${
        isRtl ? "text-right" : "text-left"
      } ${onClick ? "hover:border-white/30 hover:bg-white/[0.07]" : "cursor-default"}`}
      disabled={!onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-[11px] text-white/50">{meta}</p>
        </div>
      </div>
      <div
        className={`mt-4 flex flex-wrap items-center gap-2 ${
          isRtl ? "flex-row-reverse justify-end" : "justify-start"
        }`}
      >
        {list.map((platform) => (
          <PlatformBadge key={platform} platform={platform} />
        ))}
      </div>
    </button>
  );
}
