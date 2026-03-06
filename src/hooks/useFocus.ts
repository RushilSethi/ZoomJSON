import { useState, useCallback, useEffect } from "react";

export function useFocus() {
  const [focusPath, setFocusPath] = useState<string[]>([]);

  const focus = useCallback((path: string[]) => {
    setFocusPath(path);
  }, []);

  const goBack = useCallback(() => {
    setFocusPath((prev) => prev.slice(0, -1));
  }, []);

  const goToIndex = useCallback((index: number) => {
    setFocusPath((prev) => prev.slice(0, index + 1));
  }, []);

  const reset = useCallback(() => {
    setFocusPath([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusPath.length > 0) {
        goBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusPath, goBack]);

  return { focusPath, focus, goBack, goToIndex, reset, isFocused: focusPath.length > 0 };
}
