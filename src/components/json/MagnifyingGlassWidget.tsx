import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Braces, Minimize2, TreePine, Search, Pin, GitCompare, Indent, Scissors, Trophy
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/* ── Feature items shown as scattered snippets ── */
interface FeatureItem {
  x: number;
  y: number;
  icon: React.ElementType;
  label: string;
  snippet: string;
}

const features: FeatureItem[] = [
  { x: 6, y: 8, icon: Braces, label: "Format", snippet: `"indent": 2` },
  { x: 58, y: 6, icon: Minimize2, label: "Minify", snippet: `"minify": true` },
  { x: 30, y: 30, icon: TreePine, label: "Tree View", snippet: `"tree": "expand"` },
  { x: 70, y: 35, icon: Search, label: "Search", snippet: `"search": "⌘F"` },
  { x: 12, y: 55, icon: Pin, label: "Pin Keys", snippet: `"pins": ["id"]` },
  { x: 50, y: 60, icon: GitCompare, label: "Diff", snippet: `"diff": "side-by-side"` },
  { x: 78, y: 65, icon: Indent, label: "Collapse", snippet: `"collapse": 3` },
  { x: 35, y: 82, icon: Scissors, label: "Trim", snippet: `"trim": "whitespace"` },
];

/* ── Bug definitions ── */
interface Bug {
  id: number;
  x: number;
  y: number;
  label: string;
  squashed: boolean;
}

const initialBugs: Bug[] = [
  { id: 0, x: 22, y: 20, label: "trailing comma", squashed: false },
  { id: 1, x: 68, y: 22, label: "missing quote", squashed: false },
  { id: 2, x: 45, y: 48, label: "duplicate key", squashed: false },
  { id: 3, x: 80, y: 52, label: "invalid type", squashed: false },
  { id: 4, x: 25, y: 72, label: "bad escape", squashed: false },
];

/* ── Subtle bug SVG ── */
function BugIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="14" rx="5" ry="6" stroke="hsl(0 70% 55% / 0.7)" />
      <circle cx="12" cy="7" r="2.5" stroke="hsl(0 70% 55% / 0.6)" />
      <path d="M10 5 L7 2" stroke="hsl(0 70% 55% / 0.5)" />
      <path d="M14 5 L17 2" stroke="hsl(0 70% 55% / 0.5)" />
      <path d="M7 12 L4 10" stroke="hsl(0 70% 55% / 0.4)" />
      <path d="M7 15 L4 16" stroke="hsl(0 70% 55% / 0.4)" />
      <path d="M17 12 L20 10" stroke="hsl(0 70% 55% / 0.4)" />
      <path d="M17 15 L20 16" stroke="hsl(0 70% 55% / 0.4)" />
    </svg>
  );
}

/* ── Squash particles ── */
function SquashParticles({ x, y }: { x: number; y: number }) {
  const particles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const dist = 12 + Math.random() * 8;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
  });

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, scale: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

