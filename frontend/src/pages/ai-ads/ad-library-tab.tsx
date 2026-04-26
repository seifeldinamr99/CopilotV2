import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { Bookmark, ChevronDown } from "lucide-react";
import type { AdLibraryStatus } from "@/pages/ai-ads/types";
import { useI18n } from "@/lib/i18n";

export function AdLibraryTab() {
  const session = useAuthStore((s) => s.session);
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("US");
  const [status, setStatus] = useState<AdLibraryStatus>("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`${API_BASE}/meta/ads-library/search`);
        url.searchParams.set("q", q);
        url.searchParams.set("country", country);
        url.searchParams.set("status", status);
        url.searchParams.set("limit", "24");

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!res.ok) {
          const contentType = res.headers.get("content-type") ?? "";
          const details =
            contentType.includes("application/json")
              ? JSON.stringify(await res.json())
              : await res.text();
          throw new Error(details || `Request failed (${res.status})`);
        }
        const data = (await res.json()) as { ads?: any[] };
        setResults(Array.isArray(data.ads) ? data.ads : []);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error(e);
        setResults([]);
        setError(e instanceof Error ? e.message : "Failed to search ads");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [API_BASE, country, query, session?.access_token, status]);

  return (
    <div className={`space-y-4 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <Card className="border border-white/5 bg-card/90">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-foreground outline-none focus:border-sky-400/60"
              placeholder={t("adLibrary.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-foreground outline-none"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              title={t("adLibrary.country")}
            >
              <option value="US">US</option>
              <option value="GB">UK</option>
              <option value="CA">CA</option>
              <option value="AE">AE</option>
              <option value="SA">SA</option>
              <option value="EG">EG</option>
            </select>
            <select
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-foreground outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value as AdLibraryStatus)}
              title={t("adLibrary.status")}
            >
              <option value="ALL">{t("adLibrary.all")}</option>
              <option value="ACTIVE">{t("adLibrary.active")}</option>
              <option value="INACTIVE">{t("adLibrary.inactive")}</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Badge variant="secondary" className="bg-white/5 text-muted-foreground">
              {t("adLibrary.title")}
            </Badge>
            {loading && <span className="text-xs text-muted-foreground">{t("adLibrary.searching")}</span>}
          </div>
        </div>
        {error && (
          <p className="mt-3 text-xs text-destructive">
            {t("adLibrary.searchError")} {error}
          </p>
        )}
        {!session?.access_token && (
          <p className="mt-3 text-xs text-muted-foreground">{t("adLibrary.loginRequired")}</p>
        )}
      </Card>

      {results === null ? (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-white/5 text-muted-foreground">
            {t("adLibrary.typeToSearch")}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{t("adLibrary.tip")}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(results ?? []).map((ad) => (
          <AdsLibraryCard key={String(ad.id ?? Math.random())} ad={ad} />
        ))}
      </div>
    </div>
  );
}

function AdsLibraryCard({ ad }: { ad: any }) {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const snapshotUrl = typeof ad?.ad_snapshot_url === "string" ? ad.ad_snapshot_url : null;
  const title =
    typeof ad?.page_name === "string"
      ? ad.page_name
      : typeof ad?.id === "string"
        ? ad.id
        : t("adLibrary.adLabel");

  return (
    <Card className="group overflow-hidden border border-white/5 bg-card/90 p-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-black/30">
        {snapshotUrl ? (
          <iframe
            src={snapshotUrl}
            title={title}
            className="h-full w-full"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {t("adLibrary.noPreview")}
          </div>
        )}
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/90 backdrop-blur hover:bg-black/55"
          title={t("adLibrary.saveToBoards")}
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      <div className="border-t border-white/5 p-3">
        <div className="mb-2 line-clamp-1 text-xs text-muted-foreground">{title}</div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-9 flex-1 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
          >
            {t("adLibrary.finishDesigner")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className={`h-9 gap-2 border border-white/10 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            {t("adLibrary.allActions")} <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
