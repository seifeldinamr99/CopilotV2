import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Sparkles } from "lucide-react";
import { BrandLibraryTab } from "@/pages/ai-ads/brand-library-tab";
import { MyAIGenerationsTab } from "@/pages/ai-ads/my-ai-generations-tab";
import { MyCreativesTab } from "@/pages/ai-ads/my-creatives-tab";
import { useI18n } from "@/lib/i18n";

export function AiAdsPage() {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const tabs = useMemo(
    () => [
      { key: "brand_library", label: t("aiAds.tabs.brandLibrary") },
      { key: "my_ai_generations", label: t("aiAds.tabs.myAiGenerations") },
      { key: "my_creatives", label: t("aiAds.tabs.myCreatives") },
    ],
    [t]
  );

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("brand_library");
  const activeLabel = tabs.find((t) => t.key === activeTab)?.label ?? t("aiAds.tabs.brandLibrary");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const slides = useMemo(
    () => [
      {
        title: t("aiAds.slide.brandLibrary.title"),
        description: t("aiAds.slide.brandLibrary.description"),
      },
      {
        title: t("aiAds.slide.generations.title"),
        description: t("aiAds.slide.generations.description"),
      },
      {
        title: t("aiAds.slide.creatives.title"),
        description: t("aiAds.slide.creatives.description"),
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <Card className="border border-white/5 bg-card/90">
        <div
          className={[
            "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
            isRtl ? "text-right" : "text-left",
          ].join(" ")}
        >
          <div>
            <p className="text-sm text-muted-foreground">{t("aiAds.title")}</p>
            <h2 className="text-2xl font-semibold">{activeLabel}</h2>
          </div>

          <div className={`flex flex-wrap items-center gap-2 ${isRtl ? "justify-end" : ""}`}>
            <Button
              variant="secondary"
              className={`gap-2 border border-white/10 ${isRtl ? "flex-row-reverse" : ""}`}
              onClick={() => setShowHowItWorks(true)}
            >
              {t("aiAds.howItWorks")}{" "}
              <ChevronRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
            </Button>
            <Button
              className={`gap-2 bg-gradient-to-r from-sky-400 to-sky-600 text-black hover:from-sky-300 hover:to-sky-500 ${isRtl ? "flex-row-reverse" : ""}`}
              onClick={() => setActiveTab("my_ai_generations")}
            >
              <Sparkles className="h-4 w-4" /> {t("aiAds.generateWithAi")}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={[
                "relative rounded-xl px-3 py-2 text-sm transition",
                activeTab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
              {activeTab === t.key && (
                <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-sky-400" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {activeTab === "brand_library" && <BrandLibraryTab />}
      {activeTab === "my_ai_generations" && <MyAIGenerationsTab />}
      {activeTab === "my_creatives" && <MyCreativesTab />}

      <HowItWorksModal
        open={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        slides={slides}
        isRtl={isRtl}
        t={t}
      />
    </div>
  );
}

function HowItWorksModal({
  open,
  onClose,
  slides,
  isRtl,
  t,
}: {
  open: boolean;
  onClose: () => void;
  slides: Array<{ title: string; description: string }>;
  isRtl: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [index, setIndex] = useState(0);
  if (!open) return null;
  const slide = slides[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Card className="w-full max-w-3xl border border-white/10 bg-background/90 p-6 shadow-2xl">
        <div className={`flex items-start justify-between gap-4 ${isRtl ? "text-right" : "text-left"}`}>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("aiAds.howItWorksTitle")}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">{slide.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{slide.description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("aiAds.howItWorksClose")}
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {slides.map((item, i) => (
            <div
              key={`step-${item.title}`}
              className="rounded-2xl border border-white/10 bg-black/40 p-4 transition"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t("aiAds.howItWorksStep", { count: i + 1 })}
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">{item.title}</div>
              <div className="mt-2 text-xs text-muted-foreground">{item.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
