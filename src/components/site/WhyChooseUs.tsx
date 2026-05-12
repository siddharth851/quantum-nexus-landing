import { motion } from "framer-motion";
import { Zap, ShieldCheck, Award, LifeBuoy, BadgeCheck, Rocket } from "lucide-react";

const items = [
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Receive your access keys within seconds of purchase.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    desc: "Encrypted checkout and protected account credentials.",
  },
  {
    icon: Award,
    title: "Trusted Marketplace",
    desc: "10,000+ verified buyers and 4.9★ average rating.",
  },
  {
    icon: LifeBuoy,
    title: "Premium Support",
    desc: "24/7 live support across chat, email and WhatsApp.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Products",
    desc: "Every product is tested and 100% authentic.",
  },
  { icon: Rocket, title: "Fast Activation", desc: "Plug-and-play setup with quick start guides." },
];

export function WhyChooseUs() {
  return (
    <section id="why" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Why Us</p>
          <h2 className="mt-2 text-4xl font-bold md:text-5xl">
            The <span className="text-gradient">premium standard</span> of digital commerce
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl glass-strong p-6 transition hover:glow-accent"
            >
              <div className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-2xl transition group-hover:opacity-50" />
              <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
                <it.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-white/65">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
