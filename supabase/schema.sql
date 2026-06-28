-- ─────────────────────────────────────────────────────────────
-- Reinita Larue narration site — initial schema
-- Run in Supabase SQL editor or via `supabase db push` if you wire up the CLI.
-- ─────────────────────────────────────────────────────────────

-- DEMOS
create table if not exists public.demos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  genre        text not null,
  character    text,
  description  text,
  audio_url    text not null,
  r2_key       text,
  duration_seconds  integer,
  sort_order   integer default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists demos_published_idx on public.demos (published, sort_order);
create index if not exists demos_genre_idx on public.demos (genre);

-- INQUIRIES (contact form submissions)
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  project_type text not null,
  genre        text,
  deadline     text,
  message      text not null,
  source       text default 'contact_form',
  status       text default 'new',       -- new | read | replied | archived
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists inquiries_status_idx on public.inquiries (status, created_at desc);

-- NEWSLETTER SUBSCRIBERS
create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  status       text default 'pending',   -- pending | confirmed | unsubscribed
  source       text default 'site',
  confirmed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- RLS — turn it on everywhere; service-role client bypasses it for writes
alter table public.demos enable row level security;
alter table public.inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public read of published demos
create policy "Anyone can read published demos"
  on public.demos for select
  using (published = true);

-- No public read of inquiries or subscribers (only service role)
-- (No policies = locked down with RLS on)

-- ─────────────────────────────────────────────────────────────
-- Future: status board tables
-- When Reinita is ready for a private client area, add a "projects" table
-- here with columns for title, author, status, due dates, etc. Keep it
-- much more condensed than dmnarration.com — one table, one view.
-- ─────────────────────────────────────────────────────────────
