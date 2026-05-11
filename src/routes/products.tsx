import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { ProductsExplorer } from "@/components/site/ProductsExplorer";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "All Products — NovaMarket" },
      { name: "description", content: "Browse, search and filter premium AI tools, subscriptions, courses and digital products." },
    ],
  }),
});

function ProductsPage() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="pt-6">
        <ProductsExplorer title="All Products" subtitle="Browse the full premium marketplace" />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
