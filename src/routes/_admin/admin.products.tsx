import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader, Panel, btnPrimary, btnGhost, btnDanger, Field, inputCls, EmptyRow } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/products")({
  component: AdminProducts,
});

type P = Tables<"products">;
type C = Tables<"categories">;

const empty: Partial<P> = {
  name: "",
  slug: "",
  description: "",
  long_description: "",
  category_slug: "",
  initials: "PR",
  gradient: "from-primary to-accent",
  original_price: 0,
  discount_price: 0,
  rating: 4.8,
  review_count: 0,
  trending: false,
  best_seller: false,
  is_new: true,
  in_stock: true,
  visible: true,
  tags: [],
  features: [],
  badge: null,
  image_url: null,
};

function AdminProducts() {
  const [items, setItems] = useState<P[]>([]);
  const [cats, setCats] = useState<C[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<P> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [{ data: ps }, { data: cs }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setItems(ps ?? []);
    setCats(cs ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  );

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing };
    if (!payload.name || !payload.slug || !payload.category_slug) {
      toast.error("Name, slug and category are required");
      return;
    }
    const { id, ...rest } = payload;
    const op = id
      ? supabase.from("products").update(rest as never).eq("id", id)
      : supabase.from("products").insert(rest as never);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(id ? "Product updated" : "Product created");
    setEditing(null);
    refresh();
  };

  const remove = async (p: P) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const upload = async (file: File) => {
    if (!editing) return;
    const path = `products/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing({ ...editing, image_url: data.publicUrl });
    toast.success("Image uploaded");
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${items.length} total · manage your catalog`}
        actions={
          <button onClick={() => setEditing({ ...empty })} className={btnPrimary}>
            <Plus className="h-4 w-4" /> New product
          </button>
        }
      />

      <Panel>
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>

        {loading ? (
          <EmptyRow message="Loading products…" />
        ) : filtered.length === 0 ? (
          <EmptyRow message="No products found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-white/40">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Rating</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${p.gradient} text-xs font-bold`}>
                            {p.initials}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-white/40">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-white/70">{p.category_slug}</td>
                    <td className="px-3 py-3">
                      <span className="font-semibold">${Number(p.discount_price).toFixed(2)}</span>
                      {Number(p.original_price) > Number(p.discount_price) && (
                        <span className="ml-2 text-xs text-white/40 line-through">
                          ${Number(p.original_price).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 text-amber-300">
                        <Star className="h-3 w-3 fill-amber-300" /> {Number(p.rating).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.trending && <Tag>Trending</Tag>}
                        {p.best_seller && <Tag>Best</Tag>}
                        {p.is_new && <Tag>New</Tag>}
                        {!p.visible && <Tag tone="muted">Hidden</Tag>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(p)} className={btnGhost}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(p)} className={btnDanger}>
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
        <Editor
          value={editing}
          cats={cats}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={save}
          onUpload={upload}
        />
      )}
    </>
  );
}

function Tag({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "muted" }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone === "muted" ? "bg-white/10 text-white/50" : "bg-primary/20 text-primary"}`}>
      {children}
    </span>
  );
}

function Editor({
  value,
  cats,
  onChange,
  onClose,
  onSave,
  onUpload,
}: {
  value: Partial<P>;
  cats: C[];
  onChange: (v: Partial<P>) => void;
  onClose: () => void;
  onSave: () => void;
  onUpload: (f: File) => void;
}) {
  const set = <K extends keyof P>(k: K, v: P[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-2xl font-bold">{value.id ? "Edit product" : "New product"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className={inputCls} value={value.name ?? ""} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Slug">
            <input className={inputCls} value={value.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Category">
            <select className={inputCls} value={value.category_slug ?? ""} onChange={(e) => set("category_slug", e.target.value)}>
              <option value="">Select…</option>
              {cats.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Initials (badge)">
            <input className={inputCls} value={value.initials ?? ""} onChange={(e) => set("initials", e.target.value)} />
          </Field>
          <Field label="Gradient (Tailwind)">
            <input className={inputCls} value={value.gradient ?? ""} onChange={(e) => set("gradient", e.target.value)} />
          </Field>
          <Field label="Badge text">
            <input className={inputCls} value={value.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)} />
          </Field>
          <Field label="Original price">
            <input type="number" step="0.01" className={inputCls} value={value.original_price ?? 0} onChange={(e) => set("original_price", Number(e.target.value))} />
          </Field>
          <Field label="Discount price">
            <input type="number" step="0.01" className={inputCls} value={value.discount_price ?? 0} onChange={(e) => set("discount_price", Number(e.target.value))} />
          </Field>
          <Field label="Rating">
            <input type="number" step="0.1" min="0" max="5" className={inputCls} value={value.rating ?? 4.8} onChange={(e) => set("rating", Number(e.target.value))} />
          </Field>
          <Field label="Reviews">
            <input type="number" className={inputCls} value={value.review_count ?? 0} onChange={(e) => set("review_count", Number(e.target.value))} />
          </Field>
          <Field label="Tags (comma)">
            <input className={inputCls} value={(value.tags ?? []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
          </Field>
          <Field label="Image">
            <div className="flex items-center gap-3">
              {value.image_url && <img src={value.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />}
              <input
                type="file"
                accept="image/*"
                className="text-xs text-white/70"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              />
            </div>
          </Field>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Short description">
            <textarea rows={2} className={inputCls} value={value.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Long description">
            <textarea rows={4} className={inputCls} value={value.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Toggle label="Trending" value={!!value.trending} onChange={(v) => set("trending", v)} />
          <Toggle label="Best seller" value={!!value.best_seller} onChange={(v) => set("best_seller", v)} />
          <Toggle label="New" value={!!value.is_new} onChange={(v) => set("is_new", v)} />
          <Toggle label="In stock" value={value.in_stock !== false} onChange={(v) => set("in_stock", v)} />
          <Toggle label="Visible" value={value.visible !== false} onChange={(v) => set("visible", v)} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className={btnGhost}>Cancel</button>
          <button onClick={onSave} className={btnPrimary}>Save product</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${value ? "bg-primary/20 text-primary" : "glass text-white/60"}`}
    >
      <span className={`block h-3 w-3 rounded-full ${value ? "bg-primary" : "bg-white/30"}`} /> {label}
    </button>
  );
}
