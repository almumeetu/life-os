"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lifeos-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lifeos-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  if (!mounted) {
    return (
      <button className={`icon-button ${className}`} type="button" aria-label="Toggle theme">
        <Sun size={15} />
      </button>
    );
  }

  return (
    <button
      className={`icon-button ${className} ${theme === "dark" ? "dark-active" : ""}`}
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Sun size={15} className="theme-icon sun-icon" /> : <Moon size={15} className="theme-icon moon-icon" />}
    </button>
  );
}
