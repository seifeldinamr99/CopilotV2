import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { enTranslations } from "@/lib/i18n/en";
import { arTranslations } from "@/lib/i18n/ar";

export type Locale = "en" | "ar";

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const translations: Record<Locale, Record<string, string>> = {
  en: enTranslations,
  ar: arTranslations,
};

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.body.classList.add("locale-transition");
    const timeout = window.setTimeout(() => {
      document.body.classList.remove("locale-transition");
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => interpolate(translations[locale][key] ?? key, params),
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
