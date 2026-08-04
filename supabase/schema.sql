-- Cropsphere.ai site schema
-- Run this in Supabase Dashboard -> SQL Editor

-- News / newsletter posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text default '',
  content text default '',
  cover_url text default '',
  published boolean default false,
  created_at timestamptz default now()
);

-- Team members (and project supervisors, split by `category`)
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default '',
  bio text default '',
  photo_url text default '',
  sort_order int default 0,
  category text default 'member'   -- 'member' | 'supervisor'
);

-- Existing installs: run this once to add the column.
-- alter table team_members
--   add column if not exists category text default 'member';

-- Editable site content (hero text, about, features, steps, contact)
create table if not exists site_content (
  key text primary key,
  value jsonb not null
);

-- Explicit admin allowlist. Being logged in is NOT enough to write anything --
-- a user must also appear in this table, which can only be changed from the
-- Supabase SQL editor. See supabase/security.sql for the migration that brings
-- an existing install up to these rules, and SECURITY.md for the reasoning.
create table if not exists admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table posts enable row level security;
alter table team_members enable row level security;
alter table site_content enable row level security;
alter table admin_users enable row level security;

-- `security definer` is required: admin_users has RLS on and its SELECT policy
-- calls this function, so without it the function would recurse into itself.
-- `set search_path` stops a caller redirecting `admin_users` to a table of
-- their own.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Public (anonymous) can read published posts, team, and site content
create policy "public read published posts" on posts
  for select using (published = true);

create policy "public read team" on team_members
  for select using (true);

create policy "public read content" on site_content
  for select using (true);

-- Admins can read the allowlist. There is deliberately no write policy, so no
-- client can grant itself admin -- membership is SQL-editor only.
create policy "admins read allowlist" on admin_users
  for select using (public.is_admin());

-- Only allowlisted admins can write
create policy "admin write posts" on posts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin write team" on team_members
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin write content" on site_content
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Storage bucket for images (covers, team photos)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');

create policy "admin upload images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());

create policy "admin update images" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and public.is_admin())
  with check (bucket_id = 'images' and public.is_admin());

create policy "admin delete images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());

-- FINAL STEP for a fresh install: create your admin user in
-- Authentication -> Users, then add them here. Nobody can log into the admin
-- portal until this runs.
--
-- insert into admin_users (user_id, email)
-- select id, email from auth.users where email = 'you@example.com'
-- on conflict (user_id) do nothing;
