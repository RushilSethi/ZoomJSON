import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Copy, Check, Star } from "lucide-react";
import { PrimitiveView } from "./PrimitiveView";
import { detectValueType } from "@/utils/formatValue";
import { pathToString } from "@/utils/getPathValue";

interface ObjectViewProps {
  data: Record<string, unknown>;
  path: string[];
  onFocus: (path: string[]) => void;
  pinnedKeys?: Set<string>;
  onTogglePin?: (key: string) => void;
  highlightKey?: string | null;
}

export function ObjectView({ data, path, onFocus, pinnedKeys, onTogglePin, highlightKey }: ObjectViewProps) {
  const keys = Object.keys(data);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted key
  useEffect(() => {
    if (highlightKey && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightKey]);

  const sortedKeys = useMemo(() => {
    if (!pinnedKeys || pinnedKeys.size === 0) return keys;
    const pinned = keys.filter(k => pinnedKeys.has(k));
    const unpinned = keys.filter(k => !pinnedKeys.has(k));
    return [...pinned, ...unpinned];
  }, [keys, pinnedKeys]);

  const copyPath = useCallback((key: string) => {
    const fullPath = pathToString([...path, key]);
    navigator.clipboard.writeText(fullPath);
    setCopiedPath(key);
    setTimeout(() => setCopiedPath(null), 1500);
  }, [path]);

  const isNavigable = (value: unknown) => {
    const type = detectValueType(value);
    return type === "object" || type === "array";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-border bg-card p-4 space-y-1"
    >
      {sortedKeys.map((key) => {
        const value = data[key];
        const navigable = isNavigable(value);
        const isPinned = pinnedKeys?.has(key);
        const isHighlighted = highlightKey === key;

        return (
          <div
            key={key}
            ref={isHighlighted ? highlightRef : undefined}
            className={`flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-md group transition-all duration-300 ${
              navigable ? "hover:bg-muted/50 cursor-pointer" : ""
            } ${isPinned ? "bg-primary/5 border-l-2 border-l-primary/30" : ""} ${
              isHighlighted ? "bg-primary/10 ring-1 ring-primary/30 highlight-pulse" : ""
            }`}
            onClick={navigable ? () => onFocus([...path, key]) : undefined}
          >
            <span className="text-muted-foreground text-xs font-medium min-w-[80px] shrink-0 pt-0.5 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyPath(key);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                title="Copy path"
              >
                {copiedPath === key ? <Check size={10} className="text-primary" /> : <Copy size={10} />}
              </button>
              {onTogglePin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(key);
                  }}
                  className={`transition-opacity duration-150 ${isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  title={isPinned ? "Unpin key" : "Pin key"}
                >
                  <Star size={10} className={isPinned ? "fill-primary text-primary" : "text-muted-foreground"} />
                </button>
              )}
              {key}
            </span>
            <span className="flex-1 text-sm">
              {navigable ? (
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  {Array.isArray(value)
                    ? `${(value as unknown[]).length} items`
                    : `${Object.keys(value as Record<string, unknown>).length} keys`}
                  <ChevronRight size={12} className="text-muted-foreground/50" />
                </span>
              ) : (
                <PrimitiveView value={value} />
              )}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}
