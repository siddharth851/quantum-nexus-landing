import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass-strong px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/40 via-accent/30 to-secondary/30 glow-primary">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-white/60">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
