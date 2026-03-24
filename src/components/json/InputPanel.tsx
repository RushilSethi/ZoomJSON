import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, AlertCircle, Minimize2, Maximize2, Scissors, Copy, Check, Expand, MoreHorizontal, Lightbulb } from "lucide-react";

interface InputPanelProps {
  onParse: (input: string) => void;
  error: string | null;
  suggestion?: string;
  onOpenFullscreen?: () => void;
  value: string;
  onValueChange: (val: string) => void;
}

export function InputPanel({ onParse, error, suggestion, onOpenFullscreen, value, onValueChange }: InputPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (val: string) => {
      onValueChange(val);
      onParse(val);
    },
    [onParse, onValueChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          onValueChange(text);
          onParse(text);
        };
        reader.readAsText(file);
      }
    },
    [onParse, onValueChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData("text");
      if (text) {
        setTimeout(() => onParse(value + text), 0);
      }
    },
    [onParse, value]
  );

  const beautify = useCallback(() => {
    try {
      const parsed = JSON.parse(value.trim());
      const formatted = JSON.stringify(parsed, null, 2);
      onValueChange(formatted);
      onParse(formatted);
    } catch { /* ignore */ }
  }, [value, onParse, onValueChange]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(value.trim());
      const minified = JSON.stringify(parsed);
      onValueChange(minified);
      onParse(minified);
    } catch { /* ignore */ }
  }, [value, onParse, onValueChange]);

  const trimWhitespace = useCallback(() => {
    try {
      const parsed = JSON.parse(value.trim());
      const trimmed = JSON.parse(JSON.stringify(parsed, (_, v) =>
        typeof v === "string" ? v.trim() : v
      ));
      const formatted = JSON.stringify(trimmed, null, 2);
      onValueChange(formatted);
      onParse(formatted);
    } catch { /* ignore */ }
  }, [value, onParse, onValueChange]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const hasValue = value.trim().length > 0;

  const toolBtnClass = "flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground hover:text-primary px-2 py-1.5 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-150";

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <div
        className={`relative rounded-xl transition-all duration-200 ${
          isDragging
            ? "border-2 border-dashed border-primary bg-primary/5 glow-border-focus"
            : error
            ? "border-2 border-dashed border-destructive/40"
            : isFocused
            ? "border-2 border-dashed border-primary/40 glow-border-focus"
            : "border-2 border-dashed border-border glow-border hover:border-muted-foreground/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Expand button - always same style regardless of content */}
        {onOpenFullscreen && (
          <button
            onClick={onOpenFullscreen}
            className="absolute top-2 right-2 z-[1] flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60 hover:text-primary bg-muted/40 hover:bg-primary/10 border border-border/50 hover:border-primary/20 backdrop-blur-sm transition-all duration-150"
            title="Open in fullscreen"
          >
            <Expand size={11} />
            <span className="hidden sm:inline">Expand</span>
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste JSON here or drop a .json file…"
          className="w-full min-h-[100px] sm:min-h-[120px] max-h-[300px] bg-transparent px-4 py-3.5 pr-10 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 resize-y focus:outline-none rounded-xl"
          spellCheck={false}
        />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
            <div className="flex items-center gap-2 text-primary">
              <Upload size={18} />
              <span className="text-sm font-medium">Drop JSON file</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {hasValue && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 mt-2 flex-wrap"
          >
            {/* Always visible: Format & Copy */}
            <button onClick={beautify} className={toolBtnClass} title="Beautify / Format JSON">
              <Maximize2 size={11} />
              Format
            </button>
            <button onClick={copyToClipboard} className={toolBtnClass} title="Copy JSON to clipboard">
              {copied ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>

            {/* Desktop: show all buttons */}
            <div className="hidden sm:flex items-center gap-1">
              <button onClick={minify} className={toolBtnClass} title="Minify JSON">
                <Minimize2 size={11} />
                Minify
              </button>
              <button onClick={trimWhitespace} className={toolBtnClass} title="Trim whitespace from string values">
                <Scissors size={11} />
                Trim
              </button>
            </div>

            {/* Mobile: overflow menu */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowMore(!showMore)}
                className={toolBtnClass}
                title="More actions"
              >
                <MoreHorizontal size={13} />
              </button>
              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-lg shadow-lg p-1 z-20"
                  >
                    <button onClick={() => { minify(); setShowMore(false); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-all w-full">
                      <Minimize2 size={11} /> Minify
                    </button>
                    <button onClick={() => { trimWhitespace(); setShowMore(false); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-all w-full">
                      <Scissors size={11} /> Trim
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-2"
          >
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
            {suggestion && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="flex items-start gap-2 mt-1.5 text-xs text-muted-foreground bg-muted/30 rounded-md p-2"
              >
                <Lightbulb size={11} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{suggestion}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
