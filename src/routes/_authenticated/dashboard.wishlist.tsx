import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowRight } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/_authenticated/dashboard/wishlist")({
  component: DashboardWishlistPage,
  head: () => ({ meta: [{ title: "My Wishlist — NovaMarket" }] }),
});

function DashboardWishlistPage() {
  const { ids, count } = useWishlist();
  const { data = [] } = useQuery({
    queryKey: ["dash-wishlist", ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from("products").select("*").in("id", ids);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Saved</p>
        <h1 className="mt-2 text-4xl font-bold">Your <span className="text-gradient">Wishlist</span></h1>
        <p className="mt-2 text-white/60">{count} items saved for later</p>
      </div>
      {count === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you love by tapping the heart icon."
          action={<Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold">Browse <ArrowRight className="h-4 w-4" /></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((p) => <ProductCard key={p.id} p={p as any} />)}
        </div>
      )}
    </div>
  );
}
