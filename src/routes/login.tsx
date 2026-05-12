import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/site/AuthLayout";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/dashboard" }),
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign In — NovaMarket" }] }),
});

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function LoginPage() {
  const { signIn } = useAuth();
  const search = Route.useSearch();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await signIn(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Welcome back!");
    nav({ to: search.redirect || "/dashboard" });
  };

  const onGoogle = async () => {
    setGLoading(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) {
      setGLoading(false);
      toast.error(r.error.message || "Google sign-in failed");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your premium experience"
      footer={
        <>Don't have an account? <Link to="/signup" className="text-gradient font-semibold">Create one</Link></>
      }
    >
      <button
        onClick={onGoogle}
        disabled={gLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl glass border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
      >
        {gLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.62 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.78 3.97 14.6 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.65 8.65-8.78 0-.59-.07-1.05-.3-1.12z"/></svg>
        )}
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
        <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-white/60 hover:text-white">Forgot password?</Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold shadow-[0_0_30px_rgba(168,85,247,0.45)] transition hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Sign In
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }: { icon: any; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl glass border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary/60 focus:bg-white/10"
      />
    </div>
  );
}
