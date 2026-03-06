import { useState, useCallback } from "react";

export function useCollapseMemory() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const isCollapsed = useCallback((pathKey: string) => collapsed.has(pathKey), [collapsed]);

  const toggle = useCallback((pathKey: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey);
      else next.add(pathKey);
      return next;
    });
  }, []);

  return { isCollapsed, toggle };
}
