import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, ChevronDown, Menu, X, Sparkles, LogIn, Heart, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/hooks/use-auth";
import { SearchModal } from "./SearchModal";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", to: "/" as const },
  { label: "Products", to: "/products" as const },
  { label: "Wishlist", to: "/wishlist" as const },
];

const categories = [
  { name: "AI Tools", slug: "ai-tools" },
  { name: "Streaming Apps", slug: "streaming-apps" },
  { name: "Design Software", slug: "design-software" },
  { name: "Learning", slug: "learning-platforms" },
  { name: "Productivity", slug: "productivity" },
  { name: "Developer Tools", slug: "developer-tools" },
  { name: "Marketing", slug: "marketing" },
  { name: "Video Editing", slug: "video-editing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <div className="mx-auto max-w-7xl px-4">
          <nav className={`glass-strong relative flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${scrolled ? "shadow-[0_8px_40px_-12px_rgba(124,58,237,0.4)]" : ""}`}>
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Nova<span className="text-gradient">Market</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) => (
                <Link key={l.label} to={l.to} className="px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white" activeProps={{ className: "text-white" }}>
                  {l.label}
                </Link>
              ))}
              <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
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
                          <Link
                            key={c.slug}
                            to="/category/$slug"
                            params={{ slug: c.slug }}
                            className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearch(true)} className="hidden h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10 sm:grid">
                <Search className="h-4 w-4" />
              </button>
              <Link to="/wishlist" className="relative hidden h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10 sm:grid">
                <Heart className="h-4 w-4" />
                {wishlist.count > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-[10px] font-bold">
                    {wishlist.count}
                  </span>
                )}
              </Link>
              <button onClick={cart.open} className="relative grid h-10 w-10 place-items-center rounded-xl glass transition hover:bg-white/10">
                <ShoppingCart className="h-4 w-4" />
                {cart.count > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold">
                    {cart.count}
                  </span>
                )}
              </button>
              {user ? (
                <div className="relative hidden md:block" onMouseEnter={() => setUserMenu(true)} onMouseLeave={() => setUserMenu(false)}>
                  <button className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/10">
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold">
                      {(user.email ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.user_metadata?.display_name ?? user.email?.split("@")[0]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-full mt-2 w-56 rounded-2xl glass-strong p-2">
                        <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                        <Link to="/dashboard/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10"><UserIcon className="h-4 w-4" /> Profile</Link>
                        <button onClick={async () => { await signOut(); toast.success("Signed out"); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"><LogOut className="h-4 w-4" /> Sign out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] md:inline-flex">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
              )}
              <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-xl glass lg:hidden">
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
                    <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10">
                      {l.label}
                    </Link>
                  ))}
                  <button onClick={() => { setOpen(false); setSearch(true); }} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white/80 hover:bg-white/10">
                    Search
                  </button>
                  <div className="my-2 h-px bg-white/10" />
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((c) => (
                      <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/10">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                  {user ? (
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  ) : (
                    <Link to="/login" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold">
                      <LogIn className="h-4 w-4" /> Login
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <SearchModal open={search} onClose={() => setSearch(false)} />
    </>
  );
}
