import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gradient">{title}</span>
        </h1>
        {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  delay = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-strong group relative overflow-hidden rounded-2xl p-5"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 blur-2xl transition group-hover:scale-110" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
        </div>
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/40 to-accent/30">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass-strong rounded-2xl p-5 ${className}`}>{children}</div>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-white/60">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/40">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-primary/50 focus:bg-white/10 focus:ring-2 focus:ring-primary/30";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-white glow-primary transition hover:opacity-95 disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl glass border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20";

export function EmptyRow({ message }: { message: string }) {
  return (
    <div className="rounded-xl glass p-8 text-center text-sm text-white/50">{message}</div>
  );
}
