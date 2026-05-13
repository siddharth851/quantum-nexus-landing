import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { EmptyState } from "./EmptyState";

export function CartDrawer() {
  const cart = useCart();

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cart.close}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col glass-strong"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent glow-primary">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Your Cart</p>
                  <p className="text-xs text-white/55">{cart.count} items</p>
                </div>
              </div>
              <button
                onClick={cart.close}
                className="grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  description="Add some premium digital products to get started."
                  action={
                    <Link
                      to="/products"
                      onClick={cart.close}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold"
                    >
                      Browse Marketplace <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {cart.items.map((it) => (
                    <li key={it.id} className="flex gap-3 rounded-2xl glass p-3">
                      <div
                        className={`grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${it.gradient} font-bold text-white/95`}
                      >
                        {it.initials}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/product/$slug"
                            params={{ slug: it.slug }}
                            onClick={cart.close}
                            className="line-clamp-1 text-sm font-semibold hover:text-secondary"
                          >
                            {it.name}
                          </Link>
                          <button
                            onClick={() => cart.remove(it.id)}
                            className="text-white/50 hover:text-destructive"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="font-bold">${it.price}</span>
                          {it.original > it.price && (
                            <span className="text-xs text-white/40 line-through">
                              ${it.original}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-lg glass-strong px-1 py-0.5">
                            <button
                              onClick={() => cart.setQty(it.id, it.qty - 1)}
                              className="grid h-6 w-6 place-items-center rounded hover:bg-white/10"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold">{it.qty}</span>
                            <button
                              onClick={() => cart.setQty(it.id, it.qty + 1)}
                              className="grid h-6 w-6 place-items-center rounded hover:bg-white/10"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-secondary">
                            ${(it.price * it.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t border-white/10 p-5">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  {cart.savings > 0 && (
                    <div className="flex justify-between text-success">
                      <span>You save</span>
                      <span>-${cart.savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold">
                    <span>Total</span>
                    <span className="text-gradient">${cart.subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={cart.close}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-6 py-3.5 text-sm font-semibold glow-primary transition hover:scale-[1.02]"
                >
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={cart.clear}
                  className="mt-2 w-full rounded-xl px-4 py-2 text-xs text-white/50 hover:text-white"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
