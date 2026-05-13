import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Star, Zap, ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { discountPercent, type Product } from "@/lib/products";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const cart = useCart();
  const wishlist = useWishlist();

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[71] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl glass-strong glow-accent"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid md:grid-cols-2">
              <div
                className={`relative aspect-square bg-gradient-to-br ${product.gradient} md:aspect-auto`}
              >
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-7xl font-bold text-white/95 drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                    {product.initials}
                  </span>
                </div>
                {discountPercent(product) > 0 && (
                  <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-success backdrop-blur">
                    -{discountPercent(product)}% OFF
                  </div>
                )}
              </div>
              <div className="flex flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-widest capitalize text-secondary">
                  {product.category_slug.replace(/-/g, " ")}
                </span>
                <h2 className="mt-2 text-2xl font-bold leading-tight">{product.name}</h2>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {Number(product.rating).toFixed(1)} ({product.review_count} reviews)
                </div>
                <p className="mt-4 text-sm text-white/70">{product.description}</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gradient">
                    ${Number(product.discount_price)}
                  </span>
                  {Number(product.original_price) > Number(product.discount_price) && (
                    <span className="text-sm text-white/40 line-through">
                      ${Number(product.original_price)}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      cart.add(product);
                      onClose();
                      cart.open();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-5 py-3 text-sm font-semibold glow-primary"
                  >
                    <Zap className="h-4 w-4" /> Get Access Now
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        cart.add(product);
                        toast.success("Added to cart");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        wishlist.toggle(product.id);
                        toast(wishlist.has(product.id) ? "Removed" : "Saved");
                      }}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover:bg-white/10 ${wishlist.has(product.id) ? "text-rose-400" : ""}`}
                    >
                      <Heart
                        className={`h-4 w-4 ${wishlist.has(product.id) ? "fill-rose-400" : ""}`}
                      />{" "}
                      Wishlist
                    </button>
                  </div>
                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    onClick={onClose}
                    className="mt-1 inline-flex items-center justify-center gap-1 text-xs text-white/60 hover:text-white"
                  >
                    View full details <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
