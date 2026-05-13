import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { CartProvider } from "@/store/cart";
import { WishlistProvider } from "@/store/wishlist";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div className="relative w-full max-w-md rounded-3xl glass-strong p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">404</p>
        <h1 className="mt-3 text-3xl font-bold">
          Page <span className="text-gradient">not found</span>
        </h1>
        <p className="mt-2 text-sm text-white/60">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold glow-primary"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  if (import.meta.env.DEV) {
    console.error(error);
  }
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div className="relative w-full max-w-md rounded-3xl glass-strong p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-bold">This page didn’t load</h1>
        <p className="mt-2 text-sm text-white/60">
          You can try again, or go back home. If this keeps happening, it’s safe to refresh.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold glow-primary"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl glass-strong px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NovaMarket" },
      {
        name: "description",
        content: "A premium futuristic marketplace for curated digital products, tools, and subscriptions.",
      },
      { name: "theme-color", content: "#0B0F19" },
      { property: "og:title", content: "NovaMarket" },
      {
        property: "og:description",
        content: "A premium futuristic marketplace for curated digital products, tools, and subscriptions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NovaMarket" },
      { name: "description", content: "A premium, futuristic landing page for a digital marketplace selling AI tools, subscriptions, courses, and digital products." },
      { property: "og:description", content: "A premium, futuristic landing page for a digital marketplace selling AI tools, subscriptions, courses, and digital products." },
      { name: "twitter:description", content: "A premium, futuristic landing page for a digital marketplace selling AI tools, subscriptions, courses, and digital products." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a7164cdb-9594-4340-8ab8-048616942ac0/id-preview-fbe451e1--82870bab-05e8-43ea-98b3-8014d3d9f142.lovable.app-1778667183291.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a7164cdb-9594-4340-8ab8-048616942ac0/id-preview-fbe451e1--82870bab-05e8-43ea-98b3-8014d3d9f142.lovable.app-1778667183291.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Outlet />
            <CartDrawer />
            {mounted && <Toaster />}
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
