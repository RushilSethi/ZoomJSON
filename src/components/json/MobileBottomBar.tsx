import { LayoutGrid, GitBranch, ArrowLeftRight, Search } from "lucide-react";
import { ViewMode } from "@/components/json/Header";

interface MobileBottomBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasData: boolean;
  onSearch: () => void;
}

const tabs = [
  { mode: "explorer" as const, icon: LayoutGrid, label: "Explorer" },
  { mode: "tree" as const, icon: GitBranch, label: "Tree" },
  { mode: "diff" as const, icon: ArrowLeftRight, label: "Diff" },
];

export function MobileBottomBar({ viewMode, onViewModeChange, hasData, onSearch }: MobileBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-2">
        {tabs.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
              viewMode === mode
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Icon size={18} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
        {hasData && (
          <button
            onClick={onSearch}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground transition-all duration-150"
          >
            <Search size={18} />
            <span className="text-[10px] font-medium">Search</span>
          </button>
        )}
      </div>
    </div>
  );
}
