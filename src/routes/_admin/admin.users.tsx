import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ShieldOff, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader, Panel, inputCls, EmptyRow, btnGhost } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_admin/admin/users")({
  component: AdminUsers,
});

type Profile = Tables<"profiles">;

function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const refresh = async () => {
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
    ]);
    setUsers(profs ?? []);
    setAdminIds(new Set((roles ?? []).map((r) => r.user_id)));
  };
  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.display_name ?? "").toLowerCase().includes(q)
        );
      }),
    [users, search],
  );

  const updateStatus = async (u: Profile, status: "active" | "suspended" | "banned") => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success(`User ${status}`);
    refresh();
  };

  const toggleAdmin = async (u: Profile) => {
    const isAdmin = adminIds.has(u.user_id);
    if (isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin revoked");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.user_id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Admin granted");
    }
    refresh();
  };

  return (
    <>
      <PageHeader title="Users" subtitle={`${users.length} accounts`} />
      <Panel>
        <div className="mb-4 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className={`${inputCls} pl-9`} />
        </div>
        {filtered.length === 0 ? (
          <EmptyRow message="No users yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-white/40">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Joined</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => {
                  const isAdmin = adminIds.has(u.user_id);
                  return (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold">
                              {(u.display_name ?? u.email ?? "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{u.display_name ?? "—"}</p>
                            <p className="text-xs text-white/50">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-white/60">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${u.status === "active" ? "bg-emerald-500/15 text-emerald-300" : u.status === "suspended" ? "bg-amber-500/15 text-amber-300" : "bg-rose-500/15 text-rose-300"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                            <Star className="h-3 w-3" /> Admin
                          </span>
                        ) : (
                          <span className="text-xs text-white/40">User</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => toggleAdmin(u)} className={btnGhost} title={isAdmin ? "Revoke admin" : "Grant admin"}>
                            <Star className={`h-3.5 w-3.5 ${isAdmin ? "fill-primary text-primary" : ""}`} />
                          </button>
                          {u.status === "active" ? (
                            <button onClick={() => updateStatus(u, "suspended")} className={btnGhost} title="Suspend">
                              <ShieldOff className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => updateStatus(u, "active")} className={btnGhost} title="Activate">
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
