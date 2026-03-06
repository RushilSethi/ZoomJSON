import { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { detectUniformArray } from "@/utils/detectUniformArray";
import { PrimitiveView } from "./PrimitiveView";
import { detectValueType } from "@/utils/formatValue";
import { ChevronRight, Star } from "lucide-react";

interface ArrayViewProps {
  data: unknown[];
  path: string[];
  onFocus: (path: string[]) => void;
  pinnedKeys?: Set<string>;
  onTogglePin?: (key: string) => void;
  highlightKey?: string | null;
}

function getTypeBadge(data: unknown[]): string | null {
  if (data.length === 0) return null;
  const types = data.map(item => detectValueType(item));
  const typeCount: Record<string, number> = {};
  for (const t of types) typeCount[t] = (typeCount[t] || 0) + 1;
  const entries = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
  if (entries.length === 1) return `${data.length} ${entries[0][0]}${data.length !== 1 ? "s" : ""}`;
  return entries.map(([t, c]) => `${c} ${t}${c !== 1 ? "s" : ""}`).join(", ");
}

function getFrequencyHint(data: Record<string, unknown>[], key: string): string | null {
  const values = data.map(row => JSON.stringify(row[key]));
  const unique = new Set(values).size;
  if (unique === data.length) return null;
  return `${unique} unique`;
}

export function ArrayView({ data, path, onFocus, pinnedKeys, onTogglePin, highlightKey }: ArrayViewProps) {
  const uniformKeys = detectUniformArray(data);
  const typeBadge = useMemo(() => getTypeBadge(data), [data]);

  if (uniformKeys) {
    return (
      <TableView
        data={data as Record<string, unknown>[]}
        keys={uniformKeys}
        path={path}
        onFocus={onFocus}
        typeBadge={typeBadge}
        pinnedKeys={pinnedKeys}
        onTogglePin={onTogglePin}
        highlightKey={highlightKey}
      />
    );
  }

  return <ListView data={data} path={path} onFocus={onFocus} typeBadge={typeBadge} highlightKey={highlightKey} />;
}

function TableView({
  data, keys, path, onFocus, typeBadge, pinnedKeys, onTogglePin, highlightKey,
}: {
  data: Record<string, unknown>[]; keys: string[]; path: string[];
  onFocus: (path: string[]) => void; typeBadge: string | null;
  pinnedKeys?: Set<string>; onTogglePin?: (key: string) => void;
  highlightKey?: string | null;
}) {
  const highlightRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (highlightKey && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightKey]);

  const orderedKeys = useMemo(() => {
    if (!pinnedKeys || pinnedKeys.size === 0) return keys;
    const pinned = keys.filter(k => pinnedKeys.has(k));
    const unpinned = keys.filter(k => !pinnedKeys.has(k));
    return [...pinned, ...unpinned];
  }, [keys, pinnedKeys]);

  const frequencyHints = useMemo(() => {
    const hints: Record<string, string | null> = {};
    for (const key of keys) hints[key] = getFrequencyHint(data, key);
    return hints;
  }, [data, keys]);

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="rounded-lg border border-border overflow-hidden">
      {typeBadge && (
        <div className="px-4 py-1.5 bg-muted/10 border-b border-border/50">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{typeBadge}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 sticky top-0">
              {orderedKeys.map((key) => {
                const isPinned = pinnedKeys?.has(key);
                return (
                  <th key={key} className={`text-left text-xs font-medium text-muted-foreground px-4 py-2.5 uppercase tracking-wider group/th ${isPinned ? "bg-primary/5" : ""}`}>
                    <span className="flex items-center gap-1.5">
                      {onTogglePin && (
                        <button onClick={(e) => { e.stopPropagation(); onTogglePin(key); }} className={`transition-opacity duration-150 ${isPinned ? "opacity-100" : "opacity-0 group-hover/th:opacity-100"}`} title={isPinned ? "Unpin" : "Pin column"}>
                          <Star size={10} className={isPinned ? "fill-primary text-primary" : ""} />
                        </button>
                      )}
                      {key}
                      {frequencyHints[key] && <span className="text-[9px] normal-case tracking-normal text-muted-foreground/50 font-normal ml-1">{frequencyHints[key]}</span>}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isHighlighted = highlightKey === String(i);
              return (
                <tr
                  key={i}
                  ref={isHighlighted ? highlightRef : undefined}
                  className={`border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer transition-all duration-300 ${isHighlighted ? "bg-primary/10 ring-1 ring-primary/30 highlight-pulse" : ""}`}
                  onClick={() => onFocus([...path, String(i)])}
                >
                  {orderedKeys.map((key) => {
                    const value = row[key];
                    const type = detectValueType(value);
                    const isPinned = pinnedKeys?.has(key);
                    return (
                      <td key={key} className={`px-4 py-2.5 ${type === "number" ? "text-right font-mono" : ""} ${isPinned ? "bg-primary/5" : ""}`}>
                        <PrimitiveView value={value} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ListView({ data, path, onFocus, typeBadge, highlightKey }: {
  data: unknown[]; path: string[]; onFocus: (path: string[]) => void; typeBadge: string | null; highlightKey?: string | null;
}) {
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightKey && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightKey]);

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="rounded-lg border border-border bg-card p-4 space-y-1">
      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
        <span>{data.length} items</span>
        {typeBadge && <span className="text-[10px] text-muted-foreground/50">— {typeBadge}</span>}
      </div>
      {data.map((item, i) => {
        const type = detectValueType(item);
        const navigable = type === "object" || type === "array";
        const isHighlighted = highlightKey === String(i);
        return (
          <div
            key={i}
            ref={isHighlighted ? highlightRef : undefined}
            className={`flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-md transition-all duration-300 ${navigable ? "hover:bg-muted/50 cursor-pointer" : ""} ${isHighlighted ? "bg-primary/10 ring-1 ring-primary/30 highlight-pulse" : ""}`}
            onClick={navigable ? () => onFocus([...path, String(i)]) : undefined}
          >
            <span className="text-muted-foreground text-xs font-mono min-w-[28px]">{i}</span>
            <span className="flex-1 text-sm">
              {navigable ? (
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  {Array.isArray(item) ? `[${(item as unknown[]).length}]` : `{${Object.keys(item as Record<string, unknown>).length}}`}
                  <ChevronRight size={12} className="text-muted-foreground/50" />
                </span>
              ) : (
                <PrimitiveView value={item} />
              )}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}
