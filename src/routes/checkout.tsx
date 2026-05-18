import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight, ShieldCheck, Lock, Tag, Loader2, CheckCircle2, Sparkles, MessageCircle, Clock, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import { validateCoupon, createWhatsappOrder } from "@/lib/checkout.functions";
import { buildCartMessage, waLink, TYPICAL_REPLY, SUPPORT_HOURS } from "@/lib/whatsapp";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "WhatsApp Checkout — NovaMarket" }] }),
});

function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const validate = useServerFn(validateCoupon);
  const create = useServerFn(createWhatsappOrder);

  const [name, setName] = useState(user?.user_metadata?.display_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [country, setCountry] = useState("India");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);

  const subtotal = useMemo(
    () => Number(cart.items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)),
    [cart.items],
  );
  const discount = applied?.discount ?? 0;
  const tax = useMemo(() => Number(((subtotal - discount) * 0.05).toFixed(2)), [subtotal, discount]);
  const total = useMemo(() => Number((subtotal - discount + tax).toFixed(2)), [subtotal, discount, tax]);

  if (!user) {
    return (
      <Shell>
        <div className="mx-auto mt-16 max-w-md rounded-3xl glass-strong p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-secondary" />
          <h2 className="mt-3 text-2xl font-bold">Sign in to checkout</h2>
          <p className="mt-1 text-sm text-white/60">You need an account to place a WhatsApp order.</p>
          <Link to="/login" className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold glow-primary">
            Continue to login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </Shell>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Shell>
        <div className="mx-auto mt-16 max-w-md rounded-3xl glass-strong p-8 text-center">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <Link to="/products" className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold">
            Browse marketplace
          </Link>
        </div>
      </Shell>
    );
  }

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setCouponBusy(true);
    try {
      const res = await validate({ data: { code: coupon.trim(), subtotal } });
      if (!res.ok) {
        toast.error(res.message);
        setApplied(null);
      } else {
        setApplied({ code: res.code, discount: res.discount });
        toast.success(`Coupon ${res.code} applied — saved $${res.discount}`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCouponBusy(false);
    }
  }

  async function placeOrder() {
    setBusy(true);
    try {
      const res = await create({
        data: {
          items: cart.items,
          couponCode: applied?.code,
          contactName: name,
          contactEmail: email,
          country,
          notes: notes || undefined,
        },
      });
      const msg = buildCartMessage(
        cart.items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        total,
        res.order.order_number,
        { name, email },
      );
      // Open WhatsApp
      window.open(waLink(msg), "_blank", "noopener");
      cart.clear();
      toast.success("Order created — continue on WhatsApp");
      navigate({ to: "/checkout/success", search: { order: res.order.id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-bold">
          WhatsApp <span className="text-gradient">Checkout</span>
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Place your order and complete the purchase securely with our team on WhatsApp.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* LEFT */}
          <div className="space-y-5">
            <Section title="Contact details" icon={<CheckCircle2 className="h-4 w-4 text-success" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Full name" value={name} onChange={setName} />
                <Input label="Email address" value={email} onChange={setEmail} type="email" />
                <Input label="Country" value={country} onChange={setCountry} className="sm:col-span-2" />
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-white/60">Notes for our team (optional)</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Anything we should know about your order…"
                    className="mt-1 w-full rounded-xl glass px-3 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2"
                  />
                </label>
              </div>
            </Section>

            <Section title="How it works" icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}>
              <ol className="grid gap-3 sm:grid-cols-3">
                {[
                  { n: 1, t: "Click Buy on WhatsApp", d: "Order summary auto-fills in chat" },
                  { n: 2, t: "Confirm with our team", d: "Payment details shared securely" },
                  { n: 3, t: "Instant activation", d: "Access delivered to your dashboard" },
                ].map((s) => (
                  <li key={s.n} className="rounded-2xl glass p-4">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold">
                      {s.n}
                    </div>
                    <p className="mt-3 text-sm font-semibold">{s.t}</p>
                    <p className="mt-1 text-xs text-white/60">{s.d}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Badge icon={<Zap className="h-3.5 w-3.5" />} text="Instant activation" />
                <Badge icon={<ShieldCheck className="h-3.5 w-3.5" />} text="Manual verification" />
                <Badge icon={<Clock className="h-3.5 w-3.5" />} text={TYPICAL_REPLY} />
              </div>
            </Section>

            <Section title="Order items" icon={<Sparkles className="h-4 w-4 text-secondary" />}>
              <ul className="space-y-2">
                {cart.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 rounded-xl glass p-3">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${it.gradient} text-sm font-bold`}>
                      {it.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{it.name}</p>
                      <p className="text-xs text-white/50">Qty {it.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-secondary">${(it.price * it.qty).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* RIGHT */}
          <aside className="h-fit space-y-4 rounded-3xl glass-strong p-6 lg:sticky lg:top-24">
            <p className="font-semibold">Order Summary</p>

            <div className="rounded-xl glass p-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-secondary" />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponBusy}
                  className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20 disabled:opacity-50"
                >
                  {couponBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : applied ? "Re-apply" : "Apply"}
                </button>
              </div>
              {applied && (
                <p className="mt-2 text-xs text-success">
                  ✓ {applied.code} — saved ${applied.discount.toFixed(2)}{" "}
                  <button onClick={() => { setApplied(null); setCoupon(""); }} className="ml-1 text-white/50 underline">remove</button>
                </p>
              )}
              <p className="mt-2 text-[10px] text-white/40">Try WELCOME10, FLASH25, SAVE5</p>
            </div>

            <div className="space-y-2 text-sm">
              <Row label={`Subtotal (${cart.count} items)`} value={`$${subtotal.toFixed(2)}`} />
              {discount > 0 && <Row label="Discount" value={`-$${discount.toFixed(2)}`} accent="text-success" />}
              <Row label="Tax (5%)" value={`$${tax.toFixed(2)}`} />
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="text-gradient">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={busy || !name || !email}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-sm font-semibold shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {busy ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating order…</>
              ) : (
                <><MessageCircle className="h-4 w-4" /> Buy on WhatsApp · ${total.toFixed(2)}</>
              )}
            </button>

            <p className="text-center text-[11px] text-white/50">
              {SUPPORT_HOURS}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {["Trusted", "Verified", "Instant"].map((b) => (
                <div key={b} className="rounded-lg glass px-2 py-1.5 text-center text-[10px] font-semibold text-white/60">
                  {b}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </Shell>
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

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl glass-strong p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-white/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl glass px-3 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2"
      />
    </label>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl glass px-3 py-2 text-xs text-white/70">
      <span className="text-emerald-400">{icon}</span> {text}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`flex justify-between ${accent ?? "text-white/70"}`}>
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
