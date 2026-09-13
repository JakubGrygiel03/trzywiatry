-- Trzy Wiatry — run this if you already applied the older schema.sql
-- Safe to run more than once (IF NOT EXISTS / ON CONFLICT).

alter table studio_settings
  add column if not exists hero_slots jsonb default '[]'::jsonb not null,
  add column if not exists shop_hub_uzytkowa_image text,
  add column if not exists shop_hub_pracownia_image text,
  add column if not exists newsletter_enabled boolean default true not null,
  add column if not exists newsletter_eyebrow text default 'Newsletter' not null,
  add column if not exists newsletter_title text default '−15% na pierwsze naczynie' not null,
  add column if not exists newsletter_body text default 'Kod {code} przychodzi mailem.' not null,
  add column if not exists newsletter_form_label text default 'Podaj e-mail' not null,
  add column if not exists newsletter_button_label text default 'Odbierz −15%';

alter table product_variants
  add column if not exists color text,
  add column if not exists color_hex text,
  add column if not exists capacity_ml int,
  add column if not exists image text;

alter table products
  add column if not exists related_ids text[] default '{}' not null;

alter table blog_posts
  add column if not exists cover_backdrop text,
  add column if not exists author text,
  add column if not exists subtitle text,
  add column if not exists category text,
  add column if not exists blocks jsonb;

alter table workshops
  add column if not exists booked_seats int default 0 not null,
  add column if not exists location text,
  add column if not exists image_url text;

-- Replace campaign-specific copy with tokens the UI interpolates.
update studio_settings
set announcement_text = 'Darmowa dostawa od {freeShipping}  ·  Newsletter: −15%'
where id = 1
  and announcement_text ilike '%wiosna%';

create table if not exists site_components (
  key text primary key,
  label text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint site_components_key_format check (key ~ '^[a-z][a-z0-9_]*$')
);

alter table site_components enable row level security;

drop policy if exists "Public read site components" on site_components;
create policy "Public read site components" on site_components for select using (true);

drop policy if exists "Admin full access site components" on site_components;
create policy "Admin full access site components" on site_components for all
  using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Seed from whatever is already in studio_settings (promo code stays a value, not a template).
insert into site_components (key, label, payload)
select
  'announcement_bar',
  'Pasek ogłoszeń',
  jsonb_build_object(
    'type', announcement_type,
    'text', announcement_text,
    'vacationStartDate', vacation_start_date,
    'vacationEndDate', vacation_end_date,
    'vacationDispatchDate', vacation_dispatch_date
  )
from studio_settings
where id = 1
on conflict (key) do nothing;

insert into site_components (key, label, payload)
select
  'newsletter_cta',
  'Belka newslettera',
  jsonb_build_object(
    'enabled', coalesce(newsletter_enabled, true),
    'eyebrow', coalesce(newsletter_eyebrow, 'Newsletter'),
    'title', coalesce(newsletter_title, '−15% na pierwsze naczynie'),
    'body', coalesce(newsletter_body, 'Kod {code} przychodzi mailem.'),
    'formLabel', coalesce(newsletter_form_label, 'Podaj e-mail'),
    'buttonLabel', coalesce(newsletter_button_label, 'Odbierz −15%')
  )
from studio_settings
where id = 1
on conflict (key) do nothing;

insert into site_components (key, label, payload)
select
  'shop_hub',
  'Wejście do sklepu',
  jsonb_build_object(
    'uzytkowaImage', shop_hub_uzytkowa_image,
    'pracowniaImage', shop_hub_pracownia_image
  )
from studio_settings
where id = 1
on conflict (key) do nothing;

insert into site_components (key, label, payload)
values ('home_hero', 'Hero na stronie głównej', jsonb_build_object('slots', '[]'::jsonb))
on conflict (key) do nothing;

insert into site_components (key, label, payload)
select
  'checkout',
  'Kasa i koszyk',
  jsonb_build_object(
    'promoCode', promo_code,
    'freeShippingThresholdCents', free_shipping_threshold_cents,
    'giftWrapPriceCents', gift_wrap_price_cents
  )
from studio_settings
where id = 1
on conflict (key) do nothing;

insert into site_components (key, label, payload)
select
  'workshops',
  'Moduł warsztatów',
  jsonb_build_object('enabled', workshops_enabled)
from studio_settings
where id = 1
on conflict (key) do nothing;

insert into site_components (key, label, payload) values
  (
    'announcement_bar',
    'Pasek ogłoszeń',
    jsonb_build_object(
      'type', 'promo',
      'text', 'Darmowa dostawa od {freeShipping}  ·  Newsletter: −15%'
    )
  ),
  (
    'newsletter_cta',
    'Belka newslettera',
    jsonb_build_object(
      'enabled', true,
      'eyebrow', 'Newsletter',
      'title', '−15% na pierwsze naczynie',
      'body', 'Kod {code} przychodzi mailem. Zero spamu — nowe wypusty, kolekcje i przerwy twórcze.',
      'formLabel', 'Podaj e-mail',
      'buttonLabel', 'Odbierz −15%'
    )
  ),
  (
    'shop_hub',
    'Wejście do sklepu',
    jsonb_build_object(
      'uzytkowaImage', '/brand/photos/products/woo/czajniczek-w-kropki-zestaw-03.jpg',
      'pracowniaImage', '/brand/photos/products/woo/forma-gipsowa-c1-06.jpg'
    )
  ),
  (
    'checkout',
    'Kasa i koszyk',
    jsonb_build_object(
      'promoCode', null,
      'freeShippingThresholdCents', 30000,
      'giftWrapPriceCents', 2000
    )
  ),
  (
    'workshops',
    'Moduł warsztatów',
    jsonb_build_object('enabled', false)
  )
on conflict (key) do nothing;

create table if not exists email_templates (
  key text primary key,
  label text not null,
  trigger text not null,
  subject text not null,
  body text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table email_templates enable row level security;

drop policy if exists "Admin full access email templates" on email_templates;
create policy "Admin full access email templates" on email_templates for all
  using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

create table if not exists page_layouts (
  page_key text primary key,
  sections jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint page_layouts_key_format check (page_key ~ '^[a-z][a-z0-9_-]*$')
);

alter table page_layouts enable row level security;

drop policy if exists "Public read page layouts" on page_layouts;
create policy "Public read page layouts" on page_layouts for select using (true);

drop policy if exists "Admin full access page layouts" on page_layouts;
create policy "Admin full access page layouts" on page_layouts for all
  using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
