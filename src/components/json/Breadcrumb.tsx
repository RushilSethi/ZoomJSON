import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  path: string[];
  onNavigate: (index: number) => void;
  onReset: () => void;
}

export function Breadcrumb({ path, onNavigate, onReset }: BreadcrumbProps) {
  if (path.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1 py-0.5 text-xs overflow-x-auto"
    >
      <button
        onClick={onReset}
        className="text-muted-foreground hover:text-primary transition-colors duration-150 shrink-0"
      >
        root
      </button>
      {path.map((segment, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          <ChevronRight size={10} className="text-muted-foreground/40" />
          <button
            onClick={() => onNavigate(i)}
            className={`transition-colors duration-150 ${
              i === path.length - 1
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {segment}
          </button>
        </span>
      ))}
    </motion.nav>
  );
}
