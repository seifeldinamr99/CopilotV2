import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

type Props = {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onConfirm: (name: string, download: boolean) => void;
};

export function SaveCreativeModal({ open, imageUrl, onClose, onConfirm }: Props) {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [name, setName] = useState("");
  const [download, setDownload] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDownload(true);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
      <Card className="w-full max-w-lg border border-white/10 bg-background/80 p-6 shadow-2xl">
        <div className={`flex items-start justify-between gap-4 ${isRtl ? "text-right" : "text-left"}`}>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("creative.saveTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("creative.saveHint")}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("aiAds.howItWorksClose")}
          </Button>
        </div>

        {imageUrl && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <img src={imageUrl} alt="Creative preview" className="w-full object-cover" />
          </div>
        )}

        <div className="mt-4">
          <label className="text-xs text-muted-foreground">{t("creative.nameLabel")}</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
            placeholder={t("creative.renamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="accent-accent"
            checked={download}
            onChange={(e) => setDownload(e.target.checked)}
          />
          {t("creative.downloadAfterSave")}
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t("creative.cancel")}
          </Button>
          <Button
            onClick={() => onConfirm(name.trim() || t("creative.untitled"), download)}
            disabled={!name.trim()}
          >
            {t("creative.saveAction")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
