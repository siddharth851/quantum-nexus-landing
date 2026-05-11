import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";
import { useWishlist } from "@/store/wishlist";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({ meta: [{ title: "Wishlist — NovaMarket" }] }),
});

function WishlistPage() {
  const { ids, count } = useWishlist();

  const { data = [] } = useQuery({
    queryKey: ["wishlist", ids],
    queryFn: async (): Promise<Product[]> => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from("products").select("*").in("id", ids);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="pt-6">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Saved</p>
              <h1 className="mt-2 text-4xl font-bold">Your <span className="text-gradient">Wishlist</span></h1>
              <p className="mt-2 text-white/60">{count} items saved for later</p>
            </div>
          </div>
          <div className="mt-8">
            {count === 0 ? (
              <EmptyState
                icon={Heart}
                title="Your wishlist is empty"
                description="Tap the heart on any product to save it here."
                action={
                  <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold">
                    Browse Marketplace <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {data.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
