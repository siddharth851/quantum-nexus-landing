import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { XCircle, RotateCcw, ShoppingBag, LifeBuoy } from "lucide-react";
import { z } from "zod";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

const search = z.object({ order: z.string().uuid().optional() }).partial();

export const Route = createFileRoute("/checkout/failed")({
  validateSearch: search.parse,
  component: FailedPage,
  head: () => ({ meta: [{ title: "Payment Failed — NovaMarket" }] }),
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
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-destructive/40 to-accent/30">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="mt-5 text-3xl font-bold">Payment <span className="text-gradient">Failed</span></h1>
            <p className="mt-2 text-sm text-white/60">
              We couldn't process your payment. No amount has been charged.
            </p>
            {order && (
              <p className="mt-2 font-mono text-xs text-white/40">Reference: {order}</p>
            )}

            <div className="mt-6 rounded-xl glass p-4 text-left text-xs text-white/70">
              <p className="font-semibold text-white/90">Common reasons</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Insufficient balance or card limit</li>
                <li>Bank declined the transaction</li>
                <li>Network interruption during payment</li>
                <li>Payment gateway temporarily unavailable</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold glow-primary"
              >
                <RotateCcw className="h-4 w-4" /> Retry payment
              </button>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 rounded-xl glass-strong px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
              >
                <ShoppingBag className="h-4 w-4" /> Back to cart
              </Link>
              <a
                href="mailto:support@novamarket.com"
                className="inline-flex items-center gap-2 rounded-xl glass-strong px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
              >
                <LifeBuoy className="h-4 w-4" /> Contact support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
