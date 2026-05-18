import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Eye, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader, Panel, btnGhost, btnPrimary, inputCls, EmptyRow } from "@/components/admin/AdminUI";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/_admin/admin/orders")({
  component: AdminOrders,
});

type O = Tables<"orders">;
const STATUSES = [
  "pending",
  "contacted",
  "payment_confirmed",
  "activated",
  "completed",
  "cancelled",
] as const;

function statusColor(s: string) {
  switch (s) {
    case "completed":
    case "activated":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "payment_confirmed":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-400/30";
    case "contacted":
      return "bg-violet-500/15 text-violet-300 border-violet-400/30";
    case "pending":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
    case "cancelled":
      return "bg-rose-500/15 text-rose-300 border-rose-400/30";
    default:
      return "bg-white/10 text-white/60 border-white/20";
  }
}

function AdminOrders() {
  const [orders, setOrders] = useState<O[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<O | null>(null);

  const refresh = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
  };
  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (filter !== "all" && o.status !== filter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            o.order_number.toLowerCase().includes(q) ||
            (o.contact_email ?? "").toLowerCase().includes(q) ||
            (o.contact_name ?? "").toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [orders, search, filter],
  );

  const updateStatus = async (o: O, status: string) => {
    const patch: Partial<O> = { status };
    if (status === "payment_confirmed" || status === "activated" || status === "completed") {
      patch.payment_status = "paid";
    }
    const { error } = await supabase.from("orders").update(patch).eq("id", o.id);
    if (error) return toast.error(error.message);

    // Grant access on activation/completion (idempotent best-effort)
    if (status === "activated" || status === "completed") {
      const items = Array.isArray(o.items) ? (o.items as Array<{ id: string }>) : [];
      if (items.length) {
        const rows = items
          .filter((it) => it.id)
          .map((it) => ({ user_id: o.user_id, product_id: it.id, status: "active" }));
        if (rows.length) await supabase.from("purchased_products").insert(rows);
      }
    }
    toast.success(`Status set to ${status}`);
    refresh();
    if (view?.id === o.id) setView({ ...o, ...patch } as O);
  };

  return (
    <>
      <PageHeader title="Orders" subtitle={`${orders.length} total orders`} />
      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, email, name…"
              className={`${inputCls} pl-9`}
            />
          </div>
          <select className={`${inputCls} max-w-[180px]`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyRow message="No orders found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-white/40">
                <tr>
                  <th className="px-3 py-2">Order #</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5">
                    <td className="px-3 py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{o.contact_name ?? "—"}</p>
                      <p className="text-xs text-white/50">{o.contact_email}</p>
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {o.currency} {Number(o.total).toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-white/60">
                      {o.payment_method ?? "—"} · {o.payment_status}
                    </td>
                    <td className="px-3 py-3 text-xs text-white/60">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button onClick={() => setView(o)} className={btnGhost}>
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {view && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setView(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-strong relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6">
            <button onClick={() => setView(null)} className="absolute right-4 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-bold">Order {view.order_number}</h2>
            <p className="mt-1 text-sm text-white/60">{new Date(view.created_at).toLocaleString()}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info label="Customer" value={`${view.contact_name ?? "—"} · ${view.contact_email ?? "—"}`} />
              <Info label="Country" value={view.billing_country ?? "—"} />
              <Info label="Subtotal" value={`${view.currency} ${Number(view.subtotal).toFixed(2)}`} />
              <Info label="Discount" value={`${view.currency} ${Number(view.discount).toFixed(2)}`} />
              <Info label="Tax" value={`${view.currency} ${Number(view.tax).toFixed(2)}`} />
              <Info label="Total" value={`${view.currency} ${Number(view.total).toFixed(2)}`} />
              <Info label="Coupon" value={view.coupon_code ?? "—"} />
              <Info label="Gateway" value={view.payment_method ?? "—"} />
              <Info label="Transaction" value={view.gateway_payment_id ?? view.transaction_id ?? "—"} />
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Items</p>
              <div className="space-y-2">
                {((view.items as { name?: string; quantity?: number; price?: number }[]) ?? []).map((it, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl glass p-3 text-sm">
                    <span>
                      {it.name} × {it.quantity ?? 1}
                    </span>
                    <span className="font-semibold">${Number(it.price ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-widest text-white/50">Set status</p>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(view, s)}
                  className={`rounded-full border px-3 py-1 text-xs ${view.status === s ? statusColor(s) : "border-white/10 text-white/60 hover:bg-white/10"}`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={waLink(`Hello ${view.contact_name ?? ""} 👋\n\nRegarding your NovaMarket order *${view.order_number}* — total $${Number(view.total).toFixed(2)}.\nHow can we help?`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Contact on WhatsApp
              </a>
              <button onClick={() => setView(null)} className={`${btnPrimary} ml-auto`}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass p-3">
      <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
