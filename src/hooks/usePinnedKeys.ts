import { useState, useCallback } from "react";

export function usePinnedKeys() {
  const [pinnedKeys, setPinnedKeys] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("json-lens-pinned-keys");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const togglePin = useCallback((key: string) => {
    setPinnedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem("json-lens-pinned-keys", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isPinned = useCallback((key: string) => pinnedKeys.has(key), [pinnedKeys]);

  return { pinnedKeys, togglePin, isPinned };
}
