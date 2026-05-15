import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { useHomepageSection, getText } from "@/lib/homepage-cms";

function useCountdown(target: number) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor((diff % 3.6e6) / 6e4);
      const s = Math.floor((diff % 6e4) / 1000);
      setT({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

export function FlashSale() {
  const section = useHomepageSection("flash_sale");
  if (section && section.enabled === false) return null;

  const p = section?.payload;
  const endsAtRaw = typeof p?.ends_at === "string" ? p.ends_at : "";
  const parsed = endsAtRaw ? Date.parse(endsAtRaw) : NaN;
  const target = Number.isFinite(parsed) && parsed > Date.now()
    ? parsed
    : Date.now() + 1000 * 60 * 60 * 23 + 1000 * 60 * 47;

  const t = useCountdown(target);
  const badge = getText(p, "badge", "FLASH SALE LIVE");
  const title = getText(p, "title", "Up to 80% OFF");
  const subtitle = getText(
    p,
    "subtitle",
    "Premium AI tools, streaming, courses and design apps — at the lowest prices ever offered.",
  );
  const cta = getText(p, "cta", "Shop the Sale");

  const cells = [
    { label: "Hours", v: t.h },
    { label: "Minutes", v: t.m },
    { label: "Seconds", v: t.s },
  ];
  return (
    <section id="flash" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-12"
        >
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/40 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/30 blur-[100px]" />
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-3 py-1 text-xs font-bold text-destructive">
                <Flame className="h-3.5 w-3.5" /> {badge}
              </div>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                <span className="text-gradient">{title}</span>
              </h2>
              <p className="mt-4 text-white/70">{subtitle}</p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-6 py-3 text-sm font-semibold glow-primary transition hover:scale-105">
                <Zap className="h-4 w-4" /> {cta}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {cells.map((c) => (
                <div key={c.label} className="rounded-2xl glass-strong p-4 text-center">
                  <p className="bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-4xl font-black text-transparent md:text-5xl">
                    {String(c.v).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-white/60">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
