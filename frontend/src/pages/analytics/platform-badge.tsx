import { platforms } from "@/pages/analytics/constants";

export function PlatformBadge({ platform }: { platform: keyof typeof platforms }) {
  const styles = platforms[platform];
  return <span className={`rounded-full px-3 py-1 text-[11px] ${styles.color}`}>{styles.label}</span>;
}
