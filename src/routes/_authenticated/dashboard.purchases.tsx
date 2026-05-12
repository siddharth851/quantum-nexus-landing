import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ExternalLink, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/_authenticated/dashboard/purchases")({
  component: PurchasesPage,
  head: () => ({ meta: [{ title: "Purchased — NovaMarket" }] }),
});

function PurchasesPage() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["purchases-full", user?.id],
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

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Library</p>
        <h1 className="mt-2 text-4xl font-bold">Purchased <span className="text-gradient">Products</span></h1>
        <p className="mt-2 text-white/60">Access everything you own in one place.</p>
      </div>
      {!isLoading && data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No purchases yet"
          description="Once you buy products, they'll show up here for instant access."
          action={
            <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold">
              Explore Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p: any) => (
            <div key={p.id} className="glass-strong group rounded-3xl p-5 transition hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl text-base font-bold" style={{ background: p.products?.gradient }}>
                  {p.products?.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold">{p.products?.name}</p>
                  <p className="text-xs text-white/50 capitalize">{p.status}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-white/60">{p.products?.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-white/40">Purchased {new Date(p.purchased_at).toLocaleDateString()}</span>
                <a href={p.access_url ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-2 text-xs font-semibold">
                  Access <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
