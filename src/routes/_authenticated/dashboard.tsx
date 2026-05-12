import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, Heart, ShoppingBag, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — NovaMarket" }] }),
});

function DashboardPage() {
  const { user } = useAuth();
  const wishlist = useWishlist();
  const cart = useCart();

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchased_products")
        .select("*, products(*)")
        .order("purchased_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = [
    { label: "Purchased", value: purchases.length, icon: Package, color: "from-primary to-accent" },
    { label: "Wishlist", value: wishlist.count, icon: Heart, color: "from-rose-500 to-pink-600" },
    { label: "Cart", value: cart.count, icon: ShoppingBag, color: "from-emerald-500 to-cyan-500" },
    { label: "Saved", value: `$${cart.savings.toFixed(0)}`, icon: TrendingUp, color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Welcome back</span>
        </div>
        <h1 className="mt-2 text-4xl font-bold">Hello, <span className="text-gradient">{user?.user_metadata?.display_name ?? user?.email?.split("@")[0]}</span></h1>
        <p className="mt-2 text-white/60">Here's everything you need at a glance.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-strong rounded-2xl p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-white/50">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent purchases</h2>
          <Link to="/dashboard/purchases" className="flex items-center gap-1 text-sm text-white/60 hover:text-white">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-4">
          {purchases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-white/60">No purchases yet</p>
              <Link to="/products" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold">
                Browse marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {purchases.slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl glass p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold" style={{ background: p.products?.gradient }}>
                    {p.products?.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.products?.name}</p>
                    <p className="text-xs text-white/50">{p.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
