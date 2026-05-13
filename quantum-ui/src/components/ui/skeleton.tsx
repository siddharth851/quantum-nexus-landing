import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/5",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "after:absolute after:inset-0 after:animate-pulse after:bg-white/[0.03]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
