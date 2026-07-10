// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Vercel sets VERCEL=1 during build. The Cloudflare Vite plugin targets Workers and conflicts
// with Vercel's runtime — disable it on Vercel and use Nitro (see https://vercel.com/docs/frameworks/full-stack/tanstack-start).
const isVercel = process.env.VERCEL === "1";

// Keep Wrangler state/logs under the repo so builds don't require a writable ~/Library (CI/sandbox).
if (!isVercel) {
  process.env.WRANGLER_HOME ??= path.join(projectRoot, ".wrangler");
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  plugins: isVercel ? [nitro()] : [],
  tanstackStart: {
    server: { entry: "server" },
  },
});

