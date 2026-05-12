import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Camera, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Account Settings — NovaMarket" }] }),
});

function SettingsPage() {
  const { user, updatePassword } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [newPw, setNewPw] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: settings }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
      }
      if (settings) {
        setEmailNotif(settings.email_notifications);
        setMarketing(settings.marketing_emails);
      }
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio, avatar_url: avatarUrl })
      .eq("user_id", user.id);
    const { error: sErr } = await supabase
      .from("user_settings")
      .update({ email_notifications: emailNotif, marketing_emails: marketing })
      .eq("user_id", user.id);
    setLoading(false);
    if (pErr || sErr) return toast.error(pErr?.message || sErr?.message || "Save failed");
    toast.success("Settings saved");
  };

  const changePw = async () => {
    if (newPw.length < 8) return toast.error("Password must be at least 8 characters");
    setPwLoading(true);
    const { error } = await updatePassword(newPw);
    setPwLoading(false);
    if (error) return toast.error(error);
    setNewPw("");
    toast.success("Password updated");
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Account</p>
        <h1 className="mt-2 text-4xl font-bold">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="mt-2 text-white/60">Manage your profile and preferences.</p>
      </div>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-lg font-bold">Profile</h2>
        <div className="mt-5 flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold">
                {(displayName || user?.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white/10 backdrop-blur">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex-1">
            <Label>Avatar URL</Label>
            <Input value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Display name</Label>
            <Input value={displayName} onChange={setDisplayName} placeholder="Your name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email ?? ""} onChange={() => {}} placeholder="" disabled />
          </div>
        </div>
        <div className="mt-4">
          <Label>Bio</Label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-xl glass border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-primary/60"
          />
        </div>
        <div className="mt-5 space-y-3">
          <Toggle label="Email notifications" checked={emailNotif} onChange={setEmailNotif} />
          <Toggle label="Marketing emails" checked={marketing} onChange={setMarketing} />
        </div>
        <button
          onClick={saveProfile}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{" "}
          Save changes
        </button>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-lg font-bold">Change password</h2>
        <div className="mt-4 max-w-md">
          <Label>New password</Label>
          <Input type="password" value={newPw} onChange={setNewPw} placeholder="Min 8 characters" />
          <button
            onClick={changePw}
            disabled={pwLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {pwLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}{" "}
            Update password
          </button>
        </div>
      </section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
      {children}
    </label>
  );
}
function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl glass border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-primary/60 disabled:opacity-50"
    />
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl glass border border-white/10 px-4 py-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-gradient-to-r from-primary to-accent" : "bg-white/10"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}
