import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, Star, X, PackageX } from "lucide-react";
import { fetchCategories, fetchProducts, type Product, type ProductFilters } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "./ProductSkeleton";
import { QuickViewModal } from "./QuickViewModal";
import { EmptyState } from "./EmptyState";

type Props = { initialCategory?: string; title?: string; subtitle?: string };

export function ProductsExplorer({
  initialCategory = "all",
  title = "All Products",
  subtitle,
}: Props) {
  const [filters, setFilters] = useState<ProductFilters>({
    category: initialCategory,
    sort: "popular",
  });
  const [maxPrice, setMaxPrice] = useState(200);
  const [filterOpen, setFilterOpen] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);

  const effective = useMemo<ProductFilters>(() => ({ ...filters, maxPrice }), [filters, maxPrice]);

  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
  const { data, isLoading } = useQuery({
    queryKey: ["products", effective],
    queryFn: () => fetchProducts(effective),
    staleTime: 30_000,
  });

  const update = (patch: Partial<ProductFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const FilterPanel = (
    <aside className="space-y-5 rounded-2xl glass-strong p-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
          Category
        </p>
        <div className="flex flex-col gap-1">
          {[{ slug: "all", name: "All" }, ...cats.map((c) => ({ slug: c.slug, name: c.name }))].map(
            (c) => (
              <button
                key={c.slug}
                onClick={() => update({ category: c.slug })}
                className={`rounded-lg px-3 py-1.5 text-left text-sm transition ${
                  filters.category === c.slug
                    ? "bg-gradient-to-r from-primary/30 to-accent/20 text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                {c.name}
              </button>
            ),
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
          Max Price: ${maxPrice}
        </p>
        <input
          type="range"
          min={5}
          max={200}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
          Min Rating
        </p>
        <div className="flex gap-1">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => update({ minRating: r || undefined })}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${
                (filters.minRating ?? 0) === r
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "glass text-white/70"
              }`}
            >
              <Star className="h-3 w-3" /> {r || "Any"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
          Quick Filters
        </p>
        {(["trending", "bestSeller", "isNew"] as const).map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={!!filters[k]}
              onChange={(e) =>
                update({ [k]: e.target.checked || undefined } as Partial<ProductFilters>)
              }
              className="h-4 w-4 accent-[var(--primary)]"
            />
            {k === "isNew" ? "New" : k === "bestSeller" ? "Best Sellers" : "Trending"}
          </label>
        ))}
      </div>
    </aside>
  );

  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-white/60">{subtitle}</p>}
          </div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl glass-strong px-4 py-2 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as ProductFilters["sort"] })}
              className="flex-1 rounded-xl glass-strong px-3 py-2 text-sm outline-none md:flex-none"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="hidden lg:block">{FilterPanel}</div>
          <div>
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : !data || data.length === 0 ? (
              <EmptyState
                icon={PackageX}
                title="No products found"
                description="Try adjusting your filters or search terms."
              />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
              >
                {data.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 12) * 0.03 }}
                  >
                    <ProductCard p={p} onQuickView={setQuick} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Filters</p>
              <button
                onClick={() => setFilterOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg glass"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {FilterPanel}
          </motion.div>
        </div>
      )}

      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
