import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Search, X, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/lib/products";

const popular = ["ChatGPT", "Netflix", "Adobe", "Figma", "Spotify", "Notion"];

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data, isFetching } = useQuery({
    queryKey: ["search", term],
    queryFn: () => searchProducts(term, 8),
    enabled: term.trim().length > 0,
    staleTime: 30_000,
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="fixed left-1/2 top-20 z-[71] w-[92vw] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl glass-strong glow-primary"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search className="h-5 w-5 text-white/60" />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search AI tools, apps, courses..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-white/40"
              />
              {isFetching && <Loader2 className="h-4 w-4 animate-spin text-secondary" />}
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg glass hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {!term.trim() ? (
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Trending searches</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {popular.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTerm(t)}
                        className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        <Sparkles className="h-3 w-3 text-secondary" /> {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : data && data.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-white/60">No products match "{term}"</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {data?.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/product/$slug"
                        params={{ slug: p.slug }}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/10"
                      >
                        <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${p.gradient} text-xs font-bold`}>
                          {p.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="truncate text-xs text-white/55">{p.description}</p>
                        </div>
                        <span className="text-sm font-bold text-secondary">${Number(p.discount_price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
