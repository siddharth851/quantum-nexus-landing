import { createFileRoute, Outlet, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, Heart, Settings, ShoppingBag, LogOut, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/purchases", label: "Purchased", icon: Package },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function AuthenticatedLayout() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({ to: "/login", search: { redirect: location.pathname } });
    }
  }, [user, loading, router, location.pathname]);

  if (loading || !user) {
    return (
      <div className="relative min-h-screen">
        <AuroraBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] gap-6 px-4 py-6 lg:flex-row flex-col">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong h-fit w-full shrink-0 rounded-3xl p-5 lg:sticky lg:top-6 lg:w-72"
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary glow-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Nova<span className="text-gradient">Market</span></span>
          </Link>
          <div className="my-5 h-px bg-white/10" />
          <div className="mb-4 flex items-center gap-3 rounded-2xl glass p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold">
              {(user.email ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.user_metadata?.display_name ?? user.email?.split("@")[0]}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
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
            <button onClick={handleLogout} className="mt-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </motion.aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
