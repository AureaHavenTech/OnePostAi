"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Read stored preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
      }
    } catch {}
    setMounted(true);
  }, []);

  // Apply theme to <html> element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    if (theme === "light") {
      root.style.setProperty("--background", "40 20% 94%");
      root.style.setProperty("--foreground", "240 5% 18%");
      root.style.setProperty("--card", "40 15% 96%");
      root.style.setProperty("--card-foreground", "240 5% 18%");
      root.style.setProperty("--popover", "40 15% 96%");
      root.style.setProperty("--popover-foreground", "240 5% 18%");
      root.style.setProperty("--primary", "38 42% 48%");
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--secondary", "40 15% 90%");
      root.style.setProperty("--secondary-foreground", "240 5% 18%");
      root.style.setProperty("--muted", "40 15% 90%");
      root.style.setProperty("--muted-foreground", "240 3% 40%");
      root.style.setProperty("--border", "40 15% 84%");
      root.style.setProperty("--input", "40 15% 84%");
      root.style.setProperty("--ring", "38 42% 48%");
    } else {
      // Dark — restore defaults
      root.style.setProperty("--background", "240 15% 10%");
      root.style.setProperty("--foreground", "40 10% 88%");
      root.style.setProperty("--card", "240 13% 12%");
      root.style.setProperty("--card-foreground", "40 10% 88%");
      root.style.setProperty("--popover", "240 13% 12%");
      root.style.setProperty("--popover-foreground", "40 10% 88%");
      root.style.setProperty("--primary", "38 42% 55%");
      root.style.setProperty("--primary-foreground", "0 0% 98%");
      root.style.setProperty("--secondary", "240 10% 16%");
      root.style.setProperty("--secondary-foreground", "40 10% 88%");
      root.style.setProperty("--muted", "240 10% 16%");
      root.style.setProperty("--muted-foreground", "40 5% 60%");
      root.style.setProperty("--border", "240 8% 20%");
      root.style.setProperty("--input", "240 8% 20%");
      root.style.setProperty("--ring", "38 42% 55%");
    }

    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
