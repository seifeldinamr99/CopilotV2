import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
type Props = {
  open: boolean;
  monthOptions: Array<{ value: string; label: string; days: number }>;
  monthKey: string;
  revenueGoal: number;
  onClose: () => void;
  onSave: (next: { monthKey: string; revenueGoal: number }) => void;
};

export function MonthlyGoalsModal({
  open,
  monthOptions,
  monthKey,
  revenueGoal,
  onClose,
  onSave,
}: Props) {
  const [draftMonthKey, setDraftMonthKey] = useState(monthKey);
  const [draftRevenueGoal, setDraftRevenueGoal] = useState(revenueGoal);

  React.useEffect(() => {
    if (!open) return;
    setDraftMonthKey(monthKey);
    setDraftRevenueGoal(revenueGoal);
  }, [monthKey, revenueGoal, open]);

  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl border border-white/10 bg-background/80 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Edit monthly goals</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the month and revenue goal. We save changes on your device.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <label className="text-xs text-muted-foreground">Month</label>
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              value={draftMonthKey}
              onChange={(e) => setDraftMonthKey(e.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.days} days)
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <label className="text-xs text-muted-foreground">Revenue goal (EGP)</label>
            <input
              type="number"
              min="0"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              value={draftRevenueGoal}
              onChange={(e) => setDraftRevenueGoal(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                monthKey: draftMonthKey,
                revenueGoal: Number.isFinite(draftRevenueGoal) ? draftRevenueGoal : 0,
              })
            }
          >
            Save goals
          </Button>
        </div>
      </Card>
    </div>
  );
}
