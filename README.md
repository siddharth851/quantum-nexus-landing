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

## Notes for future payments/admin

- Keep payment provider keys **server-only**.
- Implement payment/session creation in server routes or server functions.
- Treat `SUPABASE_SERVICE_ROLE_KEY` as an admin secret: use only in trusted server-side code.

