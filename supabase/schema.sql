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

-- Row Level Security
alter table posts enable row level security;
alter table team_members enable row level security;
alter table site_content enable row level security;

-- Public (anonymous) can read published posts, team, and site content
create policy "public read published posts" on posts
  for select using (published = true);

create policy "public read team" on team_members
  for select using (true);

create policy "public read content" on site_content
  for select using (true);

-- Logged-in admins (any authenticated user) can do everything
create policy "admin all posts" on posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin all team" on team_members
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin all content" on site_content
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for images (covers, team photos)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');

create policy "admin upload images" on storage.objects
  for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "admin update images" on storage.objects
  for update using (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "admin delete images" on storage.objects
  for delete using (bucket_id = 'images' and auth.role() = 'authenticated');
