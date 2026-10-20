"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { translate, type Locale } from "@/lib/i18n";

let temporaryTheme: "light" | "dark" | null = null;

function getThemeSnapshot(): "light" | "dark" {
  if (temporaryTheme) return temporaryTheme;
  try {
    const saved = localStorage.getItem("lifeos-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") return current;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("lifeos-theme-change", onChange);
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  preference.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("lifeos-theme-change", onChange);
    preference.removeEventListener("change", onChange);
  };
}

function getServerThemeSnapshot(): "light" {
  return "light";
}

export function ThemeToggle({ className = "", locale = "en" }: { className?: string; locale?: Locale }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("lifeos-theme", next);
      temporaryTheme = null;
    } catch {
      temporaryTheme = next;
    }
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("lifeos-theme-change"));
  }

  return (
    <button
      className={`icon-button ${className} ${theme === "dark" ? "dark-active" : ""}`}
      type="button"
      onClick={toggleTheme}
      aria-label={translate(locale, theme === "dark" ? "Switch to light theme" : "Switch to dark theme")}
      title={translate(locale, theme === "dark" ? "Switch to light theme" : "Switch to dark theme")}
    >
      {theme === "dark" ? <Sun size={15} className="theme-icon sun-icon" /> : <Moon size={15} className="theme-icon moon-icon" />}
    </button>
  );
}
