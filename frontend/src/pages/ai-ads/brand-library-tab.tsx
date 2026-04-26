import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { Image, Plus, Type, Upload, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type BrandAsset = {
  id: string;
  url: string;
};

type BrandFont = {
  family: string;
  variant: string | null;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const fontOptions = [
  { family: "Inter", variant: "400" },
  { family: "Poppins", variant: "500" },
  { family: "Montserrat", variant: "600" },
  { family: "Roboto", variant: "400" },
  { family: "DM Sans", variant: "500" },
];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Invalid file data."));
        return;
      }
      const [, data] = result.split(",");
      resolve(data ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function BrandLibraryTab() {
  const session = useAuthStore((s) => s.session);
  const accessToken = session?.access_token ?? null;
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<BrandAsset[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<BrandFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState("#1f6feb");

  useEffect(() => {
    if (!accessToken) return;
    let canceled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/brand/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          const details = await res.text();
          throw new Error(details || `Failed to load brand profile (${res.status})`);
        }
        const data = (await res.json()) as {
          logoUrl: string | null;
          products: BrandAsset[];
          colors: string[];
          fonts: BrandFont[];
        };
        if (!canceled) {
          setLogoUrl(data.logoUrl);
          setProducts(Array.isArray(data.products) ? data.products : []);
          setColors(Array.isArray(data.colors) ? data.colors : []);
          setFonts(Array.isArray(data.fonts) ? data.fonts : []);
        }
      } catch (err) {
        if (!canceled) setError(err instanceof Error ? err.message : "Failed to load brand profile.");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken]);

  const uploadLogo = async (file: File) => {
    if (!accessToken) return;
    setSaving("logo");
    setError(null);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const res = await fetch(`${API_BASE}/brand/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          dataBase64,
        }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Logo upload failed (${res.status})`);
      }
      const data = (await res.json()) as { logoUrl?: string };
      setLogoUrl(data.logoUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo.");
    } finally {
      setSaving(null);
    }
  };

  const uploadProduct = async (file: File) => {
    if (!accessToken) return;
    setSaving("product");
    setError(null);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const res = await fetch(`${API_BASE}/brand/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          dataBase64,
        }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Product upload failed (${res.status})`);
      }
      const data = (await res.json()) as { asset?: BrandAsset };
      if (data.asset) setProducts((prev) => [data.asset, ...prev].slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload product image.");
    } finally {
      setSaving(null);
    }
  };

  const deleteProduct = async (assetId: string) => {
    if (!accessToken) return;
    setSaving("product-delete");
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/brand/product/${assetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Failed to delete product (${res.status})`);
      }
      setProducts((prev) => prev.filter((item) => item.id !== assetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product image.");
    } finally {
      setSaving(null);
    }
  };

  const saveColors = async (next: string[]) => {
    if (!accessToken) return;
    setSaving("colors");
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/brand/colors`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ colors: next }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Failed to save colors (${res.status})`);
      }
      setColors(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save colors.");
    } finally {
      setSaving(null);
    }
  };

  const saveFonts = async (next: BrandFont[]) => {
    if (!accessToken) return;
    setSaving("fonts");
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/brand/fonts`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fonts: next }),
      });
      if (!res.ok) {
        const details = await res.text();
        throw new Error(details || `Failed to save fonts (${res.status})`);
      }
      setFonts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fonts.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className={`grid gap-6 lg:grid-cols-2 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <Card className="border border-white/5 bg-card/90">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("brand.logoAssets")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("brand.logoAssetsHint")}</p>
          </div>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-secondary px-4 py-2 text-sm text-foreground ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <Upload className="h-4 w-4" /> {t("brand.upload")}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadLogo(file);
              }}
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {loading ? (
            <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
              {t("brand.loading")}
            </div>
          ) : logoUrl ? (
            <div className="relative flex h-28 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
              <img src={logoUrl} alt="Logo" className="max-h-24 object-contain" />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
              {t("brand.uploadLogo")}
            </div>
          )}
        </div>
      </Card>

      <Card className="border border-white/5 bg-card/90">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("brand.colors")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("brand.colorsHint")}</p>
          </div>
          <Button
            variant="secondary"
            className={`gap-2 border border-white/10 ${isRtl ? "flex-row-reverse" : ""}`}
            onClick={() => {
              if (colors.includes(colorInput)) return;
              void saveColors([...colors, colorInput].slice(0, 10));
            }}
            disabled={saving === "colors"}
          >
            <Plus className="h-4 w-4" /> {t("brand.addColor")}
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <input
              type="color"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-full border border-white/10 bg-transparent"
            />
            <span className="text-xs text-muted-foreground">{colorInput.toUpperCase()}</span>
          </div>
          {colors.map((hex) => (
            <div key={hex} className="group relative h-14 rounded-2xl border border-white/10" style={{ background: hex }}>
              <button
                type="button"
                className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white group-hover:flex"
                onClick={() => void saveColors(colors.filter((c) => c !== hex))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-white/5 bg-card/90">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("brand.productImages")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("brand.productImagesHint")}</p>
          </div>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-secondary px-4 py-2 text-sm text-foreground ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <Image className="h-4 w-4" /> {t("brand.upload")}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadProduct(file);
              }}
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {products.length === 0 && (
            <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
              {t("brand.uploadProducts")}
            </div>
          )}
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-black/20"
            >
              <img src={product.url} alt="Product" className="h-20 object-contain" />
              <button
                type="button"
                className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white group-hover:flex"
                onClick={() => void deleteProduct(product.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-white/5 bg-card/90">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("brand.fonts")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("brand.fontsHint")}</p>
          </div>
          <Button
            variant="secondary"
            className={`gap-2 border border-white/10 ${isRtl ? "flex-row-reverse" : ""}`}
            onClick={() => {
              const next = fontOptions[0];
              if (fonts.find((f) => f.family === next.family && f.variant === next.variant)) return;
              void saveFonts([...fonts, next]);
            }}
            disabled={saving === "fonts"}
          >
            <Type className="h-4 w-4" /> {t("brand.addFont")}
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <select
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none"
              onChange={(e) => {
                const selected = fontOptions.find((font) => font.family === e.target.value);
                if (!selected) return;
                if (fonts.find((f) => f.family === selected.family && f.variant === selected.variant)) return;
                void saveFonts([...fonts, selected]);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                {t("brand.chooseGoogleFont")}
              </option>
              {fontOptions.map((font) => (
                <option key={`${font.family}-${font.variant}`} value={font.family}>
                  {font.family} ({font.variant})
                </option>
              ))}
            </select>
          </div>
          {fonts.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-muted-foreground">
              {t("brand.noFonts")}
            </div>
          )}
          {fonts.map((font) => (
            <div key={`${font.family}-${font.variant ?? "regular"}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm text-foreground">Aa Bb Cc</p>
                <p className="text-xs text-muted-foreground">
                  {font.family} {font.variant ? `(${font.variant})` : ""}
                </p>
              </div>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:text-foreground"
                onClick={() => void saveFonts(fonts.filter((f) => !(f.family === font.family && f.variant === font.variant)))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {error && (
        <div className="lg:col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      )}
      {saving && (
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-muted-foreground">
          {t("brand.saving")}
        </div>
      )}
    </div>
  );
}
