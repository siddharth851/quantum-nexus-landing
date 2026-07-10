import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Award,
  LifeBuoy,
  BadgeCheck,
  Rocket,
  MessageCircle,
} from "lucide-react";

export function WhyChooseUs() {
  return (
    <section id="why" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Why Choose Us
          </p>
          <h2 className="mt-2 text-4xl font-bold md:text-5xl">
            The <span className="text-gradient">premium standard</span> of digital commerce
          </h2>
          <p className="mt-4 text-white/65">
            Every detail engineered around trust, speed and long-term value.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6 md:grid-rows-2 lg:auto-rows-[minmax(180px,auto)]">
          {/* Hero feature — spans wide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-3xl glass-strong p-6 md:col-span-4 md:row-span-2"
          >
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-primary to-accent opacity-30 blur-3xl transition group-hover:opacity-60" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 text-2xl font-bold md:text-3xl">
                  Get access in <span className="text-gradient">minutes</span>, not days
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                  Our verification desk is online round the clock. Confirm your order on WhatsApp
                  and receive your credentials in an average of 3.2 minutes.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { k: "3.2m", v: "Avg delivery" },
                  { k: "99.8%", v: "On-time rate" },
                  { k: "24/7", v: "Live desk" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl glass p-3">
                    <p className="text-lg font-bold text-white">{s.k}</p>
                    <p className="text-[11px] text-white/55">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Secure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="group relative overflow-hidden rounded-3xl glass-strong p-6 md:col-span-2"
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Secure by design</h3>
            <p className="mt-1.5 text-sm text-white/60">
              Encrypted checkout and human-reviewed accounts.
            </p>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl glass-strong p-6 md:col-span-2"
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/20">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Real humans, fast replies</h3>
                <p className="mt-1.5 text-sm text-white/60">
                  Typical response under 5 minutes on WhatsApp.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Small feature row */}
          {[
            {
              icon: Award,
              title: "Trusted Marketplace",
              desc: "10,000+ verified buyers, 4.9★ rating.",
            },
            {
              icon: BadgeCheck,
              title: "Authentic Products",
              desc: "Every listing tested and verified.",
            },
            {
              icon: LifeBuoy,
              title: "Lifetime Support",
              desc: "We help after the sale, not just before.",
            },
            {
              icon: Rocket,
              title: "Plug & Play Setup",
              desc: "Quick-start guides included with every order.",
            },
          ].map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-2xl glass p-5 md:col-span-3 lg:col-span-3"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 text-white ring-1 ring-white/10">
                  <it.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold">{it.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{it.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
