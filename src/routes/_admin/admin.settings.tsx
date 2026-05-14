import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, btnPrimary, Field, inputCls } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminSettings,
});

const KEYS = [
  { key: "branding", label: "Branding", fields: ["name", "tagline"] },
  { key: "contact", label: "Contact", fields: ["email", "phone", "whatsapp"] },
  { key: "social", label: "Social links", fields: ["twitter", "instagram", "github"] },
  { key: "seo", label: "SEO", fields: ["title", "description"] },
];

function AdminSettings() {
  const [data, setData] = useState<Record<string, Record<string, string>>>({});

  const refresh = async () => {
    const { data: rows } = await supabase.from("site_settings").select("*");
    const map: Record<string, Record<string, string>> = {};
    KEYS.forEach((k) => (map[k.key] = {}));
    (rows ?? []).forEach((r) => {
      map[r.key] = (r.value as Record<string, string>) ?? {};
    });
    setData(map);
  };
  useEffect(() => {
    refresh();
  }, []);

  const save = async (key: string) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: data[key] ?? {} }, { onConflict: "key" });
    if (error) return toast.error(error.message);
    toast.success(`Saved ${key}`);
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure marketplace branding and metadata" />
      <div className="grid gap-4 lg:grid-cols-2">
        {KEYS.map((k) => (
          <Panel key={k.key}>
            <h3 className="mb-3 text-lg font-bold">{k.label}</h3>
            <div className="space-y-3">
              {k.fields.map((f) => (
                <Field key={f} label={f}>
                  <input
                    className={inputCls}
                    value={data[k.key]?.[f] ?? ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        [k.key]: { ...(data[k.key] ?? {}), [f]: e.target.value },
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
        ))}
      </div>
    </>
  );
}
