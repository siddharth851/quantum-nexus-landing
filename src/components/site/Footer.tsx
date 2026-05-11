import { Sparkles, Twitter, Instagram, Youtube, Github, Send, MessageCircle } from "lucide-react";

const cols = [
  { title: "Marketplace", links: ["AI Tools", "Streaming Apps", "Design Software", "Developer Tools", "All Categories"] },
  { title: "Company", links: ["About Us", "Careers", "Press", "Affiliates", "Contact"] },
  { title: "Support", links: ["Help Center", "Order Tracking", "Refund Policy", "Live Chat", "WhatsApp"] },
];

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/10 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">
                Nova<span className="text-gradient">Market</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              The world's most premium marketplace for AI tools, subscriptions, courses and digital products.
            </p>
            <div className="mt-6 flex gap-2">
              {[Twitter, Instagram, Youtube, Github, Send, MessageCircle].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10 hover:glow-primary"
                  aria-label="social"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">{c.title}</h4>
              <ul className="mt-4 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/60 transition hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Newsletter</h4>
            <p className="mt-4 text-xs text-white/60">Weekly drops, straight to your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex">
              <input
                placeholder="Email"
                className="w-full rounded-l-lg glass px-3 py-2 text-xs outline-none placeholder:text-white/40"
              />
              <button className="rounded-r-lg bg-gradient-to-r from-primary to-accent px-3 text-xs font-semibold">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} NovaMarket. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-white/50">
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
