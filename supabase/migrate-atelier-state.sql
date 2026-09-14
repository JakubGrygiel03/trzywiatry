-- Trzy Wiatry — jsonb snapshot for Vercel (catalog IDs are not UUIDs).
-- Service role only: no public SELECT (orders and password hashes live here).
-- Safe to run more than once.
--
-- After this runs, set on Vercel (Production + Preview):
--   NEXT_PUBLIC_SUPABASE_URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY
--   SUPABASE_SERVICE_ROLE_KEY
-- Then redeploy. Do not re-run the full schema.sql on an existing project.

create table if not exists atelier_state (
  key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint atelier_state_key_format check (key ~ '^[a-z][a-z0-9_]*$')
);

alter table atelier_state enable row level security;

-- Cookie-admin uses the service role, not a Supabase JWT. No public policies.
grant select, insert, update, delete on table atelier_state to service_role;
revoke all on table atelier_state from anon, authenticated, public;
