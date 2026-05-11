import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Zap, Lock } from "lucide-react";

export type Product = {
  id: number;
  name: string;
  desc: string;
  category: string;
  price: number;
  original: number;
  rating: number;
  badge?: "Trending" | "Best Seller" | "Popular" | "Limited Offer";
  initials: string;
  gradient: string;
};

const badgeStyles: Record<string, string> = {
  "Trending": "from-primary to-accent",
  "Best Seller": "from-secondary to-primary",
  "Popular": "from-accent to-secondary",
  "Limited Offer": "from-warning to-destructive",
};

export function ProductCard({ p }: { p: Product }) {
  const ref = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setLight({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  const discount = Math.round(((p.original - p.price) / p.original) * 100);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setLight((l) => ({ ...l, on: false }))}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl glass-strong transition"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background: light.on
            ? `radial-gradient(400px circle at ${light.x}% ${light.y}%, rgba(168,85,247,0.25), transparent 50%)`
            : undefined,
        }}
      />
      <div className="absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(168,85,247,0.5), 0 0 30px -5px rgba(124,58,237,0.6)" }} />

      <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${p.gradient}`}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-4xl font-bold tracking-tight text-white/95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            {p.initials}
          </span>
        </div>
        {p.badge && (
          <div className={`absolute left-2 top-2 rounded-full bg-gradient-to-r ${badgeStyles[p.badge]} px-2 py-0.5 text-[10px] font-bold text-white shadow-lg`}>
            {p.badge}
          </div>
        )}
        <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-success backdrop-blur">
          -{discount}%
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60">{p.category}</span>
          <div className="flex items-center gap-0.5 text-[10px] text-white/70">
            <Star className="h-3 w-3 fill-warning text-warning" /> {p.rating}
          </div>
        </div>
        <h3 className="mt-2 line-clamp-1 text-sm font-semibold">{p.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-white/55">{p.desc}</p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-white">${p.price}</span>
          <span className="text-[11px] text-white/40 line-through">${p.original}</span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-primary to-accent px-2 py-1.5 text-[11px] font-semibold text-white transition hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Zap className="h-3 w-3" /> Access
          </button>
          <button className="inline-flex items-center justify-center gap-1 rounded-lg glass px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/10">
            <ShoppingCart className="h-3 w-3" /> Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}
