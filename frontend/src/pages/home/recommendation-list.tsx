import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Recommendation } from "@/pages/home/types";
import { useI18n } from "@/lib/i18n";
import {
  BellDot,
  EllipsisVertical,
  Flame,
  Rocket,
  ShieldCheck,
  Trash2,
  Trophy,
  Brain,
} from "lucide-react";

const recommendationIcons = {
  chart: Rocket,
  alert: BellDot,
  trophy: Trophy,
  brain: Brain,
} as const;

type ListProps = {
  recommendations: Recommendation[];
  title: string;
};

export function RecommendationList({ recommendations, title }: ListProps) {
  const { t, locale } = useI18n();
  return (
    <Card className="border border-white/5 bg-card/90">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-muted-foreground">{title}</div>
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            {recommendations.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          {t("home.completed")}
        </Button>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-accent/50 via-transparent to-transparent" />
      <ScrollArea className="mt-4 max-h-[520px] space-y-4">
        <div className="space-y-4 pr-2">
          {recommendations.map((item, index) => (
            <RecommendationCard key={item.id} {...item} index={index} rtl={locale === "ar"} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

type CardProps = Recommendation & { index: number; rtl: boolean };

function RecommendationCard({
  title,
  platform,
  source,
  action,
  impact,
  index,
  icon,
  rtl,
}: CardProps) {
  const fallbackIcons = [Rocket, Flame, ShieldCheck];
  const Icon =
    (icon ? recommendationIcons[icon as keyof typeof recommendationIcons] : null) ??
    fallbackIcons[index % fallbackIcons.length];

  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-2xl border border-white/5 bg-background/40 p-4 transition hover:border-accent/60 hover:bg-background/60 md:flex-row md:items-center",
        rtl ? "md:flex-row-reverse text-right" : "text-left",
      ].join(" ")}
    >
      <div className={["flex flex-1 items-center gap-3", rtl ? "flex-row-reverse" : "flex-row"].join(" ")}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <div
            className={[
              "mt-1 flex items-center gap-2 text-xs text-muted-foreground",
              rtl ? "flex-row-reverse" : "flex-row",
            ].join(" ")}
          >
            <Badge variant="secondary">{source}</Badge>
            <Badge variant="secondary">{platform}</Badge>
            <span>{impact}</span>
          </div>
        </div>
      </div>
      <div className={["flex items-center gap-2", rtl ? "justify-start flex-row-reverse" : "justify-end"].join(" ")}>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl border border-white/10">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl border border-white/10">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
        <Button size="sm" className="min-w-[90px]">
          {action}
        </Button>
      </div>
    </div>
  );
}
