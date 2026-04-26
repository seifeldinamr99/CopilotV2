import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, UsersRound } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  title: string;
  subtitle?: string;
  recommendationCount: number;
  onAskAi: () => void;
};

export function HeroCard({ title, subtitle, recommendationCount, onAskAi }: Props) {
  const { t } = useI18n();
  return (
    <Card className="overflow-hidden border border-white/5 bg-gradient-to-br from-[#0B1A32] via-[#07112A] to-[#010409]">
      <div className="flex flex-col gap-4">
        {subtitle && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UsersRound className="h-4 w-4 text-accent" />
            {subtitle}
          </div>
        )}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold leading-tight">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("home.heroDescription")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="gap-2 border border-white/10 text-foreground">
              <ShieldCheck className="h-4 w-4" />
              {t("home.automationSettings")}
            </Button>
            <Button className="gap-2" onClick={onAskAi}>
              {t("home.askMetaCopilot")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
