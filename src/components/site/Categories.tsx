import { motion } from "framer-motion";
import {
  Brain, Tv, Palette, GraduationCap, Rocket, Code2, Megaphone, Film,
} from "lucide-react";

const cats = [
  { icon: Brain, name: "AI Tools", count: "1,240 items", from: "from-primary", to: "to-accent" },
  { icon: Tv, name: "Streaming Apps", count: "320 items", from: "from-secondary", to: "to-primary" },
  { icon: Palette, name: "Design Software", count: "640 items", from: "from-accent", to: "to-secondary" },
  { icon: GraduationCap, name: "Learning Platforms", count: "920 items", from: "from-primary", to: "to-secondary" },
  { icon: Rocket, name: "Productivity Apps", count: "510 items", from: "from-secondary", to: "to-accent" },
  { icon: Code2, name: "Developer Tools", count: "780 items", from: "from-accent", to: "to-primary" },
  { icon: Megaphone, name: "Marketing Tools", count: "430 items", from: "from-primary", to: "to-accent" },
  { icon: Film, name: "Video Editing", count: "260 items", from: "from-secondary", to: "to-primary" },
];

export function Categories() {
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
          {cats.map((c, i) => (
            <motion.a
              key={c.name}
              href="#products"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl glass-strong p-6 transition hover:glow-primary"
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.from} ${c.to} opacity-20 blur-2xl transition group-hover:opacity-50`} />
              <div className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.from} ${c.to} transition group-hover:scale-110 group-hover:rotate-3`}>
                <c.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{c.name}</h3>
              <p className="mt-1 text-xs text-white/60">{c.count}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
