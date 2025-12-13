import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AnalyticsPage() {
  const sampleMetrics = [
    { label: "ROAS", value: 2.8, target: 3.0 },
    { label: "CPA", value: 34, target: 30 },
    { label: "Spend", value: 42000, target: 50000 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-semibold">Analytics overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Track blended performance against your monthly targets. Detailed
          charts will live here in the next milestone.
        </p>
        <div className="mt-6 grid gap-4">
          {sampleMetrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <span>
                  {metric.label === "ROAS"
                    ? metric.value.toFixed(1)
                    : `$${metric.value.toLocaleString()}`}
                </span>
              </div>
              <Progress
                value={Math.min((metric.value / metric.target) * 100, 100)}
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