/* ── Main widget ── */
export function MagnifyingGlassWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState({ x: 0, y: 0, active: false });
  const [bugs, setBugs] = useState<Bug[]>(initialBugs);
  const [squashParticles, setSquashParticlesState] = useState<{ id: number; x: number; y: number }[]>([]);
  const [allSquashed, setAllSquashed] = useState(false);
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const particleIdRef = useRef(0);
  const { championUnlocked, unlockChampion, setTheme } = useTheme();

  const LENS_SIZE = 170;
  const ZOOM = 2.6;
  const remainingBugs = bugs.filter((b) => !b.squashed).length;

  useEffect(() => {
    if (remainingBugs === 0 && !allSquashed) {
      setAllSquashed(true);
      if (!championUnlocked) {
        unlockChampion();
        setTimeout(() => setShowUnlockPopup(true), 500);
      }
    }
  }, [remainingBugs, allSquashed, championUnlocked, unlockChampion]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLens({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setLens((prev) => ({ ...prev, active: false }));
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!lens.active || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;

    setBugs((prev) => {
      const next = [...prev];
      for (const bug of next) {
        if (bug.squashed) continue;
        const dx = bug.x - pctX;
        const dy = bug.y - pctY;
        if (Math.sqrt(dx * dx + dy * dy) < 7) {
          bug.squashed = true;
          const pid = particleIdRef.current++;
          setSquashParticlesState((sp) => [...sp, { id: pid, x: clickX, y: clickY }]);
          setTimeout(() => setSquashParticlesState((sp) => sp.filter((p) => p.id !== pid)), 600);
          return next;
        }
      }
      return prev;
    });
  }, [lens.active]);

  const handleReset = useCallback(() => {
    setBugs(initialBugs.map((b) => ({ ...b, squashed: false })));
    setAllSquashed(false);
  }, []);

  /* ── Content layer ── */
  const ContentLayer = ({ showBugs = false }: { showBugs?: boolean }) => (
    <div className="relative w-full h-full">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <div
            key={i}
            className="absolute flex items-center gap-[3px] select-none"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            <Icon size={7} className="text-primary/70 shrink-0" strokeWidth={2} />
            <span className="font-semibold text-[5.5px] text-foreground/80 whitespace-nowrap">{f.label}</span>
            <span className="font-mono text-[4.5px] text-muted-foreground/60 whitespace-nowrap ml-[2px]">{f.snippet}</span>
          </div>
        );
      })}

      {/* Bugs - only visible through lens */}
      {showBugs && bugs.map((bug) => (
        <AnimatePresence key={bug.id}>
          {!bug.squashed && (
            <motion.div
              className="absolute pointer-events-none flex flex-col items-center"
              style={{ left: `${bug.x}%`, top: `${bug.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.15 }}
            >
              <BugIcon size={14} />
              <span className="text-[4px] font-mono text-destructive/70 whitespace-nowrap mt-0.5">
                {bug.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="relative overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm select-none h-52"
        style={{ cursor: lens.active ? "none" : "default" }}
      >
        {/* Base layer */}
        <ContentLayer showBugs={false} />

        {/* Hover hint overlay */}
        <AnimatePresence>
          {!lens.active && !allSquashed && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs text-muted-foreground/70 font-medium flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Hover to find bugs
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All squashed celebration */}
        <AnimatePresence>
          {allSquashed && !lens.active && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.span
                className="text-sm font-semibold text-primary"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                All bugs squashed ✨
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lens */}
        {lens.active && (
          <div
            className="absolute pointer-events-none rounded-full border-2 border-primary/25 shadow-[0_0_20px_hsl(var(--primary)/0.12)]"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lens.x - LENS_SIZE / 2,
              top: lens.y - LENS_SIZE / 2,
              overflow: "hidden",
            }}
          >
            <div
              className="absolute"
              style={{
                transform: `scale(${ZOOM})`,
                transformOrigin: "top left",
                left: -(lens.x * ZOOM - LENS_SIZE / 2),
                top: -(lens.y * ZOOM - LENS_SIZE / 2),
                width: containerRef.current?.offsetWidth || "100%",
                height: containerRef.current?.offsetHeight || "100%",
              }}
            >
              <ContentLayer showBugs={true} />
            </div>
            {/* Glass sheen */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.06) 0%, transparent 50%)" }}
            />
            {/* Red proximity tint */}
            {bugs.some(
              (b) =>
                !b.squashed &&
                containerRef.current &&
                Math.abs(b.x - (lens.x / containerRef.current.offsetWidth) * 100) < 12 &&
                Math.abs(b.y - (lens.y / containerRef.current.offsetHeight) * 100) < 12
            ) && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(0 70% 50% / 0.05) 0%, transparent 70%)" }}
              />
            )}
          </div>
        )}

        {/* Custom cursor */}
        {lens.active && (
          <svg
            className="absolute pointer-events-none text-primary drop-shadow-md"
            style={{ left: lens.x - 9, top: lens.y - 9, width: 18, height: 18 }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        )}

        {/* Squash particles */}
        {squashParticles.map((sp) => (
          <SquashParticles key={sp.id} x={sp.x} y={sp.y} />
        ))}
      </div>

      {/* Status bar below widget */}
      <div className="flex flex-col items-center mt-3 gap-1">
        <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wide">
          {allSquashed
            ? "All bugs squashed ✨"
            : lens.active
            ? `${remainingBugs} bug${remainingBugs !== 1 ? "s" : ""} remaining — click to squash`
            : "Hover to find bugs"}
        </span>
        {allSquashed && (
          <motion.button
            onClick={handleReset}
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Play again
          </motion.button>
        )}
      </div>

      {/* Champion theme unlock popup */}
      <AnimatePresence>
        {showUnlockPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUnlockPopup(false)}
          >
            <motion.div
              className="relative bg-card border border-border rounded-2xl p-8 max-w-sm mx-4 shadow-2xl text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", damping: 10 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: "linear-gradient(135deg, hsl(43 85% 55%), hsl(25 70% 40%))" }}
              >
                <Trophy size={28} className="text-background" />
              </motion.div>
              <h3 className="text-lg font-bold text-foreground mb-1">Theme Unlocked!</h3>
              <p className="text-sm text-muted-foreground mb-5">
                You've squashed all the bugs and earned the <span className="font-semibold" style={{ color: "hsl(43 85% 55%)" }}>Champion</span> theme — a golden reward for your sharp eyes.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowUnlockPopup(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  Maybe later
                </button>
                <button
                  onClick={() => { setTheme("champion"); setShowUnlockPopup(false); }}
                  className="px-4 py-2 text-xs rounded-lg font-semibold text-primary-foreground transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, hsl(43 85% 55%), hsl(0 60% 45%))" }}
                >
                  Apply Champion 🏆
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
