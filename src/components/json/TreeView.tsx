import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { PrimitiveView } from "./PrimitiveView";
import { detectValueType } from "@/utils/formatValue";
import { pathToString } from "@/utils/getPathValue";
import { useCollapseMemory } from "@/hooks/useCollapseMemory";
import { useState } from "react";

interface TreeViewProps {
  data: unknown;
  path?: string[];
  onFocus?: (path: string[]) => void;
}

export function TreeView({ data, path = [], onFocus }: TreeViewProps) {
  const collapseMemory = useCollapseMemory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="px-6 pb-8"
    >
      <div className="rounded-lg border border-border bg-card p-3 font-mono text-sm">
        <TreeNode
          value={data}
          keyName={null}
          path={path}
          depth={0}
          onFocus={onFocus}
          defaultOpen
          collapseMemory={collapseMemory}
        />
      </div>
    </motion.div>
  );
}

interface CollapseMemory {
  isCollapsed: (pathKey: string) => boolean;
  toggle: (pathKey: string) => void;
}

interface TreeNodeProps {
  value: unknown;
  keyName: string | null;
  path: string[];
  depth: number;
  onFocus?: (path: string[]) => void;
  defaultOpen?: boolean;
  isLast?: boolean;
  collapseMemory: CollapseMemory;
}

function TreeNode({ value, keyName, path, depth, onFocus, defaultOpen = false, isLast = true, collapseMemory }: TreeNodeProps) {
  const type = detectValueType(value);
  const isExpandable = type === "object" || type === "array";
  const pathKey = path.join(".");

  // Use collapse memory: if path is tracked as collapsed, it's collapsed.
  // Default: root is open, depth < 1 is open, rest is closed.
  const defaultState = defaultOpen || depth < 1;
  const isOpen = isExpandable
    ? collapseMemory.isCollapsed(pathKey)
      ? false
      : defaultState || !collapseMemory.isCollapsed(pathKey) && defaultState
    : false;

  // We need a computed open state that respects memory
  const [localOverride, setLocalOverride] = useState<boolean | null>(null);

  const computedOpen = localOverride !== null ? localOverride : (collapseMemory.isCollapsed(pathKey) ? false : defaultState);

  const [copiedPath, setCopiedPath] = useState(false);

  const copyPath = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pathToString(path));
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
  }, [path]);

  const toggle = useCallback(() => {
    const newState = !computedOpen;
    setLocalOverride(newState);
    collapseMemory.toggle(pathKey);
  }, [computedOpen, collapseMemory, pathKey]);

  const childEntries = isExpandable
    ? Array.isArray(value)
      ? (value as unknown[]).map((v, i) => ({ key: String(i), value: v }))
      : Object.entries(value as Record<string, unknown>).map(([k, v]) => ({ key: k, value: v }))
    : [];

  const bracketOpen = type === "array" ? "[" : "{";
  const bracketClose = type === "array" ? "]" : "}";
  const itemCount = childEntries.length;

  return (
    <div className="relative">
      {depth > 0 && (
        <div
          className="absolute top-0 border-l border-border/40"
          style={{ left: `${(depth - 1) * 20 + 10}px`, height: isLast ? '14px' : '100%' }}
        />
      )}
      {depth > 0 && (
        <div
          className="absolute top-[14px] border-t border-border/40"
          style={{ left: `${(depth - 1) * 20 + 10}px`, width: '10px' }}
        />
      )}

      <div
        className="flex items-center gap-1 group/node relative"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {isExpandable ? (
          <button
            onClick={toggle}
            className={`flex items-center justify-center w-5 h-5 rounded transition-colors duration-100 shrink-0 ${
              computedOpen ? "hover:bg-muted/60" : "hover:bg-muted/60 bg-muted/20"
            }`}
          >
            {computedOpen ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5 h-5 shrink-0 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
          </span>
        )}

        {keyName !== null && (
          <span
            className="text-muted-foreground text-xs font-medium shrink-0 cursor-pointer hover:text-foreground transition-colors duration-100"
            onClick={isExpandable && onFocus ? () => onFocus(path) : undefined}
          >
            {/^\d+$/.test(keyName) ? (
              <span className="text-type-number opacity-60">{keyName}</span>
            ) : (
              keyName
            )}
            <span className="text-border mx-0.5">:</span>
          </span>
        )}

        {isExpandable ? (
          <span className="flex items-center gap-1.5">
            <span className="text-border">{bracketOpen}</span>
            {!computedOpen && (
              <button
                onClick={toggle}
                className="text-[10px] text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 px-1.5 py-0.5 rounded transition-colors duration-100"
              >
                {itemCount} {type === "array" ? (itemCount === 1 ? "item" : "items") : (itemCount === 1 ? "key" : "keys")}
              </button>
            )}
            {!computedOpen && <span className="text-border">{bracketClose}</span>}
          </span>
        ) : (
          <PrimitiveView value={value} />
        )}

        {keyName !== null && (
          <button
            onClick={copyPath}
            className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 ml-1 text-muted-foreground hover:text-foreground"
            title="Copy path"
          >
            {copiedPath ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
          </button>
        )}
      </div>

      {isExpandable && (
        <AnimatePresence initial={false}>
          {computedOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden relative"
            >
              <div
                className="absolute border-l border-border/40"
                style={{
                  left: `${depth * 20 + 10}px`,
                  top: 0,
                  bottom: '14px',
                }}
              />

              {childEntries.map((entry, i) => (
                <TreeNode
                  key={entry.key}
                  keyName={entry.key}
                  value={entry.value}
                  path={[...path, entry.key]}
                  depth={depth + 1}
                  onFocus={onFocus}
                  isLast={i === childEntries.length - 1}
                  collapseMemory={collapseMemory}
                />
              ))}

              <div
                className="text-border"
                style={{ paddingLeft: `${depth * 20 + 20}px` }}
              >
                {bracketClose}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
