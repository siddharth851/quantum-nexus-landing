import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, ShieldCheck, Lock, Tag, Loader2, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import { validateCoupon, createOrder, verifyRazorpayPayment } from "@/lib/checkout.functions";
import { loadRazorpay, loadCashfree } from "@/lib/payment-sdk";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — NovaMarket" }] }),
});

type Provider = "razorpay" | "cashfree";

function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const validate = useServerFn(validateCoupon);
  const create = useServerFn(createOrder);
  const verifyRzp = useServerFn(verifyRazorpayPayment);

  const [name, setName] = useState(user?.user_metadata?.display_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [country, setCountry] = useState("India");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [provider, setProvider] = useState<Provider>("razorpay");
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
          <p className="mt-1 text-sm text-white/60">You need an account to complete your purchase.</p>
          <Link
            to="/login"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold glow-primary"
          >
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

  async function pay() {
    setBusy(true);
    try {
      const res = await create({
        data: {
          items: cart.items,
          couponCode: applied?.code,
          provider,
          contactName: name,
          contactEmail: email,
          country,
        },
      });
      if (!res.configured) {
        toast.error(res.message ?? `${provider} not configured yet`);
        navigate({ to: "/checkout/failed", search: { order: res.order.id } });
        return;
      }

      if (res.provider === "razorpay") {
        await loadRazorpay();
        if (!window.Razorpay) throw new Error("Razorpay SDK failed to load");
        const rzp = new window.Razorpay({
          key: res.keyId,
          amount: Math.round(res.order.total * 100),
          currency: "INR",
          name: "NovaMarket",
          description: res.order.order_number,
          order_id: res.gatewayOrderId,
          prefill: { name, email },
          theme: { color: "#7c3aed" },
          handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await verifyRzp({
                data: {
                  orderId: res.order.id,
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                },
              });
              cart.clear();
              toast.success("Payment successful!");
              navigate({ to: "/checkout/success", search: { order: res.order.id } });
            } catch (e) {
              toast.error((e as Error).message);
              navigate({ to: "/checkout/failed", search: { order: res.order.id } });
            }
          },
          modal: {
            ondismiss: () => {
              toast.message("Payment cancelled");
              setBusy(false);
            },
          },
        });
        rzp.open();
        return;
      }

      // Cashfree
      await loadCashfree(res.mode === "live" ? "live" : "sandbox");
      if (!window.Cashfree) throw new Error("Cashfree SDK failed to load");
      const cashfree = window.Cashfree({ mode: res.mode === "live" ? "production" : "sandbox" });
      const result = await cashfree.checkout({
        paymentSessionId: res.paymentSessionId!,
        redirectTarget: "_modal",
      });
      if (result.error) {
        toast.error(result.error.message);
        navigate({ to: "/checkout/failed", search: { order: res.order.id } });
      } else {
        cart.clear();
        toast.success("Payment processed");
        navigate({ to: "/checkout/success", search: { order: res.order.id } });
      }
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
          Secure <span className="text-gradient">Checkout</span>
        </h1>
        <p className="mt-1 text-sm text-white/60">256-bit SSL encrypted • PCI-DSS compliant</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* LEFT */}
          <div className="space-y-5">
            <Section title="Contact details" icon={<CheckCircle2 className="h-4 w-4 text-success" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Full name" value={name} onChange={setName} />
                <Input label="Email address" value={email} onChange={setEmail} type="email" />
                <Input label="Country" value={country} onChange={setCountry} className="sm:col-span-2" />
              </div>
            </Section>

            <Section title="Payment method" icon={<CreditCard className="h-4 w-4 text-secondary" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProviderCard
                  active={provider === "razorpay"}
                  onClick={() => setProvider("razorpay")}
                  title="Razorpay"
                  desc="UPI, Cards, Wallets, Net Banking"
                  badge="Popular"
                />
                <ProviderCard
                  active={provider === "cashfree"}
                  onClick={() => setProvider("cashfree")}
                  title="Cashfree"
                  desc="UPI, Cards, Pay Later, EMI"
                  badge="Fast"
                />
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl glass p-3 text-xs text-white/60">
                <ShieldCheck className="h-4 w-4 text-success" />
                Your payment is secured with end-to-end encryption. We never store your card details.
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
              onClick={pay}
              disabled={busy || !name || !email}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-6 py-3.5 text-sm font-semibold glow-primary transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {busy ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Lock className="h-4 w-4" /> Pay ${total.toFixed(2)} securely</>
              )}
            </button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {["SSL", "PCI-DSS", "256-bit"].map((b) => (
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

function ProviderCard({ active, onClick, title, desc, badge }: { active: boolean; onClick: () => void; title: string; desc: string; badge: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
        active
          ? "bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 ring-2 ring-primary glow-primary"
          : "glass hover:bg-white/10"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-bold">{title}</p>
          <p className="mt-0.5 text-xs text-white/60">{desc}</p>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">{badge}</span>
      </div>
      {active && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-secondary">
          <CheckCircle2 className="h-3 w-3" /> Selected
        </div>
      )}
    </button>
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
