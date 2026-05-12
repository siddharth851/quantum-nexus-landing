import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { fetchProducts, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "./ProductSkeleton";
import { QuickViewModal } from "./QuickViewModal";

const filters = [
  { label: "All", value: "all" },
  { label: "AI Tools", value: "ai-tools" },
  { label: "Streaming", value: "streaming-apps" },
  { label: "Design", value: "design-software" },
  { label: "Learning", value: "learning-platforms" },
  { label: "Productivity", value: "productivity" },
  { label: "Developer", value: "developer-tools" },
  { label: "Marketing", value: "marketing" },
  { label: "Video", value: "video-editing" },
];

export function FeaturedProducts() {
  const [active, setActive] = useState("all");
  const [quick, setQuick] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", "featured", active],
    queryFn: () => fetchProducts({ category: active, limit: 24 }),
    staleTime: 60_000,
  });

  return (
    <section id="products" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
              Featured
            </p>
            <h2 className="mt-2 text-4xl font-bold md:text-5xl">
              Premium <span className="text-gradient">Digital Products</span>
            </h2>
            <p className="mt-3 max-w-xl text-white/70">
              Hand-picked top sellers across every category, with instant delivery and lifetime
              support.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl glass-strong px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="scrollbar-hide mt-8 flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                active === f.value
                  ? "bg-gradient-to-r from-primary to-accent text-white glow-primary"
                  : "glass text-white/70 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            >
              {data?.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.35, delay: (i % 12) * 0.03 }}
                >
                  <ProductCard p={p} onQuickView={setQuick} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
