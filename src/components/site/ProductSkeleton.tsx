export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl glass-strong">
      <div className="relative aspect-[16/10] bg-white/5">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="space-y-2 p-3">
        <div className="h-2 w-1/3 rounded bg-white/10" />
        <div className="h-3 w-2/3 rounded bg-white/10" />
        <div className="h-2 w-full rounded bg-white/5" />
        <div className="h-2 w-4/5 rounded bg-white/5" />
        <div className="grid grid-cols-2 gap-1.5 pt-2">
          <div className="h-6 rounded bg-white/10" />
          <div className="h-6 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
