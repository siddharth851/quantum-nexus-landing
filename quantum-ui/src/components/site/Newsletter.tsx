import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

export function Newsletter() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl glass-strong p-10 text-center md:p-14"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 opacity-60" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/40 blur-[100px] animate-aurora" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/40 blur-[100px] animate-aurora [animation-delay:-6s]" />

          <div className="relative">
            <div className="mx-auto inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-3xl font-bold md:text-4xl">
              Get exclusive deals before <span className="text-gradient">anyone else</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Join 25,000+ subscribers receiving private flash sales, product drops and luxury
              bundles.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-8 flex max-w-lg flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 rounded-xl glass-strong px-5 py-3.5 text-sm outline-none placeholder:text-white/40 focus:ring-2 focus:ring-primary/60"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-6 py-3.5 text-sm font-semibold glow-primary transition hover:scale-105">
                Subscribe <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-3 text-xs text-white/50">No spam. Unsubscribe anytime.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
