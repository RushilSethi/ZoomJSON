import { useState, useCallback } from "react";
import { Header, ViewMode } from "@/components/json/Header";
import { InputPanel } from "@/components/json/InputPanel";
import { JSONRenderer } from "@/components/json/JSONRenderer";
import { TreeView } from "@/components/json/TreeView";
import { DiffView } from "@/components/json/DiffView";
import { Breadcrumb } from "@/components/json/Breadcrumb";
import { SearchOverlay } from "@/components/json/SearchOverlay";
import { Minimap } from "@/components/json/Minimap";
import { FullscreenViewerModal } from "@/components/json/FullscreenViewerModal";
import { FullscreenInputModal } from "@/components/json/FullscreenInputModal";
import { parseJSON } from "@/utils/parseJSON";
import { useFocus } from "@/hooks/useFocus";
import { useSearch } from "@/hooks/useSearch";
import { usePinnedKeys } from "@/hooks/usePinnedKeys";
import { Expand } from "lucide-react";
import { MobileBottomBar } from "@/components/json/MobileBottomBar";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("explorer");
  const { focusPath, focus, goToIndex, reset, isFocused } = useFocus();
  const search = useSearch(parsedData);
  const { pinnedKeys, togglePin } = usePinnedKeys();
  const [highlightPath, setHighlightPath] = useState<string[] | null>(null);
  const [viewerFullscreen, setViewerFullscreen] = useState(false);
  const [inputFullscreen, setInputFullscreen] = useState(false);

  const handleParse = useCallback((input: string) => {
    const result = parseJSON(input);
    setParsedData(result.data);
    setError(result.error);
    setSuggestion(result.suggestion);
    reset();
  }, [reset]);

  const handleReset = useCallback(() => {
    setParsedData(null);
    setError(null);
    setSuggestion(undefined);
    setInputValue("");
    reset();
  }, [reset]);

  const handleSearchSelect = useCallback((path: string[]) => {
    setViewMode("explorer");
    const parentPath = path.slice(0, -1);
    focus(parentPath);
    setHighlightPath(path);
    setTimeout(() => setHighlightPath(null), 3000);
  }, [focus]);

  const handleInputChange = useCallback((val: string) => {
    setInputValue(val);
    const result = parseJSON(val);
    setParsedData(result.data);
    setError(result.error);
    setSuggestion(result.suggestion);
  }, []);

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-background overflow-x-hidden">
      <Header
        hasData={!!parsedData}
        onSearch={search.open}
        onReset={handleReset}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="max-w-3xl mx-auto">
        {viewMode !== "diff" && (
          <InputPanel
            onParse={handleParse}
            error={error}
            suggestion={suggestion}
            onOpenFullscreen={() => setInputFullscreen(true)}
            value={inputValue}
            onValueChange={setInputValue}
          />
        )}
        {parsedData !== null && viewMode === "explorer" && (
          <>
            <div className="px-4 sm:px-6 pb-2 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {isFocused && (
                  <Breadcrumb path={focusPath} onNavigate={goToIndex} onReset={reset} />
                )}
              </div>
              <button
                onClick={() => setViewerFullscreen(true)}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground hover:text-primary p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-150 shrink-0"
              >
                <Expand size={11} />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </div>
            <JSONRenderer
              data={parsedData}
              focusPath={focusPath}
              onFocus={focus}
              pinnedKeys={pinnedKeys}
              onTogglePin={togglePin}
              highlightPath={highlightPath}
            />
          </>
        )}
        {parsedData !== null && viewMode === "tree" && (
          <TreeView data={parsedData} onFocus={focus} />
        )}
        {viewMode === "diff" && <DiffView />}
      </div>

      {parsedData !== null && viewMode === "explorer" && (
        <Minimap data={parsedData} focusPath={focusPath} onFocus={focus} />
      )}

      <SearchOverlay
        isOpen={search.isOpen}
        query={search.query}
        onQueryChange={search.setQuery}
        results={search.results}
        onClose={search.close}
        onSelect={handleSearchSelect}
      />

      <FullscreenViewerModal
        isOpen={viewerFullscreen}
        onClose={() => setViewerFullscreen(false)}
        data={parsedData}
        focusPath={focusPath}
        onFocus={focus}
        goToIndex={goToIndex}
        reset={reset}
        isFocused={isFocused}
        pinnedKeys={pinnedKeys}
        onTogglePin={togglePin}
        onSearch={search.open}
        highlightPath={highlightPath}
      />

      <FullscreenInputModal
        isOpen={inputFullscreen}
        onClose={() => setInputFullscreen(false)}
        value={inputValue}
        onChange={handleInputChange}
      />

      <MobileBottomBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasData={!!parsedData}
        onSearch={search.open}
      />
    </div>
  );
};

export default Index;
