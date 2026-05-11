import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Zap, ShoppingCart, Heart, Check, ArrowLeft, Shield, Truck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductGridSkeleton } from "@/components/site/ProductSkeleton";
import { discountPercent, fetchProductBySlug, fetchRelatedProducts } from "@/lib/products";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const cart = useCart();
  const wishlist = useWishlist();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.category_slug, product?.slug],
    queryFn: () => fetchRelatedProducts(product!.category_slug, product!.slug, 6),
    enabled: !!product,
  });

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="pt-6">
        <div className="mx-auto max-w-7xl px-4">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to products
          </Link>

          {isLoading || !product ? (
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div className="aspect-square rounded-3xl bg-white/5" />
              <div className="space-y-3">
                <div className="h-8 w-2/3 rounded bg-white/10" />
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-3/4 rounded bg-white/5" />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className={`relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br ${product.gradient} glow-accent`}>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="text-9xl font-bold text-white/95 drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                        {product.initials}
                      </span>
                    </div>
                    {discountPercent(product) > 0 && (
                      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-success backdrop-blur">
                        -{discountPercent(product)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-xl bg-gradient-to-br ${product.gradient} opacity-60 transition hover:opacity-100`}
                      >
                        <div className="grid h-full place-items-center text-xl font-bold text-white/80">
                          {product.initials}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/category/$slug"
                      params={{ slug: product.category_slug }}
                      className="text-xs font-semibold uppercase tracking-widest capitalize text-secondary hover:underline"
                    >
                      {product.category_slug.replace(/-/g, " ")}
                    </Link>
                    {product.badge && (
                      <span className="rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-bold">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 text-4xl font-bold leading-tight">{product.name}</h1>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(Number(product.rating)) ? "fill-warning text-warning" : "text-white/20"}`}
                        />
                      ))}
                    </div>
                    <span className="text-white/60">
                      {Number(product.rating).toFixed(1)} · {product.review_count.toLocaleString()} reviews
                    </span>
                  </div>
                  <p className="mt-5 text-white/70">{product.long_description ?? product.description}</p>

                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gradient">${Number(product.discount_price)}</span>
                    {Number(product.original_price) > Number(product.discount_price) && (
                      <span className="text-lg text-white/40 line-through">${Number(product.original_price)}</span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => { cart.add(product); cart.open(); }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary px-5 py-3 text-sm font-semibold glow-primary"
                    >
                      <Zap className="h-4 w-4" /> Get Access Now
                    </button>
                    <button
                      onClick={() => { cart.add(product); toast.success("Added to cart"); }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl glass-strong px-5 py-3 text-sm font-semibold hover:bg-white/10"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                    <button
                      onClick={() => { wishlist.toggle(product.id); toast(wishlist.has(product.id) ? "Removed" : "Saved"); }}
                      className={`grid h-12 w-12 place-items-center rounded-xl glass-strong hover:bg-white/10 ${wishlist.has(product.id) ? "text-rose-400" : ""}`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`h-5 w-5 ${wishlist.has(product.id) ? "fill-rose-400" : ""}`} />
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
                    {[
                      { icon: Truck, label: "Instant delivery" },
                      { icon: Shield, label: "Secure checkout" },
                      { icon: BadgeCheck, label: "100% verified" },
                    ].map((it) => (
                      <div key={it.label} className="flex items-center gap-2 rounded-xl glass p-3">
                        <it.icon className="h-4 w-4 text-secondary" />
                        <span>{it.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl glass-strong p-5">
                    <p className="text-sm font-semibold">What's included</p>
                    <ul className="mt-3 space-y-2">
                      {(product.features as string[]).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {product.tags.map((t) => (
                        <span key={t} className="rounded-full glass px-3 py-1 text-xs text-white/70">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              <section className="mt-20">
                <h2 className="text-2xl font-bold">Related <span className="text-gradient">products</span></h2>
                <div className="mt-6">
                  {!related ? (
                    <ProductGridSkeleton count={6} />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                      {related.map((p) => (
                        <ProductCard key={p.id} p={p} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
