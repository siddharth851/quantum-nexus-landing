import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HomepageSection = {
  section: string;
  enabled: boolean;
  payload: Record<string, unknown>;
};

export type HomepageContentMap = Record<string, HomepageSection>;

const QUERY_KEY = ["homepage_content"] as const;

async function fetchHomepageContent(): Promise<HomepageContentMap> {
  const { data, error } = await supabase
    .from("homepage_content")
    .select("section, enabled, payload");
  if (error) throw error;
  const map: HomepageContentMap = {};
  (data ?? []).forEach((r) => {
    map[r.section] = {
      section: r.section,
      enabled: r.enabled,
      payload: (r.payload as Record<string, unknown>) ?? {},
    };
  });
  return map;
}

export function useHomepageContent() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchHomepageContent,
    staleTime: 60_000,
  });

  useEffect(() => {
    const channelName = `homepage_content_changes_${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_content" },
        () => {
          qc.invalidateQueries({ queryKey: QUERY_KEY });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);


  return query;
}

export function useHomepageSection(key: string) {
  const { data } = useHomepageContent();
  return data?.[key];
}

export function sectionEnabled(map: HomepageContentMap | undefined, key: string) {
  const s = map?.[key];
  // default enabled if not present
  return s ? s.enabled : true;
}

export function getText(
  payload: Record<string, unknown> | undefined,
  key: string,
  fallback: string,
): string {
  const v = payload?.[key];
  if (typeof v === "string" && v.trim().length > 0) return v;
  return fallback;
}
