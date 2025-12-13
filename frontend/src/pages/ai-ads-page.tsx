import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AiAdsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              AI ads workspace coming soon
            </p>
            <h2 className="text-2xl font-semibold">Recommendation cockpit</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Approve, launch, and monitor AI-driven experiments from a single
              command center.
            </p>
          </div>
          <Button variant="secondary">Notify me</Button>
        </div>
      </Card>
    </div>
  );
}
