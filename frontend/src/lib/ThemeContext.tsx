import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ThemeVariant, themes, defaultThemeId, getThemeById } from "./themes";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  themeId: string;
  toggle: () => void;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const MODE_STORAGE_KEY = "prismel-theme";
const THEME_ID_STORAGE_KEY = "prismel-theme-id";
const STYLE_ID = "prismel-theme-vars";

function getStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }
  return "dark";
}

function getStoredThemeId(): string {
  try {
    const stored = localStorage.getItem(THEME_ID_STORAGE_KEY);
    if (stored && getThemeById(stored)) return stored;
  } catch {
    // localStorage unavailable
  }
  return defaultThemeId;
}

/** Build CSS with both :root (light) and .dark (dark) variable blocks.
 *  Both blocks are always present; the .dark class on <html> controls
 *  which set is active via the cascade. */
function buildCSSVariables(theme: ThemeVariant): string {
  const shadeMap: Record<number, number[]> = {
    11: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    10: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  };

  function emitBlock(selector: string, palette: Record<string, string[]>) {
    lines.push(`${selector} {`);
    for (const [family, shades] of Object.entries(palette)) {
      const shadeNumbers = shadeMap[shades.length] ?? (shades as string[]).map((_: string, i: number) => (i + 1) * 100 - 50);
      (shades as string[]).forEach((rgb: string, i: number) => {
        lines.push(`  --${family}-${shadeNumbers[i]}: ${rgb};`);
      });
    }
    lines.push("}");
  }

  const lines: string[] = [];
  emitBlock(":root", theme.palette.light as unknown as Record<string, string[]>);
  emitBlock(".dark", theme.palette.dark as unknown as Record<string, string[]>);

  return lines.join("\n");
}

function injectStyle(theme: ThemeVariant) {
  const css = buildCSSVariables(theme);
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function applyDarkClass(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);
  const [themeId, setThemeId] = useState<string>(getStoredThemeId);

  // Apply dark class on mount and mode change
  useEffect(() => {
    applyDarkClass(mode);
  }, [mode]);

  // Persist mode
  useEffect(() => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  // Persist themeId
  useEffect(() => {
    try {
      localStorage.setItem(THEME_ID_STORAGE_KEY, themeId);
    } catch {
      // ignore
    }
  }, [themeId]);

  // Inject CSS variables on mount and theme change (not on mode toggle)
  useEffect(() => {
    const theme = getThemeById(themeId) ?? themes[0];
    injectStyle(theme);
  }, [themeId]);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((id: string) => {
    if (getThemeById(id)) {
      setThemeId(id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, themeId, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
