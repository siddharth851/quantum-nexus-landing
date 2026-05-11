import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { EmptyState } from "@/components/site/EmptyState";
import { useCart } from "@/store/cart";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart — NovaMarket" }] }),
});

function CartPage() {
  const cart = useCart();

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="pt-6">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-4xl font-bold">Shopping <span className="text-gradient">Cart</span></h1>
          {cart.items.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={ShoppingBag}
                title="Your cart is empty"
                description="Discover premium AI tools, subscriptions and digital products."
                action={
                  <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold">
                    Browse Marketplace <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <ul className="space-y-3">
                {cart.items.map((it) => (
                  <li key={it.id} className="flex gap-4 rounded-2xl glass-strong p-4">
                    <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${it.gradient} font-bold text-white/95`}>
                      {it.initials}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <Link to="/product/$slug" params={{ slug: it.slug }} className="font-semibold hover:text-secondary">
                        {it.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="font-bold">${it.price}</span>
                        {it.original > it.price && <span className="text-xs text-white/40 line-through">${it.original}</span>}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-1 rounded-lg glass px-1 py-0.5">
                          <button onClick={() => cart.setQty(it.id, it.qty - 1)} className="grid h-7 w-7 place-items-center rounded hover:bg-white/10">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                          <button onClick={() => cart.setQty(it.id, it.qty + 1)} className="grid h-7 w-7 place-items-center rounded hover:bg-white/10">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-secondary">${(it.price * it.qty).toFixed(2)}</span>
                          <button onClick={() => cart.remove(it.id)} className="text-white/50 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="h-fit rounded-2xl glass-strong p-6">
                <p className="font-semibold">Order Summary</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal ({cart.count} items)</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  {cart.savings > 0 && (
                    <div className="flex justify-between text-success">
                      <span>You save</span>
                      <span>-${cart.savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gradient">${cart.subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-6 py-3.5 text-sm font-semibold glow-primary">
                  Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
