import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Scissors, Copy, Check, FileText, MoreHorizontal, AlertCircle } from "lucide-react";
import { parseJSON } from "@/utils/parseJSON";

interface FullscreenInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
}

export function FullscreenInputModal({ isOpen, onClose, value, onChange }: FullscreenInputModalProps) {
  const [localValue, setLocalValue] = useState(value);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalValue(value);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onChange(localValue);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onChange, localValue]);

  const beautify = useCallback(() => {
    try {
      const parsed = JSON.parse(localValue.trim());
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalValue(formatted);
      onChange(formatted);
    } catch { /* ignore */ }
  }, [localValue, onChange]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(localValue.trim());
      const minified = JSON.stringify(parsed);
      setLocalValue(minified);
      onChange(minified);
    } catch { /* ignore */ }
  }, [localValue, onChange]);

  const trimWhitespace = useCallback(() => {
    try {
      const parsed = JSON.parse(localValue.trim());
      const trimmed = JSON.parse(JSON.stringify(parsed, (_, v) =>
        typeof v === "string" ? v.trim() : v
      ));
      const formatted = JSON.stringify(trimmed, null, 2);
      setLocalValue(formatted);
      onChange(formatted);
    } catch { /* ignore */ }
  }, [localValue, onChange]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(localValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [localValue]);

  const handleChange = useCallback((val: string) => {
    setLocalValue(val);
    onChange(val);
  }, [onChange]);

  const localError = useMemo(() => {
    if (!localValue.trim()) return null;
    return parseJSON(localValue).error;
  }, [localValue]);

  const lineCount = useMemo(() => {
    return localValue.split("\n").length;
  }, [localValue]);

  // Extract error line number from error message (e.g. "... at line 5 column 3" or "... position 42")
  const errorLine = useMemo(() => {
    if (!localError) return null;
    const lineMatch = localError.match(/line (\d+)/i);
    if (lineMatch) return parseInt(lineMatch[1], 10);
    const posMatch = localError.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const upToPos = localValue.slice(0, pos);
      return upToPos.split("\n").length;
    }
    return null;
  }, [localError, localValue]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const toolBtnClass = "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <FileText size={14} className="text-primary" />
              <span className="text-sm font-medium text-foreground hidden sm:inline">Raw JSON</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Desktop: all buttons */}
              <div className="hidden sm:flex items-center gap-0.5">
                <button onClick={beautify} className={toolBtnClass}>
                  <Maximize2 size={11} /> Format
                </button>
                <button onClick={minify} className={toolBtnClass}>
                  <Minimize2 size={11} /> Minify
                </button>
                <button onClick={trimWhitespace} className={toolBtnClass}>
                  <Scissors size={11} /> Trim
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <button onClick={copyToClipboard} className={toolBtnClass}>
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <div className="w-px h-5 bg-border mx-1" />
              </div>

              {/* Mobile: compact buttons + overflow */}
              <div className="flex sm:hidden items-center gap-0.5">
                <button onClick={beautify} className={toolBtnClass}>
                  <Maximize2 size={11} />
                </button>
                <button onClick={copyToClipboard} className={toolBtnClass}>
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                </button>
                <div className="relative">
                  <button onClick={() => setShowMore(!showMore)} className={toolBtnClass}>
                    <MoreHorizontal size={14} />
                  </button>
                  <AnimatePresence>
                    {showMore && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMore(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1 z-20 min-w-[120px]"
                        >
                          <button onClick={() => { minify(); setShowMore(false); }} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-all w-full">
                            <Minimize2 size={11} /> Minify
                          </button>
                          <button onClick={() => { trimWhitespace(); setShowMore(false); }} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-all w-full">
                            <Scissors size={11} /> Trim
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={() => { onChange(localValue); onClose(); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-muted/30 transition-all"
              >
                <X size={14} />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Editor with line numbers */}
          <div className="flex-1 overflow-hidden p-3 sm:p-4 flex flex-col">
            <div className="flex flex-1 min-h-0 bg-card/50 border border-border rounded-xl overflow-hidden focus-within:border-primary/30">
              {/* Line numbers gutter */}
              <div
                ref={lineNumbersRef}
                className="shrink-0 overflow-hidden select-none py-4 pl-3 pr-2 text-right border-r border-border/50 bg-muted/20"
                aria-hidden="true"
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i}
                    className={`text-[11px] leading-[1.425rem] font-mono ${
                      errorLine === i + 1
                        ? "text-destructive font-semibold"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onScroll={handleScroll}
                className="w-full flex-1 bg-transparent px-4 py-4 text-sm font-mono leading-[1.425rem] text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
            <AnimatePresence>
              {localError && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/15 text-xs text-destructive"
                >
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  <span className="break-words whitespace-pre-wrap">{localError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
