import { useState, useMemo, useCallback, useEffect } from "react";
import { searchJSON, type SearchMatch } from "@/utils/searchJSON";

export function useSearch(data: unknown) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results: SearchMatch[] = useMemo(() => {
    if (!data || !query.trim()) return [];
    return searchJSON(data, query);
  }, [data, query]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, open, close]);

  return { isOpen, query, setQuery, results, open, close };
}
