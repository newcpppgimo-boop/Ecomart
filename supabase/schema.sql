-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Products (public catalog)
-- ---------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Anyone (including logged-out visitors) can read the catalog.
create policy "Products are publicly readable"
  on products for select
  using (true);

-- Only the service role (used by admin API routes) can write.
-- No insert/update/delete policy is defined for regular users,
-- so RLS blocks them by default.

-- ---------------------------------------------------------------------
-- Cart items (one row per product per user, in-progress order)
-- ---------------------------------------------------------------------
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table cart_items enable row level security;

create policy "Users manage their own cart"
  on cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Orders + order line items (created at checkout, cart is cleared after)
-- ---------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10,2) not null,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Users manage their own orders"
  on orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  price numeric(10,2) not null,
  quantity int not null check (quantity > 0)
);

alter table order_items enable row level security;

create policy "Users see line items on their own orders"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Inserts to order_items happen via the service-role checkout API route,
-- which bypasses RLS, so no insert policy is needed here.

-- ---------------------------------------------------------------------
-- Seed a few products to start with
-- ---------------------------------------------------------------------
insert into products (name, price, image_url) values
  ('Eco Bag', 50.00, null),
  ('Reusable Bottle', 120.00, null),
  ('Repurposed Box Set', 80.00, null)
on conflict do nothing;
