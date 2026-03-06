import { useState, useRef, useEffect } from "react";
import { Palette, Lock } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all duration-150 px-2.5 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 bg-card/50 backdrop-blur-sm"
        title="Switch theme"
      >
        <Palette size={13} />
        <span className="hidden sm:inline">{themes.find(t => t.name === theme)?.icon}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-[100] min-w-[140px] rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {themes.map((t) => {
            const isLocked = 'locked' in t && t.locked;
            return (
              <button
                key={t.name}
                onClick={() => {
                  if (isLocked) return;
                  setTheme(t.name);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition-all duration-150 ${
                  isLocked
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : theme === t.name
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
                disabled={isLocked}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {isLocked && <Lock size={10} className="ml-auto text-muted-foreground/40" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
