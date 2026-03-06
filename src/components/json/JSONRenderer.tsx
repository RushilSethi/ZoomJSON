import { motion } from "framer-motion";
import { ObjectView } from "./ObjectView";
import { ArrayView } from "./ArrayView";
import { PrimitiveView } from "./PrimitiveView";
import { detectValueType } from "@/utils/formatValue";
import { getValueAtPath } from "@/utils/getPathValue";

interface JSONRendererProps {
  data: unknown;
  focusPath: string[];
  onFocus: (path: string[]) => void;
  pinnedKeys?: Set<string>;
  onTogglePin?: (key: string) => void;
  highlightPath?: string[] | null;
}

export function JSONRenderer({ data, focusPath, onFocus, pinnedKeys, onTogglePin, highlightPath }: JSONRendererProps) {
  const currentData = focusPath.length > 0 ? getValueAtPath(data, focusPath) : data;
  const type = detectValueType(currentData);

  // Calculate the highlight key relative to current focus
  const highlightKey = (() => {
    if (!highlightPath || highlightPath.length === 0) return null;
    // The highlight path should be relative: if focusPath is prefix, the next segment is the key
    if (highlightPath.length > focusPath.length) {
      const matches = focusPath.every((seg, i) => highlightPath[i] === seg);
      if (matches) return highlightPath[focusPath.length];
    }
    return null;
  })();

  return (
    <motion.div
      key={focusPath.join(".")}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="px-6 pb-8"
    >
      {type === "object" && (
        <ObjectView
          data={currentData as Record<string, unknown>}
          path={focusPath}
          onFocus={onFocus}
          pinnedKeys={pinnedKeys}
          onTogglePin={onTogglePin}
          highlightKey={highlightKey}
        />
      )}
      {type === "array" && (
        <ArrayView
          data={currentData as unknown[]}
          path={focusPath}
          onFocus={onFocus}
          pinnedKeys={pinnedKeys}
          onTogglePin={onTogglePin}
          highlightKey={highlightKey}
        />
      )}
      {type !== "object" && type !== "array" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <PrimitiveView value={currentData} />
        </div>
      )}
    </motion.div>
  );
}
