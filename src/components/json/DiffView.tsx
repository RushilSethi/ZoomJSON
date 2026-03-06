import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeftRight } from "lucide-react";
import { parseJSON } from "@/utils/parseJSON";
import { diffJSON, type DiffEntry } from "@/utils/jsonDiff";
import { pathToString } from "@/utils/getPathValue";

export function DiffView() {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [diffs, setDiffs] = useState<DiffEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const computeDiff = useCallback(() => {
    const leftResult = parseJSON(leftInput);
    const rightResult = parseJSON(rightInput);
    if (leftResult.error) { setError("Left: " + leftResult.error); setDiffs([]); return; }
    if (rightResult.error) { setError("Right: " + rightResult.error); setDiffs([]); return; }
    if (!leftResult.data || !rightResult.data) { setError("Both sides need valid JSON"); setDiffs([]); return; }
    setError(null);
    setDiffs(diffJSON(leftResult.data, rightResult.data));
  }, [leftInput, rightInput]);

  const handleInputChange = useCallback((side: "left" | "right", value: string) => {
    if (side === "left") setLeftInput(value);
    else setRightInput(value);
  }, []);

  // Auto-diff when both sides have content
  const handleBlur = useCallback(() => {
    if (leftInput.trim() && rightInput.trim()) computeDiff();
  }, [leftInput, rightInput, computeDiff]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="px-6 pb-8 space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Original</label>
          <textarea
            value={leftInput}
            onChange={(e) => handleInputChange("left", e.target.value)}
            onBlur={handleBlur}
            placeholder="Paste original JSON…"
            className="w-full min-h-[100px] max-h-[200px] bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 resize-y focus:outline-none focus:border-primary/40"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Modified</label>
          <textarea
            value={rightInput}
            onChange={(e) => handleInputChange("right", e.target.value)}
            onBlur={handleBlur}
            placeholder="Paste modified JSON…"
            className="w-full min-h-[100px] max-h-[200px] bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 resize-y focus:outline-none focus:border-primary/40"
            spellCheck={false}
          />
        </div>
      </div>

      <button
        onClick={computeDiff}
        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors duration-100"
      >
        <ArrowLeftRight size={13} />
        Compare
      </button>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {diffs.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {diffs.length} {diffs.length === 1 ? "change" : "changes"} found
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border/30">
            {diffs.map((diff, i) => (
              <div key={i} className="px-3 py-2 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    diff.type === "added" ? "bg-type-boolean-true" :
                    diff.type === "removed" ? "bg-destructive" :
                    "bg-type-date"
                  }`} />
                  <span className="font-mono text-muted-foreground">{pathToString(diff.path)}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    diff.type === "added" ? "text-type-boolean-true" :
                    diff.type === "removed" ? "text-destructive" :
                    "text-type-date"
                  }`}>
                    {diff.type}
                  </span>
                </div>
                <div className="font-mono pl-3.5">
                  {diff.type === "changed" && (
                    <>
                      <div className="text-destructive/70 line-through">{JSON.stringify(diff.oldValue)}</div>
                      <div className="text-type-boolean-true">{JSON.stringify(diff.newValue)}</div>
                    </>
                  )}
                  {diff.type === "added" && (
                    <div className="text-type-boolean-true">{JSON.stringify(diff.newValue)}</div>
                  )}
                  {diff.type === "removed" && (
                    <div className="text-destructive/70 line-through">{JSON.stringify(diff.oldValue)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {diffs.length === 0 && leftInput.trim() && rightInput.trim() && !error && (
        <div className="text-center text-xs text-muted-foreground py-6">
          No differences found — JSONs are identical
        </div>
      )}
    </motion.div>
  );
}
