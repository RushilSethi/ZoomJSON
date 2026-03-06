import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectValueType } from "@/utils/formatValue";
import { ChevronRight, ChevronDown, Map } from "lucide-react";

interface MinimapProps {
  data: unknown;
  focusPath: string[];
  onFocus: (path: string[]) => void;
}

interface TreeNode {
  path: string[];
  key: string;
  depth: number;
  type: "object" | "array" | "primitive";
  childCount: number;
  children: TreeNode[];
}

function buildTree(data: unknown, path: string[] = [], key = "root", depth = 0, maxDepth = 5): TreeNode {
  const type = detectValueType(data);
  const children: TreeNode[] = [];

  if (depth < maxDepth) {
    if (type === "object") {
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj);
      for (const k of keys.slice(0, 10)) {
        children.push(buildTree(obj[k], [...path, k], k, depth + 1, maxDepth));
      }
    } else if (type === "array") {
      const arr = data as unknown[];
      // For arrays, only show a summary node
      if (arr.length > 0) {
        const sample = arr[0];
        const sampleType = detectValueType(sample);
        if (sampleType === "object" || sampleType === "array") {
          children.push(buildTree(sample, [...path, "0"], "[0]", depth + 1, maxDepth));
        }
      }
    }
  }

  return {
    path,
    key,
    depth,
    type: type === "object" ? "object" : type === "array" ? "array" : "primitive",
    childCount: type === "object" ? Object.keys(data as Record<string, unknown>).length
      : type === "array" ? (data as unknown[]).length : 0,
    children,
  };
}

export function Minimap({ data, focusPath, onFocus }: MinimapProps) {
  const tree = useMemo(() => buildTree(data), [data]);
  const [collapsed, setCollapsed] = useState(false);

  if (tree.children.length === 0 && tree.type === "primitive") return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block">
      <motion.div
        layout
        className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden"
        style={{ width: collapsed ? "auto" : 200 }}
      >
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors border-b border-border/50"
        >
          <Map size={11} className="text-primary" />
          <span>Structure</span>
          {collapsed ? <ChevronRight size={10} className="ml-auto" /> : <ChevronDown size={10} className="ml-auto" />}
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="max-h-[280px] overflow-y-auto p-2"
            >
              <MinimapNode node={tree} focusPath={focusPath} onFocus={onFocus} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function MinimapNode({ node, focusPath, onFocus }: { node: TreeNode; focusPath: string[]; onFocus: (path: string[]) => void }) {
  const [expanded, setExpanded] = useState(node.depth < 2);
  const focusKey = focusPath.join(".");
  const nodeKey = node.path.join(".");
  const isFocused = focusKey === nodeKey;
  const isAncestor = focusKey.startsWith(nodeKey + ".") || (nodeKey === "" && focusPath.length > 0);
  const hasChildren = node.children.length > 0;

  const typeLabel = node.type === "array" ? `[${node.childCount}]`
    : node.type === "object" ? `{${node.childCount}}` : null;

  return (
    <div>
      <button
        onClick={() => {
          onFocus(node.path);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={`flex items-center gap-1.5 w-full text-left rounded-md px-1.5 py-1 transition-all duration-100 group ${
          isFocused
            ? "bg-primary/15 text-primary"
            : isAncestor
            ? "text-foreground/80"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        }`}
        style={{ paddingLeft: `${node.depth * 10 + 4}px` }}
      >
        {hasChildren && (
          <span className="shrink-0">
            {expanded
              ? <ChevronDown size={9} className="text-muted-foreground/60" />
              : <ChevronRight size={9} className="text-muted-foreground/60" />
            }
          </span>
        )}
        {!hasChildren && <span className="w-[9px] shrink-0" />}
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isFocused ? "bg-primary" : node.type === "object" ? "bg-muted-foreground/40" : node.type === "array" ? "bg-[hsl(var(--type-number))]/40" : "bg-muted-foreground/20"
          }`}
        />
        <span className="text-[10px] truncate font-medium">{node.key}</span>
        {typeLabel && (
          <span className="text-[9px] text-muted-foreground/50 ml-auto shrink-0">{typeLabel}</span>
        )}
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child, i) => (
            <MinimapNode key={i} node={child} focusPath={focusPath} onFocus={onFocus} />
          ))}
        </div>
      )}
    </div>
  );
}
