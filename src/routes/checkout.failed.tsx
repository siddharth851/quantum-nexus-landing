import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, RotateCcw, ShoppingBag, MessageCircle } from "lucide-react";
import { z } from "zod";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { waLink } from "@/lib/whatsapp";

const search = z.object({ order: z.string().uuid().optional() }).partial();

export const Route = createFileRoute("/checkout/failed")({
  validateSearch: search.parse,
  component: FailedPage,
  head: () => ({ meta: [{ title: "Order Issue — NovaMarket" }] }),
});

function FailedPage() {
  const { order } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="pt-6">
        <div className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-3xl glass-strong p-8 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-500/40 to-accent/30">
              <AlertCircle className="h-10 w-10 text-amber-300" />
            </div>
            <h1 className="mt-5 text-3xl font-bold">Something <span className="text-gradient">went wrong</span></h1>
            <p className="mt-2 text-sm text-white/60">
              We couldn't create your order. Don't worry — nothing has been charged.
            </p>
            {order && <p className="mt-2 font-mono text-xs text-white/40">Reference: {order}</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold glow-primary"
              >
                <RotateCcw className="h-4 w-4" /> Try again
              </button>
              <Link to="/cart" className="inline-flex items-center gap-2 rounded-xl glass-strong px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
                <ShoppingBag className="h-4 w-4" /> Back to cart
              </Link>
              <a
                href={waLink("Hello NovaMarket 👋 I'm having trouble placing my order.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" /> Chat with support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
