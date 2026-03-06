import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import type { SearchMatch } from "@/utils/searchJSON";

interface SearchOverlayProps {
  isOpen: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  results: SearchMatch[];
  onClose: () => void;
  onSelect: (path: string[]) => void;
}

export function SearchOverlay({ isOpen, query, onQueryChange, results, onClose, onSelect }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search keys and values…"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Search only works in Explorer view</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>
            {query && (
              <div className="max-h-[300px] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">No results</div>
                ) : (
                  results.map((match, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSelect(match.path);
                        onClose();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors duration-100 border-b border-border/30 last:border-0"
                    >
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {match.path.join(" › ")}
                      </div>
                      <div className="text-sm mt-0.5">
                        <span className="text-muted-foreground">{match.key}: </span>
                        <span className="text-foreground truncate">{match.value}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
