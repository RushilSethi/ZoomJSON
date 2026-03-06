import { Search, Sparkles, LayoutGrid, GitBranch, ArrowLeftRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/json/ThemeSwitcher";
import { Link } from "react-router-dom";

export type ViewMode = "explorer" | "tree" | "diff";

interface HeaderProps {
  hasData: boolean;
  onSearch: () => void;
  onReset: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const viewTabs = [
  { mode: "explorer" as const, icon: LayoutGrid, label: "Explorer" },
  { mode: "tree" as const, icon: GitBranch, label: "Tree" },
  { mode: "diff" as const, icon: ArrowLeftRight, label: "Diff" },
];

export function Header({ hasData, onSearch, onReset, viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-primary/10 accent-gradient-bg texture-overlay overflow-visible">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <Link to="/" className="flex items-center gap-2 group relative z-10 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
        <h1 className="text-sm font-bold tracking-wide uppercase text-foreground/90 group-hover:text-primary transition-colors duration-150">
          ZoomJSON
        </h1>
        <Sparkles size={11} className="text-primary/60 hidden sm:block" />
      </Link>

      <div className="hidden md:flex items-center gap-0.5 rounded-lg border border-border bg-card/50 backdrop-blur-sm p-0.5 relative z-10">
        {viewTabs.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              viewMode === mode
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
            }`}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
        {hasData && (
          <button
            onClick={onSearch}
            className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all duration-150 px-3 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 bg-card/50 backdrop-blur-sm"
          >
            <Search size={13} />
            <span>Search</span>
            <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50">⌘F</kbd>
          </button>
        )}
        <ThemeSwitcher />
      </div>
    </header>
  );
}
