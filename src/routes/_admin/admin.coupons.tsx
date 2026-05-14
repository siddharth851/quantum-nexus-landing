import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader, Panel, btnPrimary, btnGhost, btnDanger, Field, inputCls, EmptyRow } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/coupons")({
  component: AdminCoupons,
});

type C = Tables<"coupons">;
const empty: Partial<C> = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  min_order_amount: 0,
  max_discount: null,
  usage_limit: null,
  active: true,
};

function AdminCoupons() {
  const [items, setItems] = useState<C[]>([]);
  const [editing, setEditing] = useState<Partial<C> | null>(null);

  const refresh = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => {
    refresh();
  }, []);

  const save = async () => {
    if (!editing?.code || !editing.discount_type || editing.discount_value == null) {
      toast.error("Code, type and value are required");
      return;
    }
    const { id, ...rest } = editing;
    const op = id
      ? supabase.from("coupons").update(rest as never).eq("id", id)
      : supabase.from("coupons").insert(rest as never);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(id ? "Coupon updated" : "Coupon created");
    setEditing(null);
    refresh();
  };

  const remove = async (c: C) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const toggle = async (c: C) => {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <>
      <PageHeader
        title="Coupons"
        subtitle={`${items.length} promo codes`}
        actions={
          <button className={btnPrimary} onClick={() => setEditing({ ...empty })}>
            <Plus className="h-4 w-4" /> New coupon
          </button>
        }
      />
      <Panel>
        {items.length === 0 ? (
          <EmptyRow message="No coupons yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-white/40">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Discount</th>
                  <th className="px-3 py-2">Min order</th>
                  <th className="px-3 py-2">Usage</th>
                  <th className="px-3 py-2">Expires</th>
                  <th className="px-3 py-2">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="px-3 py-3">
                      <p className="font-mono font-bold">{c.code}</p>
                      <p className="text-xs text-white/50">{c.description}</p>
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {c.discount_type === "percent" ? `${c.discount_value}%` : `$${Number(c.discount_value).toFixed(2)}`}
                    </td>
                    <td className="px-3 py-3">${Number(c.min_order_amount).toFixed(2)}</td>
                    <td className="px-3 py-3 text-xs">
                      {c.used_count}/{c.usage_limit ?? "∞"}
                    </td>
                    <td className="px-3 py-3 text-xs text-white/60">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => toggle(c)} className={`rounded-full px-2 py-0.5 text-xs ${c.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/50"}`}>
                        {c.active ? "active" : "disabled"}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(c)} className={btnGhost}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(c)} className={btnDanger}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-strong relative w-full max-w-xl rounded-3xl p-6">
            <button onClick={() => setEditing(null)} className="absolute right-4 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-bold">{editing.id ? "Edit coupon" : "New coupon"}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Code">
                <input className={inputCls} value={editing.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Discount type">
                <select className={inputCls} value={editing.discount_type ?? "percent"} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value })}>
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </Field>
              <Field label="Discount value">
                <input type="number" step="0.01" className={inputCls} value={editing.discount_value ?? 0} onChange={(e) => setEditing({ ...editing, discount_value: Number(e.target.value) })} />
              </Field>
              <Field label="Min order amount">
                <input type="number" step="0.01" className={inputCls} value={editing.min_order_amount ?? 0} onChange={(e) => setEditing({ ...editing, min_order_amount: Number(e.target.value) })} />
              </Field>
              <Field label="Max discount (optional)">
                <input type="number" step="0.01" className={inputCls} value={editing.max_discount ?? ""} onChange={(e) => setEditing({ ...editing, max_discount: e.target.value ? Number(e.target.value) : null })} />
              </Field>
              <Field label="Usage limit">
                <input type="number" className={inputCls} value={editing.usage_limit ?? ""} onChange={(e) => setEditing({ ...editing, usage_limit: e.target.value ? Number(e.target.value) : null })} />
              </Field>
              <Field label="Expires at">
                <input type="datetime-local" className={inputCls} value={editing.expires_at ? new Date(editing.expires_at).toISOString().slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
              </Field>
              <Field label="Active">
                <select className={inputCls} value={editing.active ? "yes" : "no"} onChange={(e) => setEditing({ ...editing, active: e.target.value === "yes" })}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Description">
                <input className={inputCls} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              <button onClick={save} className={btnPrimary}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
