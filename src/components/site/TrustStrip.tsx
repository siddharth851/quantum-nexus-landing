import { Zap, ShieldCheck, MessageCircle, Award, Clock } from "lucide-react";

const items = [
  { icon: Zap, title: "Instant Delivery", desc: "Most orders activated within minutes after confirmation." },
  { icon: ShieldCheck, title: "Manual Verification", desc: "Each order is reviewed by a human for safety." },
  { icon: MessageCircle, title: "Fast Support", desc: "Reach us anytime on WhatsApp — usually replies in 5 min." },
  { icon: Award, title: "Trusted by 10k+", desc: "4.9★ rated by happy customers worldwide." },
  { icon: Clock, title: "Lifetime Help", desc: "We stay with you after the sale, not just before." },
];

export function TrustStrip() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl glass p-4">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 text-emerald-300">
              <it.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">{it.title}</p>
            <p className="mt-1 text-xs text-white/60">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
