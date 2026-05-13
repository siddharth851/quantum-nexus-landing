import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "How fast will I receive my product?",
    a: "Most products are delivered instantly to your email and dashboard within seconds of payment. Custom bundles may take up to 5 minutes.",
  },
  {
    q: "Are the subscriptions and tools authentic?",
    a: "Yes. Every product on NovaMarket is verified, tested and sourced from authorized channels. We offer a 100% authenticity guarantee.",
  },
  {
    q: "Do you offer refunds?",
    a: "If a product doesn't activate or work as described, we'll replace it or issue a full refund within 24 hours — no questions asked.",
  },
  {
    q: "Can I use these on multiple devices?",
    a: "It depends on the product. Each listing clearly states the supported number of devices and any limitations.",
  },
  {
    q: "How does the support work?",
    a: "We offer 24/7 live support through chat, email, WhatsApp and Telegram. Average response time is under 2 minutes.",
  },
  {
    q: "Do you offer team or business pricing?",
    a: "Yes, contact our sales team for custom team licenses, volume discounts and white-glove onboarding.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">FAQ</p>
          <h2 className="mt-2 text-4xl font-bold md:text-5xl">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl glass-strong transition ${isOpen ? "glow-primary" : ""}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold">{f.q}</span>
                  <Plus
                    className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-45 text-secondary" : "text-white/50"}`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-white/70">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
