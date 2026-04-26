import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function DataModal({ open, onClose, title, subtitle, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-white/60">{subtitle}</p>}
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
