import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ArrowRight, Sparkles, Loader2, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getOrder } from "@/lib/checkout.functions";
import { buildCartMessage, waLink, TYPICAL_REPLY } from "@/lib/whatsapp";

const search = z.object({ order: z.string().uuid() });

export const Route = createFileRoute("/checkout/success")({
  validateSearch: search.parse,
  component: SuccessPage,
  head: () => ({ meta: [{ title: "Order Received — NovaMarket" }] }),
});

type Order = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  contact_email: string | null;
  contact_name: string | null;
  items: unknown;
};

function SuccessPage() {
  const { order: orderId } = Route.useSearch();
  const get = useServerFn(getOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const o = (await get({ data: { orderId } })) as Order;
        setOrder(o);
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
  if (!order) {
    return (
      <Shell>
        <div className="mx-auto mt-16 max-w-md rounded-3xl glass-strong p-8 text-center">
          <h2 className="text-2xl font-bold">Order not found</h2>
          <Link to="/products" className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold">
            Browse marketplace
          </Link>
        </div>
      </Shell>
    );
  }

  const items = Array.isArray(order.items)
    ? (order.items as Array<{ name: string; qty: number; price: number; id: string }>)
    : [];

  const waMessage = buildCartMessage(
    items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    Number(order.total),
    order.order_number,
    { name: order.contact_name, email: order.contact_email },
  );

  return (
    <Shell>
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl glass-strong p-8 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400/40 to-emerald-600/40 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
          </div>
          <h1 className="mt-5 text-3xl font-bold">
            Order <span className="text-gradient">Received</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Order <span className="font-mono text-white/80">{order.order_number}</span> · status <span className="font-semibold text-amber-300">{order.status}</span>
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
            Continue on WhatsApp to finalize payment. Our team will manually verify and activate your products within minutes.
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Pill icon={<Clock className="h-3.5 w-3.5" />} text={TYPICAL_REPLY} />
            <Pill icon={<ShieldCheck className="h-3.5 w-3.5" />} text="Manual verification" />
            <Pill icon={<Sparkles className="h-3.5 w-3.5" />} text="Instant activation" />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a
              href={waLink(waMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              <MessageCircle className="h-4 w-4" /> Continue on WhatsApp
            </a>
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center gap-2 rounded-xl glass-strong px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Track order <ArrowRight className="h-4 w-4" />
            </Link>
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

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl glass px-3 py-2 text-xs text-white/70">
      <span className="text-emerald-400">{icon}</span> {text}
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
