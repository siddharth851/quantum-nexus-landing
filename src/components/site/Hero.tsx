import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Shield, Star, Zap, Sparkles } from "lucide-react";
import { Particles } from "./Particles";

const trust = [
  { icon: Shield, label: "Secure Checkout" },
  { icon: Zap, label: "Instant Delivery" },
  { icon: Star, label: "4.9★ Rated" },
];

export function Hero() {
  return (
    <section id="home" className="relative pt-10 pb-24">
      <Particles count={36} />
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              The future of digital commerce is here
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Premium <span className="text-gradient">AI Tools</span> &<br />
              Digital Products <span className="text-gradient">Marketplace</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Unlock 10,000+ premium AI tools, subscriptions, courses and digital products at
              the lowest prices. Cinematic experience. Instant access. Lifetime value.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-6 py-3.5 text-sm font-semibold text-white glow-primary transition hover:scale-[1.03]">
                Explore Marketplace
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl glass-strong px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <PlayCircle className="h-4 w-4" /> Watch Demo
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              {trust.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-sm text-white/70">
                  <div className="grid h-8 w-8 place-items-center rounded-lg glass">
                    <t.icon className="h-4 w-4 text-secondary" />
                  </div>
                  {t.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/40 via-accent/30 to-secondary/30 blur-3xl" />
            <div className="relative rounded-3xl glass-strong p-4 animate-float glow-accent">
              <div className="flex items-center gap-1.5 px-2 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 text-xs text-white/50">novamarket.app/dashboard</span>
              </div>
              <div className="grid gap-3 rounded-2xl bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50">Total Sales</p>
                    <p className="text-2xl font-bold">$284,512</p>
                  </div>
                  <div className="rounded-lg bg-success/20 px-2 py-1 text-xs font-semibold text-success">
                    +24.8%
                  </div>
                </div>
                <div className="grid grid-cols-7 items-end gap-2 h-28">
                  {[40, 65, 50, 80, 60, 95, 75].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.07 }}
                      className="rounded-md bg-gradient-to-t from-primary via-accent to-secondary"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["AI Tools", "Courses", "Apps"].map((c, i) => (
                    <div key={c} className="rounded-xl glass p-3">
                      <p className="text-[10px] text-white/50">{c}</p>
                      <p className="mt-1 text-sm font-bold">{[1240, 980, 612][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -left-6 bottom-10 hidden rounded-2xl glass-strong p-3 sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Instant Delivery</p>
                  <p className="text-sm font-semibold">3.2s avg</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -right-4 top-10 hidden rounded-2xl glass-strong p-3 sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary to-secondary" />
                  ))}
                </div>
                <div>
                  <p className="text-xs text-white/60">Live buyers</p>
                  <p className="text-sm font-semibold">1,284 online</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
