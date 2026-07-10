import { Zap, ShieldCheck, MessageCircle, Award, Clock } from "lucide-react";

const items = [
  { icon: Zap, title: "Instant Delivery", desc: "Most orders activated within minutes." },
  { icon: ShieldCheck, title: "Human Verified", desc: "Every order reviewed by a real person." },
  { icon: MessageCircle, title: "5-min Support", desc: "Reach us on WhatsApp anytime." },
  { icon: Award, title: "10,000+ Buyers", desc: "Rated 4.9★ across the marketplace." },
  { icon: Clock, title: "Lifetime Help", desc: "We stay with you long after the sale." },
];

export function TrustStrip() {
  return (
    <section className="px-4 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Why buyers trust us
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            A safer way to buy digital products
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it) => (
            <div
              key={it.title}
              className="group relative overflow-hidden rounded-2xl glass p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/25 to-cyan-500/20 text-emerald-300 ring-1 ring-emerald-400/20">
                <it.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold">{it.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
