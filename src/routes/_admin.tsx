import { createFileRoute, Outlet, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Layers,
  Image as ImageIcon,
  Settings,
  Sparkles,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin, claimFirstAdmin } from "@/hooks/use-admin";
import { AuroraBackground } from "@/components/site/AuroraBackground";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/homepage", label: "Homepage CMS", icon: ImageIcon },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      router.navigate({ to: "/login", search: { redirect: location.pathname } });
    }
  }, [authLoading, user, router, location.pathname]);

  if (authLoading || adminLoading) {
    return (
      <div className="relative min-h-screen">
        <AuroraBackground />
        <div className="relative z-10 grid min-h-screen place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen">
        <AuroraBackground />
        <div className="relative z-10 grid min-h-screen place-items-center px-4">
          <div className="w-full max-w-md rounded-3xl glass-strong p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent glow-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
            <p className="mt-2 text-sm text-white/60">
              Your account doesn’t have admin privileges yet. If you’re the workspace owner, claim
              admin to set up the marketplace.
            </p>
            <button
              onClick={async () => {
                try {
                  const ok = await claimFirstAdmin();
                  if (ok) {
                    toast.success("You are now admin. Reloading…");
                    setTimeout(() => window.location.reload(), 600);
                  } else {
                    toast.error("Admin already exists. Ask an admin to grant access.");
                  }
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Could not claim admin");
                }
              }}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold glow-primary"
            >
              Claim admin (first user only)
            </button>
            <div className="mt-3">
              <Link to="/" className="text-xs text-white/50 hover:text-white">
                ← Back to site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-6 lg:flex-row">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong h-fit w-full shrink-0 rounded-3xl p-5 lg:sticky lg:top-6 lg:w-64"
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">
                Nova<span className="text-gradient">Admin</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-white/50">
                Control center
              </p>
            </div>
          </Link>
          <div className="my-5 h-px bg-white/10" />
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? "bg-gradient-to-r from-primary/30 to-accent/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
            <div className="my-3 h-px bg-white/10" />
            <button
              onClick={async () => {
                await signOut();
                toast.success("Signed out");
                router.navigate({ to: "/" });
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </motion.aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
