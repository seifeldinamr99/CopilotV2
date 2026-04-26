import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { Download, Edit, Palette, Search } from "lucide-react";
import type { SavedCreative } from "@/pages/ai-ads/types";
import { downloadImage, formatDate } from "@/pages/ai-ads/utils";
import { RenameCreativeModal } from "@/pages/ai-ads/rename-creative-modal";
import { useI18n } from "@/lib/i18n";

export function MyCreativesTab() {
  const session = useAuthStore((s) => s.session);
  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
  const accessToken = session?.access_token ?? null;
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [creatives, setCreatives] = useState<SavedCreative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState<SavedCreative | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let canceled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/creatives`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          const details = await res.text();
          throw new Error(details || `Failed to load creatives (${res.status})`);
        }
        const data = await res.json();
        if (!canceled) setCreatives(Array.isArray(data.creatives) ? data.creatives : []);
      } catch (err) {
        if (!canceled) setError(err instanceof Error ? err.message : "Failed to load creatives.");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken, API_BASE]);

  const handleRename = async (name: string) => {
    if (!renaming || !accessToken) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/creatives/${renaming.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Failed to rename creative (${res.status})`);
      }
      setCreatives((prev) =>
        prev.map((item) => (item.id === renaming.id ? { ...item, name } : item)),
      );
      setRenaming(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename creative.");
    } finally {
    }
  };

  return (
    <div className={`space-y-4 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <Card className="border border-white/5 bg-card/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`flex flex-wrap items-center gap-2 ${isRtl ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="bg-transparent text-sm text-foreground outline-none"
                placeholder={t("creatives.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {loading && (
        <Card className="border border-white/5 bg-card/90">
          <div className="py-6 text-center text-sm text-muted-foreground">{t("creatives.loading")}</div>
        </Card>
      )}
      {error && (
        <Card className="border border-white/5 bg-card/90">
          <div className="py-6 text-center text-sm text-red-300">{error}</div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {creatives
          .filter((creative) => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return (creative.name ?? "").toLowerCase().includes(q);
          })
          .map((creative) => (
          <Card key={creative.id} className="overflow-hidden border border-white/5 bg-card/90 p-0">
            <img
              src={creative.imageUrl}
              alt={creative.name ?? creative.prompt}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="border-t border-white/5 p-3">
              <p className="text-sm font-medium line-clamp-1">{creative.name ?? creative.prompt}</p>
              <p className="text-xs text-muted-foreground">
                {creative.aspectRatio ?? "1:1"} ? {formatDate(creative.createdAt)}
              </p>
              <div className={`mt-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className={`gap-2 border border-white/10 ${isRtl ? "flex-row-reverse" : ""}`}
                  onClick={() => setRenaming(creative)}
                >
                  <Edit className="h-3 w-3" /> {t("creatives.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className={`gap-2 border border-white/10 ${isRtl ? "flex-row-reverse" : ""}`}
                  onClick={() => downloadImage(creative.imageUrl, creative.id)}
                >
                  <Download className="h-3 w-3" /> {t("creatives.download")}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && creatives.length === 0 && (
        <Card className="border border-white/5 bg-card/90">
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Palette className="h-6 w-6 text-sky-300" />
            <p className="text-sm font-medium">{t("creatives.noneTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("creatives.noneHint")}</p>
          </div>
        </Card>
      )}

      <RenameCreativeModal
        open={Boolean(renaming)}
        initialName={renaming?.name?.trim() || t("creative.untitled")}
        onClose={() => setRenaming(null)}
        onConfirm={handleRename}
      />
    </div>
  );
}
