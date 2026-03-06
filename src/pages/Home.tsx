import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Braces, ArrowRight } from "lucide-react";
import { MagnifyingGlassWidget } from "@/components/json/MagnifyingGlassWidget";
import { ThemeSwitcher } from "@/components/json/ThemeSwitcher";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background accent blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-ring/5 blur-3xl pointer-events-none" />

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      {/* Theme switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8 tracking-wide"
          >
            <Braces size={12} />
            Developer Tool
          </motion.div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Zoom<span className="text-primary">JSON</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-md mx-auto">
            A modern JSON explorer, formatter, and diff tool.
            <br className="hidden sm:block" />
            Paste, explore, compare — all in one place.
          </p>
          <Link
            to="/tool"
            className="group inline-flex items-center gap-2.5 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold text-sm shadow-[0_4px_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_6px_30px_hsl(var(--primary)/0.45)] hover:scale-[1.02] transition-all duration-200"
          >
            Open Tool
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Magnifying Glass Widget */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-16 w-full max-w-3xl"
        >
          <MagnifyingGlassWidget />
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground/50 relative z-10">
        Built for developers who work with JSON every day.
      </footer>
    </div>
  );
}
