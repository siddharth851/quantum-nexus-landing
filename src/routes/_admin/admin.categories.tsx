import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader, Panel, btnPrimary, btnGhost, btnDanger, Field, inputCls, EmptyRow } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/categories")({
  component: AdminCategories,
});

type C = Tables<"categories">;

function AdminCategories() {
  const [items, setItems] = useState<C[]>([]);
  const [editing, setEditing] = useState<Partial<C> | null>(null);

  const refresh = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setItems(data ?? []);
  };
  useEffect(() => {
    refresh();
  }, []);

  const save = async () => {
    if (!editing?.name || !editing.slug) return toast.error("Name and slug required");
    const { id, ...rest } = editing;
    const op = id ? supabase.from("categories").update(rest as never).eq("id", id) : supabase.from("categories").insert(rest as never);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(id ? "Updated" : "Created");
    setEditing(null);
    refresh();
  };

  const remove = async (c: C) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const upload = async (file: File) => {
    if (!editing) return;
    const path = `categories/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing({ ...editing, image_url: data.publicUrl });
  };

  return (
    <>
      <PageHeader
        title="Categories"
        actions={
          <button className={btnPrimary} onClick={() => setEditing({ name: "", slug: "", description: "", gradient: "from-primary to-accent", icon: "Sparkles" })}>
            <Plus className="h-4 w-4" /> New category
          </button>
        }
      />
      <Panel>
        {items.length === 0 ? (
          <EmptyRow message="No categories." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <div key={c.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {c.image_url ? (
                      <img src={c.image_url} className="h-10 w-10 rounded-lg object-cover" alt="" />
                    ) : (
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c.gradient ?? "from-primary to-accent"}`} />
                    )}
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-white/40">/{c.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className={btnGhost} onClick={() => setEditing(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button className={btnDanger} onClick={() => remove(c)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {c.description && <p className="mt-3 text-xs text-white/60">{c.description}</p>}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-strong relative w-full max-w-xl rounded-3xl p-6">
            <button onClick={() => setEditing(null)} className="absolute right-4 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-bold">{editing.id ? "Edit category" : "New category"}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputCls} value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Slug">
                <input className={inputCls} value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </Field>
              <Field label="Gradient (Tailwind)">
                <input className={inputCls} value={editing.gradient ?? ""} onChange={(e) => setEditing({ ...editing, gradient: e.target.value })} />
              </Field>
              <Field label="Icon name">
                <input className={inputCls} value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
              </Field>
              <Field label="Image">
                <input type="file" accept="image/*" className="text-xs text-white/70" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Description">
                <textarea rows={3} className={inputCls} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
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
