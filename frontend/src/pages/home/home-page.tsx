import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHomeData } from "@/hooks/useHomeData";
import {
  Flame,
  Rocket,
  ShieldCheck,
  Trophy,
  Brain,
  BellDot,
  Eye,
  CalendarDays,
  UsersRound,
  Target,
  Trash2,
  EllipsisVertical,
} from "lucide-react";

const recommendationIcons = {
  chart: Rocket,
  alert: BellDot,
  trophy: Trophy,
  brain: Brain,
} as const;

export function HomePage() {
  const { automation, goals, recommendations, greeting, recommendationsListTitle } =
    useHomeData();

  return (
    <div className="flex flex-col gap-8">
      <HeroCard
        title={greeting.title}
        subtitle={greeting.updatedAgo}
        recommendationCount={recommendations.length}
      />
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <AutomationCard
          collaborators={automation.collaborators}
          progress={automation.value}
        />
        <MonthlyGoalsCard goals={goals} />
      </div>
      <RecommendationList
        recommendations={recommendations}
        title={recommendationsListTitle}
      />
    </div>
  );
}

function HeroCard({
  title,
  subtitle,
  recommendationCount,
}: {
  title: string;
  subtitle: string;
  recommendationCount: number;
}) {
  return (
    <Card className="overflow-hidden border border-white/5 bg-gradient-to-br from-[#0B1A32] via-[#07112A] to-[#010409]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersRound className="h-4 w-4 text-accent" />
          {subtitle}
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold leading-tight">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Automate spend scaling, creative refresh, and brand safety tasks
              without leaving the dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="gap-2 border border-white/10 text-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
              Automation settings
            </Button>
            <Button className="gap-2">
              Ask AI Marketer ({recommendationCount})
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface AutomationCardProps {
  collaborators: Array<{ name: string; change: string }>;
  progress: number;
}

function AutomationCard({ collaborators, progress }: AutomationCardProps) {
  return (
    <Card className="relative overflow-hidden border border-white/5 bg-card/90">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          Save work for{" "}
          <span className="text-accent">{collaborators.length} people</span>
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-2xl border border-white/10 text-muted-foreground"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-5 space-y-4">
        {collaborators.map((person) => (
          <div key={person.name} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{person.name}</p>
              <p className="text-xs text-muted-foreground">{person.change}</p>
            </div>
            <div className="flex items-center -space-x-2">
              <Avatar className="h-8 w-8 border border-background">
                <AvatarFallback>
                  {person.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <p className="text-sm text-muted-foreground">
          Percent of account automation
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1">
            <Progress value={progress} />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {progress}%
          </span>
        </div>
      </div>
    </Card>
  );
}

interface Goal {
  label: string;
  value: number;
  target: number;
  trend: string;
  isRatio?: boolean;
}

const goalIcons: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  Revenue: {
    icon: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/1/1f/Shopify_logo_2018.svg"
        className="h-4"
        alt="Shopify"
      />
    ),
    label: "Shopify",
  },
  "Amount spent": {
    icon: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg"
        className="h-4"
        alt="Facebook"
      />
    ),
    label: "Facebook",
  },
  "Blended ROAS": { icon: <Target className="h-4 w-4" />, label: "ROAS" },
};

function MonthlyGoalsCard({ goals }: { goals: Goal[] }) {
  return (
    <Card className="border border-white/5 bg-card/90">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Monthly goals</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            4 days left
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          Edit
        </Button>
      </div>
      <div className="mt-6 space-y-5">
        {goals.map((goal) => {
          const percentage = Math.min(
            100,
            goal.isRatio
              ? (goal.value / goal.target) * 100
              : (goal.value / goal.target) * 100
          );
          return (
            <div key={goal.label}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-accent">
                    {(goalIcons[goal.label]?.icon ??
                      <Target className="h-4 w-4" />)}
                  </div>
                  <span className="font-medium text-foreground">
                    {goal.label}
                  </span>
                </div>
                <span className="text-foreground">
                  {goal.isRatio
                    ? `${goal.value.toFixed(1)} / ${goal.target.toFixed(1)}`
                    : `EGP ${goal.value.toLocaleString()} / EGP ${goal.target.toLocaleString()}`}
                </span>
              </div>
              <Progress value={percentage} className="mt-2" />
              <span className="mt-1 inline-flex text-xs text-accent">
                {goal.trend}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface Recommendation {
  id: string;
  title: string;
  platform: string;
  source: string;
  action: string;
  impact: string;
  icon?: string;
}

function RecommendationList({
  recommendations,
  title,
}: {
  recommendations: Recommendation[];
  title: string;
}) {
  return (
    <Card className="border border-white/5 bg-card/90">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-muted-foreground">
            {title}
          </div>
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            {recommendations.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Completed
        </Button>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-accent/50 via-transparent to-transparent" />
      <ScrollArea className="mt-4 max-h-[520px] space-y-4">
        <div className="space-y-4 pr-2">
          {recommendations.map((item, index) => (
            <RecommendationCard key={item.id} {...item} index={index} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

function RecommendationCard({
  title,
  platform,
  source,
  action,
  impact,
  index,
  icon,
}: Recommendation & { index: number }) {
  const fallbackIcons = [Rocket, Flame, ShieldCheck];
  const Icon =
    (icon ? recommendationIcons[icon as keyof typeof recommendationIcons] : null) ??
    fallbackIcons[index % fallbackIcons.length];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-background/40 p-4 transition hover:border-accent/60 hover:bg-background/60 md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{source}</Badge>
            <Badge variant="secondary">{platform}</Badge>
            <span>{impact}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
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
