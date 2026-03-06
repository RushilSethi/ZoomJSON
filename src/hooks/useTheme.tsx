import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type ThemeName = "dark" | "cupcake" | "autumn" | "synthwave" | "champion";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  themes: { name: ThemeName; label: string; icon: string; locked?: boolean }[];
  championUnlocked: boolean;
  unlockChampion: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const baseThemes: { name: ThemeName; label: string; icon: string }[] = [
  { name: "dark", label: "Midnight", icon: "🌙" },
  { name: "cupcake", label: "Cupcake", icon: "🧁" },
  { name: "autumn", label: "Autumn", icon: "🍂" },
  { name: "synthwave", label: "Synthwave", icon: "🎹" },
];

const CHAMPION_THEME = { name: "champion" as const, label: "Champion", icon: "🏆" };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("json-lens-theme") as ThemeName) || "dark";
    }
    return "dark";
  });

  const [championUnlocked, setChampionUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("json-lens-champion-unlocked") === "true";
    }
    return false;
  });

  const unlockChampion = useCallback(() => {
    setChampionUnlocked(true);
    localStorage.setItem("json-lens-champion-unlocked", "true");
  }, []);

  const setTheme = (t: ThemeName) => {
    if (t === "champion" && !championUnlocked) return;
    setThemeState(t);
    localStorage.setItem("json-lens-theme", t);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const themes = [
    ...baseThemes,
    { ...CHAMPION_THEME, locked: !championUnlocked },
  ];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, championUnlocked, unlockChampion }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
