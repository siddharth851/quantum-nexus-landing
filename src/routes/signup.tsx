import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Lock, User, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/site/AuthLayout";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create Account — NovaMarket" }] }),
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function SignupPage() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const sc = useMemo(() => strength(password), [password]);
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["bg-rose-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-400"];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");
    const parsed = schema.safeParse({ name, email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await signUp(parsed.data.email, parsed.data.password, parsed.data.name);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Account created! Check your email to verify.");
    nav({ to: "/login" });
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error(r.error.message || "Google sign-up failed");
  };

  return (
    <AuthLayout
      title="Join NovaMarket"
      subtitle="Create your account in seconds"
      footer={<>Already have an account? <Link to="/login" className="text-gradient font-semibold">Sign in</Link></>}
    >
      <button onClick={onGoogle} className="flex w-full items-center justify-center gap-3 rounded-xl glass border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/10">
        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.62 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.78 3.97 14.6 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.65 8.65-8.78 0-.59-.07-1.05-.3-1.12z"/></svg>
        Continue with Google
      </button>
      <div className="my-6 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field icon={User} type="text" placeholder="Full name" value={name} onChange={setName} />
        <Field icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
        <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />
        {password && (
          <div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i < sc ? colors[sc] : "bg-white/10"}`} />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-white/50">{labels[sc]}</p>
          </div>
        )}
        <Field icon={Lock} type="password" placeholder="Confirm password" value={confirm} onChange={setConfirm} />
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold shadow-[0_0_30px_rgba(168,85,247,0.45)] transition hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create Account
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }: { icon: any; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl glass border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary/60 focus:bg-white/10" />
    </div>
  );
}
