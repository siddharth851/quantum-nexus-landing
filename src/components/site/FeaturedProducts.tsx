import { useState } from "react";
import { motion } from "framer-motion";
import { products } from "./products-data";
import { ProductCard } from "./ProductCard";

const filters = ["All", "AI Tools", "Streaming Apps", "Design Software", "Learning Platforms", "Productivity", "Developer Tools", "Marketing", "Video Editing"];

export function FeaturedProducts() {
  const [active, setActive] = useState("All");
  const list = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <section id="products" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Featured</p>
            <h2 className="mt-2 text-4xl font-bold md:text-5xl">
              Premium <span className="text-gradient">Digital Products</span>
            </h2>
            <p className="mt-3 max-w-xl text-white/70">
              Hand-picked top sellers across every category, with instant delivery and lifetime support.
            </p>
          </div>
        </div>

        <div className="scrollbar-hide mt-8 flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                active === f
                  ? "bg-gradient-to-r from-primary to-accent text-white glow-primary"
                  : "glass text-white/70 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        >
          {list.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: (i % 12) * 0.03 }}
            >
              <ProductCard p={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
