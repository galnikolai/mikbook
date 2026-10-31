"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className={`landing-lang ${className}`} role="group" aria-label={t.langAria}>
      <button
        type="button"
        className={`landing-lang__btn${locale === "fr" ? " is-active" : ""}`}
        aria-pressed={locale === "fr"}
        onClick={() => setLocale("fr")}
      >
        {t.langFr}
      </button>
      <span className="landing-lang__sep" aria-hidden>
        /
      </span>
      <button
        type="button"
        className={`landing-lang__btn${locale === "en" ? " is-active" : ""}`}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        {t.langEn}
      </button>
    </div>
  );
}
