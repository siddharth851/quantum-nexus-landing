import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, ShoppingBag, Star, Headphones } from "lucide-react";

const stats = [
  { icon: Users, value: 10000, suffix: "+", label: "Happy Customers" },
  { icon: ShoppingBag, value: 50000, suffix: "+", label: "Orders Delivered" },
  { icon: Star, value: 4.9, suffix: "★", label: "Average Rating", decimals: 1 },
  { icon: Headphones, value: 24, suffix: "/7", label: "Premium Support" },
];

function Counter({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return (
    <span ref={ref}>
      {decimals ? n.toFixed(decimals) : Math.floor(n).toLocaleString()}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl glass-strong p-6 transition hover:scale-[1.03] hover:glow-primary"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/30 blur-2xl transition group-hover:bg-accent/40" />
              <s.icon className="h-7 w-7 text-secondary" />
              <p className="mt-4 text-3xl font-bold md:text-4xl">
                <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-white/60">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
