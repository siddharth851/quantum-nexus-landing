import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, btnPrimary, Field, inputCls } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/homepage")({
  component: AdminHomepage,
});

type FieldDef = { key: string; label: string; type?: "text" | "textarea" };
type SectionDef = { key: string; label: string; fields: FieldDef[] };

type Section = {
  id?: string;
  section: string;
  enabled: boolean;
  payload: Record<string, unknown>;
};

const KNOWN: SectionDef[] = [
  {
    key: "announcement",
    label: "Announcement bar",
    fields: [
      { key: "text", label: "Single message" },
      { key: "items_text", label: "Multiple messages (one per line)", type: "textarea" },
    ],
  },
  {
    key: "hero",
    label: "Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_primary", label: "Primary CTA label" },
      { key: "cta_secondary", label: "Secondary CTA label" },
    ],
  },
  { key: "stats", label: "Stats", fields: [] },
  { key: "categories", label: "Categories", fields: [] },
  { key: "featured_products", label: "Featured products", fields: [] },
  {
    key: "flash_sale",
    label: "Flash sale",
    fields: [
      { key: "badge", label: "Badge" },
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta", label: "CTA label" },
      { key: "ends_at", label: "Ends at (ISO date, e.g. 2026-12-31T23:59:00Z)" },
    ],
  },
  { key: "why_choose_us", label: "Why choose us", fields: [] },
  { key: "testimonials", label: "Testimonials", fields: [] },
  { key: "faq", label: "FAQ", fields: [] },
  { key: "newsletter", label: "Newsletter", fields: [] },
  { key: "footer", label: "Footer", fields: [] },
];

function AdminHomepage() {
  const [data, setData] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase.from("homepage_content").select("*");
    if (error) toast.error(error.message);
    const map: Record<string, Section> = {};
    (rows ?? []).forEach((r) => {
      const payload = (r.payload as Record<string, unknown>) ?? {};
      // hydrate items_text from items[]
      if (Array.isArray(payload.items) && !payload.items_text) {
        payload.items_text = (payload.items as string[]).join("\n");
      }
      map[r.section] = {
        id: r.id,
        section: r.section,
        enabled: r.enabled,
        payload,
      };
    });
    KNOWN.forEach((k) => {
      if (!map[k.key]) map[k.key] = { section: k.key, enabled: true, payload: {} };
    });
    setData(map);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  const save = async (key: string) => {
    const s = data[key];
    if (!s) return;
    // serialize items_text -> items[]
    const payload = { ...s.payload };
    if (typeof payload.items_text === "string") {
      const items = (payload.items_text as string)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (items.length) payload.items = items;
      else delete payload.items;
    }
    const { error } = await supabase.from("homepage_content").upsert(
      { section: s.section, enabled: s.enabled, payload: payload as never },
      { onConflict: "section" },
    );
    if (error) return toast.error(error.message);
    toast.success(`Saved ${key}`);
    refresh();
  };

  const toggleEnabled = async (key: string, enabled: boolean) => {
    const next = { ...data, [key]: { ...(data[key] ?? { section: key, payload: {} }), section: key, enabled, payload: data[key]?.payload ?? {} } };
    setData(next);
    const { error } = await supabase
      .from("homepage_content")
      .upsert(
        { section: key, enabled, payload: (next[key].payload ?? {}) as never },
        { onConflict: "section" },
      );
    if (error) toast.error(error.message);
    else toast.success(`${enabled ? "Enabled" : "Hidden"} ${key}`);
  };

  return (
    <>
      <PageHeader
        title="Homepage CMS"
        subtitle="Toggle and edit sections. Changes appear instantly on the homepage."
      />
      {loading && <p className="mb-4 text-sm text-white/60">Loading…</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {KNOWN.map((k) => {
          const s = data[k.key] ?? { section: k.key, enabled: true, payload: {} };
          return (
            <Panel key={k.key}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">{k.label}</h3>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={(e) => toggleEnabled(k.key, e.target.checked)}
                  />
                  Visible
                </label>
              </div>
              {k.fields.length === 0 ? (
                <p className="text-xs text-white/50">
                  No editable text. Toggle above to show/hide this section on the homepage.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {k.fields.map((f) => (
                      <Field key={f.key} label={f.label}>
                        {f.type === "textarea" ? (
                          <textarea
                            rows={4}
                            className={inputCls}
                            value={(s.payload[f.key] as string) ?? ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                [k.key]: {
                                  ...s,
                                  payload: { ...s.payload, [f.key]: e.target.value },
                                },
                              })
                            }
                          />
                        ) : (
                          <input
                            className={inputCls}
                            value={(s.payload[f.key] as string) ?? ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                [k.key]: {
                                  ...s,
                                  payload: { ...s.payload, [f.key]: e.target.value },
                                },
                              })
                            }
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className={btnPrimary} onClick={() => save(k.key)}>
                      Save
                    </button>
                  </div>
                </>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
