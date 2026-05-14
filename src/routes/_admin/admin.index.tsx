import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertTriangle, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, StatCard, Panel } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminDashboard,
});

type Stats = {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  pending: number;
  failed: number;
  conversion: number;
  monthly: number;
};

function AdminDashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [series, setSeries] = useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: orders }, { count: prodCount }, { count: userCount }] = await Promise.all([
        supabase.from("orders").select("total,status,payment_status,created_at,items"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const allOrders = orders ?? [];
      const completed = allOrders.filter((o) => o.payment_status === "paid" || o.status === "completed");
      const revenue = completed.reduce((a, b) => a + Number(b.total || 0), 0);
      const pending = allOrders.filter((o) => o.status === "pending").length;
      const failed = allOrders.filter((o) => o.status === "failed" || o.payment_status === "failed").length;
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthly = completed
        .filter((o) => new Date(o.created_at) >= monthStart)
        .reduce((a, b) => a + Number(b.total || 0), 0);

      setS({
        revenue,
        orders: allOrders.length,
        products: prodCount ?? 0,
        users: userCount ?? 0,
        pending,
        failed,
        conversion: allOrders.length ? (completed.length / allOrders.length) * 100 : 0,
        monthly,
      });

      // Build 14-day series
      const days: { day: string; revenue: number; orders: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({ day: key.slice(5), revenue: 0, orders: 0 });
      }
      const map = new Map(days.map((d) => [d.day, d]));
      completed.forEach((o) => {
        const k = new Date(o.created_at).toISOString().slice(5, 10);
        const row = map.get(k);
        if (row) {
          row.revenue += Number(o.total || 0);
          row.orders += 1;
        }
      });
      setSeries([...map.values()]);

      // Top products from items jsonb
      const counts = new Map<string, number>();
      completed.forEach((o) => {
        const items = (o.items as { name?: string; quantity?: number }[]) || [];
        items.forEach((it) => {
          const name = it.name || "Item";
          counts.set(name, (counts.get(name) || 0) + (Number(it.quantity) || 1));
        });
      });
      setTopProducts(
        [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, sales]) => ({ name, sales })),
      );
    })();
  }, []);

  if (!s) {
    return (
      <Panel className="text-sm text-white/60">Loading dashboard…</Panel>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Real-time marketplace performance" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={`$${s.revenue.toFixed(2)}`} hint="All-time" icon={<DollarSign className="h-5 w-5" />} delay={0} />
        <StatCard label="Total Orders" value={s.orders} hint={`${s.pending} pending`} icon={<ShoppingBag className="h-5 w-5" />} delay={0.05} />
        <StatCard label="Products" value={s.products} icon={<Package className="h-5 w-5" />} delay={0.1} />
        <StatCard label="Active Users" value={s.users} icon={<Users className="h-5 w-5" />} delay={0.15} />
        <StatCard label="Conversion" value={`${s.conversion.toFixed(1)}%`} hint="Paid / total" icon={<TrendingUp className="h-5 w-5" />} delay={0.2} />
        <StatCard label="Monthly Sales" value={`$${s.monthly.toFixed(2)}`} icon={<Zap className="h-5 w-5" />} delay={0.25} />
        <StatCard label="Pending" value={s.pending} icon={<Clock className="h-5 w-5" />} delay={0.3} />
        <StatCard label="Failed Payments" value={s.failed} icon={<AlertTriangle className="h-5 w-5" />} delay={0.35} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
            Revenue · last 14 days
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
            Top products
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-white/50">No sales yet.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
