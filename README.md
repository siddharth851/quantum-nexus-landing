# NovaMarket — Premium Digital Marketplace

Futuristic premium marketplace built with TanStack Start + Vite + React + Supabase.

## Local development

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

- Copy `.env.example` → `.env`
- Fill in Supabase keys

3) Start dev server

```bash
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Environment variables

- **Client**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Server**: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
- **Server-only**: `SUPABASE_SERVICE_ROLE_KEY` (never expose to the browser)

## Deploy on Vercel

This app is **TanStack Start** (SSR + server functions), not a static SPA. Vercel sets `VERCEL=1` during build; the Vite config then:

- Disables the **Cloudflare Workers** plugin (incompatible with Vercel’s runtime).
- Enables **Nitro** (`nitro/vite`), which emits `.vercel/output` for Vercel’s platform.

### Vercel project settings

- **Node.js**: **22.x** (matches `@tanstack/react-start` engine and Nitro’s Vercel preset).
- **Install command**: `npm install` (default).
- **Build command**: `npm run build` (default).
- **Output**: Produced automatically by Nitro (do **not** set “Output Directory” to `dist` manually).

To simulate a Vercel build locally: `VERCEL=1 npm run build` (writes `.vercel/output/`).

### Environment variables (Vercel → Settings → Environment Variables)

Add the same keys as in `.env.example` for **Production**, **Preview**, and **Development** as needed:

| Name | Environments | Notes |
|------|----------------|-------|
| `VITE_SUPABASE_URL` | All | Exposed to the browser bundle |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | All | Public anon key |
| `SUPABASE_URL` | All | Used during SSR |
| `SUPABASE_PUBLISHABLE_KEY` | All | Same project; server-side reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Production only (recommended) | **Secret** — never expose to client |

Do **not** use a SPA-style `rewrites` rule that sends every path to `/index.html`; that breaks SSR and deep links for TanStack Start.

### Cloudflare / Wrangler (local or non-Vercel builds)

The default `npm run build` still targets **Cloudflare** via `@cloudflare/vite-plugin`. Wrangler logs are written under `./.wrangler` in the repo (`WRANGLER_HOME`) so builds work in restricted CI environments.
