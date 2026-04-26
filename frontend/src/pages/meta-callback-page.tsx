import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMetaStore } from "@/store/meta-store";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export function MetaCallbackPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Finalizing Meta connection...");
  const setConnectedPayload = useMetaStore((s) => s.setConnectedPayload);

  useEffect(() => {
    const ticket = params.get("ticket");
    if (!ticket) {
      setMessage("Missing ticket.");
      return;
    }

    let canceled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/meta/ticket?ticket=${encodeURIComponent(ticket)}`);
        if (!res.ok) {
          const details = await res.text();
          throw new Error(details || `HTTP ${res.status}`);
        }
        const payload = (await res.json()) as {
          user?: { id: string; name: string };
          adAccounts?: unknown;
        };

        if (!canceled && payload?.user && Array.isArray(payload?.adAccounts)) {
          setConnectedPayload({
            profile: payload.user,
            adAccounts: payload.adAccounts as any,
          });
          setMessage("Connected. You can close this window.");
          window.close();
        } else if (!canceled) {
          setMessage("Connected, but no accounts were returned.");
        }
      } catch (e) {
        if (!canceled) setMessage(e instanceof Error ? e.message : "Failed to finalize connection.");
      }
    })();

    return () => {
      canceled = true;
    };
  }, [params, setConnectedPayload]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-card p-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
        <h1 className="text-xl font-semibold">Meta Connection</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

