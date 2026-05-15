import { Sparkles, Zap, Tag, Gift, type LucideIcon } from "lucide-react";
import { useHomepageSection } from "@/lib/homepage-cms";

const defaults: { icon: LucideIcon; text: string }[] = [
  { icon: Zap, text: "Flash Sale — Up to 80% OFF on AI Tools" },
  { icon: Sparkles, text: "New: GPT-5 Pro, Midjourney v7, Claude Opus bundles" },
  { icon: Tag, text: "Limited time: Lifetime subscriptions from $9" },
  { icon: Gift, text: "Free premium course with every order over $49" },
];

export function AnnouncementBar() {
  const section = useHomepageSection("announcement");
  if (section && section.enabled === false) return null;

  const payload = section?.payload ?? {};
  const customText = typeof payload.text === "string" ? payload.text.trim() : "";
  const customItems = Array.isArray(payload.items)
    ? (payload.items as unknown[]).filter((x): x is string => typeof x === "string" && x.length > 0)
    : [];

  const items =
    customItems.length > 0
      ? customItems.map((t, i) => ({ icon: defaults[i % defaults.length].icon, text: t }))
      : customText
        ? [{ icon: Sparkles, text: customText }]
        : defaults;

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
