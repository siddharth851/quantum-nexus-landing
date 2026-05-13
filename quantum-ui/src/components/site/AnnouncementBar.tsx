import { Sparkles, Zap, Tag, Gift } from "lucide-react";

const items = [
  { icon: Zap, text: "Flash Sale — Up to 80% OFF on AI Tools" },
  { icon: Sparkles, text: "New: GPT-5 Pro, Midjourney v7, Claude Opus bundles" },
  { icon: Tag, text: "Limited time: Lifetime subscriptions from $9" },
  { icon: Gift, text: "Free premium course with every order over $49" },
];

export function AnnouncementBar() {
  const loop = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] animate-shimmer bg-[length:1000px_100%]" />
      <div className="flex animate-marquee whitespace-nowrap py-2 text-sm">
        {loop.map((it, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-2 text-white/90">
            <it.icon className="h-4 w-4 text-secondary" />
            <span className="font-medium tracking-wide">{it.text}</span>
            <span className="mx-2 text-white/30">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
