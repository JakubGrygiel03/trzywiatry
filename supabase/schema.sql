-- Trzy Wiatry — schema for Supabase PostgreSQL
-- Run in the SQL editor after creating the project.

create extension if not exists "uuid-ossp";

create type product_domain as enum ('ceramika', 'drewno', 'warsztaty', 'formy');
create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled');
create type banner_type as enum ('promo', 'vacation', 'hidden');
create type post_status as enum ('draft', 'published', 'archived');

create table collections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text unique not null,
  description text,
  image_url text
);

create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text unique not null,
  description text not null,
  domain product_domain not null default 'ceramika',
  category text not null,
  sub_category text,
  capacity_ml int,
  collection_id uuid references collections(id) on delete set null,
  price_in_cents int not null,
  is_published boolean default false not null,
  is_bestseller boolean default false not null,
  images text[] default '{}' not null,
  care_instructions text,
  low_stock_threshold int default 2,
  meta_title text,
  meta_description text
);

create table product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  sku text unique not null,
  title text not null,
  price_in_cents int,
  stock_quantity int default 0 not null,
  is_available boolean default true not null
);

create table studio_settings (
  id int primary key default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  announcement_type banner_type default 'promo' not null,
  announcement_text text default 'Darmowa dostawa od 400 zł | Zapisz się i odbierz -15%' not null,
  promo_code text,
  vacation_start_date date,
  vacation_end_date date,
  vacation_dispatch_date date,
  free_shipping_threshold_cents int default 40000 not null,
  gift_wrap_price_cents int default 2000 not null,
  workshops_enabled boolean default false not null
);

create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  shipping_method text not null,
  shipping_cost_in_cents int default 0 not null,
  has_gift_wrapping boolean default false not null,
  gift_message text,
  gift_wrapping_cost_cents int default 0 not null,
  total_amount_in_cents int not null,
  discount_amount_cents int default 0 not null,
  discount_code text,
  status order_status default 'pending' not null,
  tracking_number text,
  tracking_url text,
  payment_id text,
  payment_provider text default 'p24'
);

create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  product_name text not null,
  unit_price_in_cents int not null,
  quantity int not null check (quantity > 0)
);

create table workshops (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text unique not null,
  description text not null,
  event_date timestamp with time zone not null,
  duration_hours numeric(3,1) not null,
  price_in_cents int not null,
  max_attendees int not null,
  is_published boolean default true not null
);

create table workshop_bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  workshop_id uuid references workshops(id) on delete cascade not null,
  order_id uuid references orders(id) on delete set null,
  attendee_name text not null,
  attendee_email text not null,
  attendee_phone text not null,
  seats_count int default 1 not null check (seats_count > 0),
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled'))
);

create table blog_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  status post_status default 'draft' not null,
  published_at timestamp with time zone,
  meta_title text,
  meta_description text
);

create table newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  source text default 'footer_discount_15'
);

create table b2b_inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_name text not null,
  nip text not null,
  contact_person text not null,
  email text not null,
  phone text not null,
  estimated_quantity text not null,
  message text not null,
  is_processed boolean default false not null
);

alter table products enable row level security;
alter table product_variants enable row level security;
alter table collections enable row level security;
alter table studio_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table workshops enable row level security;
alter table workshop_bookings enable row level security;
alter table blog_posts enable row level security;
alter table newsletter_subscribers enable row level security;
alter table b2b_inquiries enable row level security;

create policy "Public read published products" on products for select using (is_published = true);
create policy "Public read variants" on product_variants for select using (is_available = true);
create policy "Public read collections" on collections for select using (true);
create policy "Public read settings" on studio_settings for select using (true);
create policy "Public read published workshops" on workshops for select using (is_published = true);
create policy "Public read published posts" on blog_posts for select using (status = 'published');
create policy "Public insert newsletter" on newsletter_subscribers for insert with check (true);
create policy "Public insert B2B inquiries" on b2b_inquiries for insert with check (true);
create policy "User read own orders" on orders for select using (auth.uid() = user_id);
create policy "User read own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Admin full access products" on products for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
create policy "Admin full access variants" on product_variants for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
create policy "Admin full access collections" on collections for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
create policy "Admin full access settings" on studio_settings for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
create policy "Admin full access orders" on orders for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
create policy "Admin full access workshops" on workshops for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
create policy "Admin full access blog" on blog_posts for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
create policy "Admin full access b2b" on b2b_inquiries for all using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

insert into studio_settings (id, promo_code) values (1, 'WIOSNA') on conflict (id) do nothing;
