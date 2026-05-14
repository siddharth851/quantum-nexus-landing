import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, btnPrimary, Field, inputCls } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/homepage")({
  component: AdminHomepage,
});

type Section = {
  id?: string;
  section: string;
  enabled: boolean;
  payload: Record<string, unknown>;
};

const KNOWN = [
  { key: "hero", label: "Hero", fields: ["title", "subtitle"] },
  { key: "announcement", label: "Announcement bar", fields: ["text"] },
  { key: "flash_sale", label: "Flash sale", fields: ["title", "ends_at"] },
];

function AdminHomepage() {
  const [data, setData] = useState<Record<string, Section>>({});

  const refresh = async () => {
    const { data: rows } = await supabase.from("homepage_content").select("*");
    const map: Record<string, Section> = {};
    (rows ?? []).forEach((r) => {
      map[r.section] = {
        id: r.id,
        section: r.section,
        enabled: r.enabled,
        payload: (r.payload as Record<string, unknown>) ?? {},
      };
    });
    KNOWN.forEach((k) => {
      if (!map[k.key]) map[k.key] = { section: k.key, enabled: true, payload: {} };
    });
    setData(map);
  };
  useEffect(() => {
    refresh();
  }, []);

  const save = async (key: string) => {
    const s = data[key];
    if (!s) return;
    const { error } = await supabase.from("homepage_content").upsert(
      { section: s.section, enabled: s.enabled, payload: s.payload },
      { onConflict: "section" },
    );
    if (error) return toast.error(error.message);
    toast.success(`Saved ${key}`);
    refresh();
  };

  return (
    <>
      <PageHeader title="Homepage CMS" subtitle="Edit sections that appear on the marketplace home" />
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
                    onChange={(e) => setData({ ...data, [k.key]: { ...s, enabled: e.target.checked } })}
                  />
                  Enabled
                </label>
              </div>
              <div className="space-y-3">
                {k.fields.map((f) => (
                  <Field key={f} label={f}>
                    <input
                      className={inputCls}
                      value={(s.payload[f] as string) ?? ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          [k.key]: { ...s, payload: { ...s.payload, [f]: e.target.value } },
                        })
                      }
                    />
                  </Field>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button className={btnPrimary} onClick={() => save(k.key)}>
                  Save
                </button>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
