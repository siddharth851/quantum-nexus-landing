import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Brain, Tv, Palette, GraduationCap, Rocket, Code2, Megaphone, Film, type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { fetchCategories } from "@/lib/products";

const icons: Record<string, LucideIcon> = {
  Brain, Tv, Palette, GraduationCap, Rocket, Code2, Megaphone, Film,
};

export function Categories() {
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  return (
    <section id="categories" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Browse</p>
          <h2 className="mt-2 text-4xl font-bold md:text-5xl">
            Explore Premium <span className="text-gradient">Categories</span>
          </h2>
          <p className="mt-4 text-white/70">
            Curated collections of the world's best digital products at unbeatable prices.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cats.map((c, i) => {
            const Icon = icons[c.icon ?? "Brain"] ?? Brain;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group relative block overflow-hidden rounded-2xl glass-strong p-6 transition hover:glow-primary"
                >
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.gradient} opacity-20 blur-2xl transition group-hover:opacity-50`} />
                  <div className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.gradient} transition group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-white/60">{c.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
