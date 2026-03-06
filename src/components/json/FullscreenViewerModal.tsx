import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Search, LayoutGrid, GitBranch, Copy, Check, MoreHorizontal } from "lucide-react";
import { JSONRenderer } from "./JSONRenderer";
import { TreeView } from "./TreeView";
import { Breadcrumb } from "./Breadcrumb";
import { useState, useCallback } from "react";

interface FullscreenViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: unknown;
  focusPath: string[];
  onFocus: (path: string[]) => void;
  goToIndex: (index: number) => void;
  reset: () => void;
  isFocused: boolean;
  pinnedKeys: Set<string>;
  onTogglePin: (key: string) => void;
  onSearch: () => void;
  highlightPath?: string[] | null;
}

export function FullscreenViewerModal({
  isOpen,
  onClose,
  data,
  focusPath,
  onFocus,
  goToIndex,
  reset,
  isFocused,
  pinnedKeys,
  onTogglePin,
  onSearch,
  highlightPath,
}: FullscreenViewerModalProps) {
  const [localView, setLocalView] = useState<"explorer" | "tree">("explorer");
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [data]);

  const toolBtnClass = "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-muted/30 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <Maximize2 size={14} className="text-primary" />
              <span className="text-sm font-medium text-foreground hidden sm:inline">JSON Viewer</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* View mode toggle - always visible */}
              <div className="flex items-center rounded-lg border border-border bg-card/50 overflow-hidden mr-1 sm:mr-2">
                <button
                  onClick={() => setLocalView("explorer")}
                  className={`flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-3 py-1.5 transition-all duration-150 ${
                    localView === "explorer" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid size={12} />
                  <span className="hidden sm:inline">Explorer</span>
                </button>
                <button
                  onClick={() => setLocalView("tree")}
                  className={`flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-3 py-1.5 transition-all duration-150 ${
                    localView === "tree" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GitBranch size={12} />
                  <span className="hidden sm:inline">Tree</span>
                </button>
              </div>

              {/* Desktop: all buttons */}
              <div className="hidden sm:flex items-center gap-0.5">
                <button onClick={onSearch} className={toolBtnClass}>
                  <Search size={12} /> Search
                </button>
                <button onClick={copyAll} className={toolBtnClass}>
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy All"}
                </button>
                <div className="w-px h-5 bg-border mx-1" />
              </div>

              {/* Mobile: overflow menu for search/copy */}
              <div className="relative sm:hidden">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className={toolBtnClass}
                >
                  <MoreHorizontal size={14} />
                </button>
                <AnimatePresence>
                  {showMore && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMore(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1 z-20 min-w-[120px]"
                      >
                        <button onClick={() => { onSearch(); setShowMore(false); }} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-all w-full">
                          <Search size={12} /> Search
                        </button>
                        <button onClick={() => { copyAll(); setShowMore(false); }} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-all w-full">
                          <Copy size={12} /> Copy All
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={onClose} className={toolBtnClass}>
                <X size={14} />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-4 px-2 sm:px-0">
              {localView === "explorer" && isFocused && (
                <div className="px-4 sm:px-6">
                  <Breadcrumb path={focusPath} onNavigate={goToIndex} onReset={reset} />
                </div>
              )}
              {localView === "explorer" && (
                <JSONRenderer
                  data={data}
                  focusPath={focusPath}
                  onFocus={onFocus}
                  pinnedKeys={pinnedKeys}
                  onTogglePin={onTogglePin}
                  highlightPath={highlightPath}
                />
              )}
              {localView === "tree" && (
                <div className="px-4 sm:px-6 pb-8">
                  <TreeView data={data} onFocus={onFocus} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
