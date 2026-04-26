import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { Sparkles, Wand2 } from "lucide-react";
import { SaveCreativeModal } from "@/pages/ai-ads/save-creative-modal";
import { useI18n } from "@/lib/i18n";

type BrandProfile = {
  logoUrl: string | null;
  products: Array<{ id: string; url: string }>;
  colors: string[];
};

export function MyAIGenerationsTab() {
  const session = useAuthStore((s) => s.session);
  const accessToken = session?.access_token ?? null;
  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const templates = useMemo(
    () => [
      {
        label: t("aiGen.template.productShowcase"),
        prompt: t("aiGen.template.productShowcase.prompt"),
      },
      {
        label: t("aiGen.template.lifestyle"),
        prompt: t("aiGen.template.lifestyle.prompt"),
      },
      {
        label: t("aiGen.template.seasonal"),
        prompt: t("aiGen.template.seasonal.prompt"),
      },
      {
        label: t("aiGen.template.launch"),
        prompt: t("aiGen.template.launch.prompt"),
      },
      {
        label: t("aiGen.template.testimonial"),
        prompt: t("aiGen.template.testimonial.prompt"),
      },
      {
        label: t("aiGen.template.beforeAfter"),
        prompt: t("aiGen.template.beforeAfter.prompt"),
      },
      {
        label: t("aiGen.template.limitedOffer"),
        prompt: t("aiGen.template.limitedOffer.prompt"),
      },
    ],
    [t]
  );
  const ratios = ["1:1", "4:5", "9:16", "16:9"];

  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const selectedStyle = "Photorealistic";
  const [variations, setVariations] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [pendingSaveUrl, setPendingSaveUrl] = useState<string | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [useBrandColors, setUseBrandColors] = useState(true);
  const [useLogo, setUseLogo] = useState(true);
  const [useProductImages, setUseProductImages] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    let canceled = false;
    setBrandLoading(true);
    setBrandError(null);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/brand/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          const details = await res.text();
          throw new Error(details || `Failed to load brand assets (${res.status})`);
        }
        const data = (await res.json()) as BrandProfile;
        if (!canceled) setBrandProfile(data);
      } catch (err) {
        if (!canceled) {
          setBrandProfile(null);
          setBrandError(err instanceof Error ? err.message : t("aiGen.brandAssetsError"));
        }
      } finally {
        if (!canceled) setBrandLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [API_BASE, accessToken]);

  const brandColors = brandProfile?.colors ?? [];
  const brandLogo = brandProfile?.logoUrl ?? null;
  const brandProducts = useMemo(() => brandProfile?.products ?? [], [brandProfile]);

  const toggleRatio = (ratio: string) => {
    setSelectedRatio(ratio);
  };

  const handleGenerate = async () => {
    if (!accessToken) {
      setGenerationError(t("aiGen.loginRequired"));
      return;
    }
    if (prompt.trim().length < 3) {
      setGenerationError(t("aiGen.promptTooShort"));
      return;
    }

    setIsGenerating(true);
    setResults(null);
    setGenerationError(null);
    setGenerationTime(null);

    try {
      const res = await fetch(`${API_BASE}/ai/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          aspectRatio: selectedRatio,
          brandColors: useBrandColors && brandColors.length > 0 ? brandColors : undefined,
          brandLogoUrl: useLogo && brandLogo ? brandLogo : undefined,
          productImageUrls:
            useProductImages && brandProducts.length > 0
              ? brandProducts.slice(0, 10).map((p) => p.url)
              : undefined,
          negativePrompt: undefined,
          numVariations: variations,
        }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Generation failed (${res.status})`);
      }
      const data = await res.json();
      const urls = Array.isArray(data.images)
        ? data.images.map((img) => img?.url).filter((url) => typeof url === "string")
        : [];
      setResults(urls.length ? urls : []);
      setGenerationTime(typeof data.generationTime === "number" ? data.generationTime : null);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : t("aiGen.generateError"));
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCreative = async (imageUrl: string, name: string) => {
    if (!accessToken) {
      setSaveStatus(t("aiGen.saveLoginRequired"));
      return;
    }
    try {
      setSaveStatus(t("brand.saving"));
      const res = await fetch(`${API_BASE}/creatives`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          imageUrl,
          prompt: prompt.trim(),
          style: selectedStyle,
          aspectRatio: selectedRatio,
          model: "gemini-2.5-flash-image",
          generationTime: generationTime ? String(generationTime) : undefined,
        }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Save failed (${res.status})`);
      }
      setSaveStatus(t("aiGen.saved"));
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : t("aiGen.saveError"));
    } finally {
      window.setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  return (
    <div className={`grid gap-6 lg:grid-cols-[1fr_2fr] ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <Card className="border border-white/5 bg-card/90">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t("aiGen.controlsTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("aiGen.controlsHint")}</p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{t("aiGen.promptLabel")}</label>
            <textarea
              className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-foreground outline-none focus:border-sky-400/60"
              placeholder={t("aiGen.promptPlaceholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("aiGen.templates")}</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template.label);
                    setPrompt(template.prompt);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedTemplate === template.label
                      ? "border-sky-400/60 bg-sky-400/10 text-sky-200"
                      : "border-white/10 text-muted-foreground hover:border-white/30"
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-muted-foreground">{t("aiGen.brandAssets")}</p>
              <div className="mt-2 space-y-1 text-sm text-foreground">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-sky-400"
                    checked={useBrandColors}
                    disabled={brandColors.length === 0}
                    onChange={(e) => setUseBrandColors(e.target.checked)}
                  />
                  {t("aiGen.applyColors")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-sky-400"
                    checked={useLogo}
                    disabled={!brandLogo}
                    onChange={(e) => setUseLogo(e.target.checked)}
                  />
                  {t("aiGen.includeLogo")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-sky-400"
                    checked={useProductImages}
                    disabled={brandProducts.length === 0}
                    onChange={(e) => setUseProductImages(e.target.checked)}
                  />
                  {t("aiGen.useProducts")}
                </label>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {brandLoading && t("aiGen.assetsLoading")}
                {!brandLoading && brandError && brandError}
                {!brandLoading && !brandError && (
                  <>
                    {t("aiGen.assetsSummary", {
                      colors: brandColors.length,
                      logo: brandLogo ? t("aiGen.logoYes") : t("aiGen.logoNo"),
                      products: brandProducts.length,
                    })}
                  </>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-muted-foreground">{t("aiGen.aspectRatios")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ratios.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => toggleRatio(ratio)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                  selectedRatio === ratio
                        ? "border-sky-400/60 bg-sky-400/10 text-sky-200"
                        : "border-white/10 text-muted-foreground hover:border-white/30"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>


          <Button
            className={`w-full gap-2 bg-gradient-to-r from-sky-400 to-sky-600 text-black hover:from-sky-300 hover:to-sky-500 ${isRtl ? "flex-row-reverse" : ""}`}
            onClick={handleGenerate}
          >
            <Wand2 className="h-4 w-4" /> {t("aiGen.generate")}
          </Button>
        </div>
      </Card>

      <Card className="border border-white/5 bg-card/90">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("aiGen.previewTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("aiGen.previewHint")}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/60">
          {generationTime !== null && <span>{t("aiGen.generationTime", { time: generationTime })}</span>}
          {generationError && <span className="text-red-300">{generationError}</span>}
          {saveStatus && <span className="text-sky-200">{saveStatus}</span>}
        </div>

        <div className="mt-6">
          {!results && !isGenerating && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 py-10 text-center">
              <Sparkles className="h-6 w-6 text-sky-300" />
              <p className="mt-3 text-sm font-medium text-white">{t("aiGen.noGenerations")}</p>
              <p className="mt-1 text-xs text-white/60">
                {t("aiGen.noGenerationsHint")}
              </p>
            </div>
          )}
          {isGenerating && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: Math.max(2, variations) }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
            </div>
          )}
          {results && (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                >
                  {url ? (
                    <img src={url} alt={`Generation ${idx + 1}`} className="aspect-[4/5] w-full object-cover" />
                  ) : (
                    <div className="aspect-[4/5] w-full" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-white/10 bg-black/50 px-3 py-2 text-xs text-white/70">
                    <span>{t("aiGen.variation", { count: idx + 1 })}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!url) return;
                        setPendingSaveUrl(url);
                        setSaveOpen(true);
                      }}
                      className={`flex items-center gap-2 text-sky-200 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <Sparkles className="h-3 w-3" /> {t("aiGen.save")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <SaveCreativeModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        imageUrl={pendingSaveUrl}
        onConfirm={async (name, download) => {
          if (!pendingSaveUrl) return;
          await saveCreative(pendingSaveUrl, name);
          if (download) {
            const link = document.createElement("a");
            link.href = pendingSaveUrl;
            link.download = `${name || "creative"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          setSaveOpen(false);
          setPendingSaveUrl(null);
        }}
      />
    </div>
  );
}
