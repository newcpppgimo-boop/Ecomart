# EcoMart (Next.js + Supabase)

Real auth, a real Postgres database, and a real cart/orders flow — the
static-HTML version you had before stored everything in `localStorage`
with no backend at all.

## What's in here

- **Auth** — Supabase Auth (email + password). Sign up, email confirm, log in.
- **Database** — Postgres via Supabase. Tables: `products`, `cart_items`,
  `orders`, `order_items`. See `supabase/schema.sql`.
- **Security** — Row Level Security policies so one user can never read or
  edit another user's cart/orders, enforced at the database level (not just
  in the app code).
- **API routes** — `app/api/products`, `app/api/cart`, `app/api/checkout`.

## 1. Create a Supabase project

1. Go to supabase.com → New project.
2. In the SQL Editor, paste and run everything in `supabase/schema.sql`.
   This creates the tables, RLS policies, and seeds 3 sample products.
3. In Project Settings → API, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret)

## 2. Local setup

```bash
cp .env.local.example .env.local
# fill in the three values above
npm install
npm run dev
```

Visit `http://localhost:3000` — it'll route you to `/login`.

## 3. Deploy to Vercel

```bash
vercel
```

Or connect the repo in the Vercel dashboard. Either way, add the same
three environment variables in **Project Settings → Environment Variables**
before your first deploy — the build will fail without them.

`SUPABASE_SERVICE_ROLE_KEY` should only ever be set as a server-side env
var (never `NEXT_PUBLIC_`-prefixed) — Vercel keeps it out of the browser
bundle automatically as long as you don't rename it.

## Known gaps to close before this is production-ready

- **Admin role**: `POST /api/products` currently only checks that *someone*
  is logged in, not that they're an admin. Add a `role` column (or use
  Supabase's `user_metadata`) and check it in that route before letting
  anyone add products.
- **Email confirmation**: Supabase requires email confirmation by default.
  Turn this off in Authentication → Settings during development if you want
  instant sign-up, but leave it on for a real launch.
- **Rate limiting / abuse protection**: none yet. Fine for a class project,
  not for public traffic.
- **Password reset**: the "Forgot password?" link is still a placeholder —
  wire it to `supabase.auth.resetPasswordForEmail()`.
