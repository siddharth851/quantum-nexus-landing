import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { CursorGlow } from "@/components/site/CursorGlow";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Categories } from "@/components/site/Categories";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { FlashSale } from "@/components/site/FlashSale";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { TelegramCommunity } from "@/components/site/TelegramCommunity";
import { TrustStrip } from "@/components/site/TrustStrip";
import { useHomepageContent, sectionEnabled } from "@/lib/homepage-cms";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "NovaMarket — Premium AI Tools & Digital Products Marketplace" },
      {
        name: "description",
        content:
          "Buy premium AI tools, subscriptions, courses and digital products at the best prices. Instant delivery, 24/7 support, 4.9★ rated marketplace.",
      },
      { property: "og:title", content: "NovaMarket — Premium AI Tools & Digital Products" },
      {
        property: "og:description",
        content:
          "The world's most premium marketplace for AI tools, subscriptions, courses and digital products.",
      },
    ],
  }),
});

function Index() {
  const { data: cms } = useHomepageContent();
  const on = (k: string) => sectionEnabled(cms, k);
  return (
    <div className="relative min-h-screen text-foreground">
      <AuroraBackground />
      <CursorGlow />
      {on("announcement") && <AnnouncementBar />}
      <Navbar />
      <main>
        {on("hero") && <Hero />}
        {on("stats") && <Stats />}
        {on("categories") && <Categories />}
        {on("featured_products") && <FeaturedProducts />}
        {on("flash_sale") && <FlashSale />}
        <TrustStrip />
        {on("why_choose_us") && <WhyChooseUs />}
        {on("testimonials") && <Testimonials />}
        <TelegramCommunity />
        {on("faq") && <FAQ />}
        {on("newsletter") && <Newsletter />}
      </main>
      {on("footer") && <Footer />}
      <WhatsAppFab />
    </div>
  );
}
