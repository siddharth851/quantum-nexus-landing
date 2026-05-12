import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AuroraBackground } from "./AuroraBackground";
import { Particles } from "./Particles";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <Particles />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Nova<span className="text-gradient">Market</span>
            </span>
          </Link>
          <div className="glass-strong rounded-3xl p-8 shadow-[0_20px_80px_-20px_rgba(124,58,237,0.45)]">
            <div className="text-center">
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            </div>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-white/60">{footer}</div>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
