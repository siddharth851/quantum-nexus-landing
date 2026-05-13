import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Download, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { z } from "zod";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getOrder, verifyCashfreePayment } from "@/lib/checkout.functions";
import { useCart } from "@/store/cart";

const search = z.object({ order: z.string().uuid() });

export const Route = createFileRoute("/checkout/success")({
  validateSearch: search.parse,
  component: SuccessPage,
  head: () => ({ meta: [{ title: "Order Successful — NovaMarket" }] }),
});

type Order = {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  payment_method: string | null;
  payment_status: string;
  items: unknown;
};

function SuccessPage() {
  const { order: orderId } = Route.useSearch();
  const get = useServerFn(getOrder);
  const verifyCf = useServerFn(verifyCashfreePayment);
  const cart = useCart();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let o = (await get({ data: { orderId } })) as Order;
        // Auto-verify cashfree when redirected back from gateway
        if (o.payment_method === "cashfree" && o.payment_status !== "paid") {
          await verifyCf({ data: { orderId } });
          o = (await get({ data: { orderId } })) as Order;
        }
        setOrder(o);
        if (o.payment_status === "paid") cart.clear();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <Shell>
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Shell>
    );
  }

  if (!order || order.payment_status !== "paid") {
    return (
      <Shell>
        <div className="mx-auto mt-16 max-w-md rounded-3xl glass-strong p-8 text-center">
          <h2 className="text-2xl font-bold">Payment not confirmed</h2>
          <p className="mt-2 text-sm text-white/60">We couldn't verify this payment yet.</p>
          <button
            onClick={() => navigate({ to: "/checkout/failed", search: { order: orderId } })}
            className="mt-5 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold"
          >
            View details
          </button>
        </div>
      </Shell>
    );
  }

  const items = Array.isArray(order.items) ? (order.items as Array<{ name: string; qty: number; price: number }>) : [];

  function downloadInvoice() {
    if (!order) return;
    const lines = [
      `NovaMarket Invoice`,
      `Order: ${order.order_number}`,
      `Status: PAID`,
      ``,
      ...items.map((i) => `- ${i.name} x${i.qty}  $${(i.price * i.qty).toFixed(2)}`),
      ``,
      `Subtotal: $${order.subtotal}`,
      `Discount: -$${order.discount}`,
      `Tax: $${order.tax}`,
      `Total: $${order.total}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.order_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell>
      <Confetti />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl glass-strong p-8 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-success/30 to-primary/30 glow-primary">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="mt-5 text-3xl font-bold">
            Payment <span className="text-gradient">Successful</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Order <span className="font-mono text-white/80">{order.order_number}</span> is confirmed
          </p>
          <p className="mt-4 text-4xl font-bold text-gradient">${order.total}</p>

          <div className="mt-6 space-y-2 rounded-2xl glass p-4 text-left text-sm">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-white/70">{it.name} ×{it.qty}</span>
                <span className="font-semibold">${(it.price * it.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl glass p-3 text-left text-xs text-white/70">
            <Sparkles className="mr-2 inline h-3 w-3 text-secondary" />
            Your products are now available in your dashboard library.
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to="/dashboard/purchases"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold glow-primary"
            >
              View library <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={downloadInvoice}
              className="inline-flex items-center gap-2 rounded-xl glass-strong px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              <Download className="h-4 w-4" /> Invoice
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl glass-strong px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 60 });
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const colors = ["#7c3aed", "#06b6d4", "#ec4899", "#22c55e", "#f59e0b"];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 2 + Math.random() * 1.8;
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute top-[-20px] block h-2 w-2 rounded-sm"
            style={{
              left: `${left}%`,
              background: color,
              animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="pt-6">{children}</main>
      <Footer />
    </div>
  );
}
