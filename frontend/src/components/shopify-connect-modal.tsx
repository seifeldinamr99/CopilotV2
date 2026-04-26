import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (shopDomain: string) => Promise<void> | void;
  loading?: boolean;
  initialValue?: string | null;
};

function normalizeShopInput(value: string) {
  const trimmed = value.trim();
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const adminMatch = withoutProtocol.match(/^admin\.shopify\.com\/store\/([a-z0-9][a-z0-9-]*)/i);
  if (adminMatch?.[1]) return adminMatch[1];
  return withoutProtocol.replace(/\/.*$/, "");
}

export function ShopifyConnectModal({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  initialValue,
}: Props) {
  const [value, setValue] = useState(initialValue ?? "");
  const normalized = useMemo(() => normalizeShopInput(value), [value]);
  const disabled = loading || normalized.length === 0;

  useEffect(() => {
    if (!open) return;
    setValue(initialValue ?? "");
  }, [initialValue, open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-lg border border-white/10 bg-background/80 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Connect Shopify store</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your store domain (for example: <span className="font-medium text-foreground">zenmood-shop</span>{" "}
              or <span className="font-medium text-foreground">zenmood-shop.myshopify.com</span>).
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: if you paste an admin URL like{" "}
              <span className="font-medium text-foreground">admin.shopify.com/store/zenmood-shop</span>, we’ll extract
              the store name automatically.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Important: if Shopify asks you to choose a store/account in the popup, you must select the same store you
              entered here. Otherwise the connection will be rejected.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Close
          </Button>
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium text-muted-foreground">Store domain</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-foreground outline-none ring-0 focus:border-accent/60"
            placeholder="your-store.myshopify.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            inputMode="url"
          />
          {value.trim().length > 0 && normalized !== value.trim() && (
            <p className="mt-2 text-xs text-muted-foreground">
              Using: <span className="font-medium text-foreground">{normalized}</span>
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await onSubmit(normalized);
              onOpenChange(false);
            }}
            disabled={disabled}
          >
            {loading ? "Connecting..." : "Connect Shopify"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
