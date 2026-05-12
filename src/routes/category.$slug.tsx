import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { ProductsExplorer } from "@/components/site/ProductsExplorer";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/products";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const cat = cats.find((c) => c.slug === slug);

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="pt-6">
        <div className="mx-auto max-w-7xl px-4">
          <div
            className={`relative overflow-hidden rounded-3xl glass-strong p-8 md:p-12 ${cat ? `bg-gradient-to-br ${cat.gradient}` : ""}`}
          >
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Category
              </p>
              <h1 className="mt-2 text-4xl font-bold md:text-5xl">{cat?.name ?? slug}</h1>
              {cat?.description && <p className="mt-3 max-w-xl text-white/80">{cat.description}</p>}
            </div>
          </div>
        </div>
        <ProductsExplorer
          initialCategory={slug}
          title={cat?.name ?? "Category"}
          subtitle={cat?.description ?? undefined}
        />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
