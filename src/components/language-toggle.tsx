"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { translate, type Locale } from "@/lib/i18n";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const nextLocale = locale === "en" ? "bn" : "en";
  const label = locale === "en" ? "বাংলা" : "English";

  async function changeLanguage() {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/preferences/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (!response.ok) throw new Error("Language preference was not saved.");
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="language-control">
      <button
        className="icon-button language-toggle"
        type="button"
        onClick={changeLanguage}
        disabled={pending}
        aria-label={translate(locale, locale === "en" ? "Switch language to Bangla" : "Switch language to English")}
        title={translate(locale, locale === "en" ? "Switch language to Bangla" : "Switch language to English")}
      >
        <Languages size={16} aria-hidden="true" />
        <span>{pending ? "…" : label}</span>
      </button>
      {failed && <span className="language-error" role="status">{translate(locale, "Could not change language. Please try again.")}</span>}
    </div>
  );
}
