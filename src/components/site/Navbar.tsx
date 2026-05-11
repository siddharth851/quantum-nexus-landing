import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, ChevronDown, Menu, X, Sparkles, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#products" },
  { label: "Flash Sale", href: "#flash" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#why" },
];

const categories = [
  "AI Tools", "Streaming Apps", "Design Software", "Learning Platforms",
  "Productivity", "Developer Tools", "Marketing", "Video Editing",
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav
          className={`glass-strong relative flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
            scrolled ? "shadow-[0_8px_40px_-12px_rgba(124,58,237,0.4)]" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Nova<span className="text-gradient">Market</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="relative px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
              >
                <span className="relative z-10">{l.label}</span>
                <span className="absolute inset-0 -z-0 rounded-lg opacity-0 transition group-hover:opacity-100" />
              </a>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white">
                Categories <ChevronDown className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full mt-2 w-72 rounded-2xl glass-strong p-3"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map((c) => (
                        <a
                          key={c}
                          href="#categories"
                          className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                          {c}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10 sm:grid">
              <Search className="h-4 w-4" />
            </button>
            <button className="relative hidden h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10 sm:grid">
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold">
                3
              </span>
            </button>
            <button className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] md:inline-flex">
              <LogIn className="h-4 w-4" /> Login
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-xl glass lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-strong mt-2 rounded-2xl p-4 lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="my-2 h-px bg-white/10" />
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <a key={c} href="#categories" className="rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/10">
                      {c}
                    </a>
                  ))}
                </div>
                <button className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold">
                  <LogIn className="h-4 w-4" /> Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
