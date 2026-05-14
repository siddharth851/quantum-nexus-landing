import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, StatCard } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/analytics")({
  component: AdminAnalytics,
});

const COLORS = ["#a855f7", "#06b6d4", "#f472b6", "#22c55e", "#f59e0b", "#ef4444"];

function AdminAnalytics() {
  const [series, setSeries] = useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [growth, setGrowth] = useState<{ day: string; users: number }[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, orders: 0, aov: 0, refunds: 0 });

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const [{ data: orders }, { data: products }, { data: profs }] = await Promise.all([
        supabase.from("orders").select("total,status,payment_status,created_at,items").gte("created_at", since.toISOString()),
        supabase.from("products").select("category_slug,id"),
        supabase.from("profiles").select("created_at").gte("created_at", since.toISOString()),
      ]);

      const ords = orders ?? [];
      const paid = ords.filter((o) => o.payment_status === "paid" || o.status === "completed");
      const refunds = ords.filter((o) => o.status === "refunded").length;
      const revenue = paid.reduce((a, b) => a + Number(b.total || 0), 0);
      setTotals({
        revenue,
        orders: paid.length,
        aov: paid.length ? revenue / paid.length : 0,
        refunds,
      });

      const days: { day: string; revenue: number; orders: number }[] = [];
      const userDays: { day: string; users: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = d.toISOString().slice(5, 10);
        days.push({ day: k, revenue: 0, orders: 0 });
        userDays.push({ day: k, users: 0 });
      }
      const map = new Map(days.map((d) => [d.day, d]));
      const uMap = new Map(userDays.map((d) => [d.day, d]));
      paid.forEach((o) => {
        const k = new Date(o.created_at).toISOString().slice(5, 10);
        const r = map.get(k);
        if (r) {
          r.revenue += Number(o.total || 0);
          r.orders += 1;
        }
      });
      (profs ?? []).forEach((p) => {
        const k = new Date(p.created_at).toISOString().slice(5, 10);
        const r = uMap.get(k);
        if (r) r.users += 1;
      });
      setSeries([...map.values()]);
      setGrowth([...uMap.values()]);

      // Category distribution from products count (simple proxy)
      const counts = new Map<string, number>();
      (products ?? []).forEach((p) => counts.set(p.category_slug, (counts.get(p.category_slug) || 0) + 1));
      setByCategory([...counts.entries()].map(([name, value]) => ({ name, value })));
    })();
  }, []);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Last 30 days" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={`$${totals.revenue.toFixed(2)}`} delay={0} />
        <StatCard label="Orders" value={totals.orders} delay={0.05} />
        <StatCard label="AOV" value={`$${totals.aov.toFixed(2)}`} delay={0.1} />
        <StatCard label="Refunds" value={totals.refunds} delay={0.15} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">Revenue trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#a855f7" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">Daily orders</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Bar dataKey="orders" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">User growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="users" stroke="#f472b6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">Catalog by category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
