import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Reset Password — NovaMarket" }] }),
});

function ForgotPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) return toast.error(error);
    setSent(true);
    toast.success("Reset link sent! Check your email.");
  };

  return (
    <AuthLayout
      title={sent ? "Check your email" : "Forgot password?"}
      subtitle={sent ? "We sent a reset link to your email." : "Enter your email and we'll send a reset link."}
      footer={<Link to="/login" className="text-gradient font-semibold">Back to sign in</Link>}
    >
      {!sent && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl glass border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary/60" />
          </div>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send reset link
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
