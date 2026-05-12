import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/_authenticated/dashboard/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Orders — NovaMarket" }] }),
});

function OrdersPage() {
  const { user } = useAuth();
  const { data = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchased_products")
        .select("*, products(name, original_price, discount_price)")
        .order("purchased_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">History</p>
        <h1 className="mt-2 text-4xl font-bold">Order <span className="text-gradient">History</span></h1>
        <p className="mt-2 text-white/60">All your past transactions.</p>
      </div>
      {data.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Your order history will show up here." />
      ) : (
        <div className="glass-strong overflow-hidden rounded-3xl">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o: any) => (
                <tr key={o.id} className="border-t border-white/5">
                  <td className="px-5 py-4 font-medium">{o.products?.name}</td>
                  <td className="px-5 py-4 text-white/60">{new Date(o.purchased_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300 capitalize">{o.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">${Number(o.products?.discount_price ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
