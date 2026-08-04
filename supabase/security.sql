-- Cropsphere.ai — security migration
-- Run this ONCE in Supabase Dashboard -> SQL Editor, against an existing install.
-- (supabase/schema.sql already contains these rules for a fresh install.)
--
-- WHAT THIS FIXES
-- The original policies granted every write to `auth.role() = 'authenticated'`,
-- which means *any* Supabase user in the project — including anyone who signs
-- up, if signup is enabled — could rewrite all site content, delete every post,
-- and overwrite or delete any file in the public images bucket.
-- After this migration, writes require membership of an explicit `admin_users`
-- allowlist that can only be changed from the SQL editor.
--
-- ⚠ BEFORE YOU RUN IT: edit the email in STEP 5 to your own admin address.
-- If you skip that step you will lock yourself out of the admin portal.
-- (Recovery is always possible — the SQL editor runs as service_role and
-- bypasses RLS entirely, so you can re-run STEP 5 at any time.)

begin;

-- ---------------------------------------------------------------------------
-- STEP 1 — the allowlist
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- ---------------------------------------------------------------------------
-- STEP 2 — the helper every policy is built on
-- ---------------------------------------------------------------------------
-- `security definer` is load-bearing, not decoration. admin_users has RLS
-- enabled and its own SELECT policy calls is_admin(); without security definer
-- the function's read would be filtered by that policy, calling itself forever.
-- Running as the owner bypasses RLS and breaks the cycle.
--
-- `set search_path = public, pg_temp` is mandatory on any security definer
-- function: without it a caller can prepend a schema to search_path and have
-- the function resolve `admin_users` to a table they control.
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

-- Admins may see the allowlist. Nobody can modify it from the client: there is
-- deliberately no INSERT/UPDATE/DELETE policy, so with RLS on, all writes are
-- refused and membership can only be granted here in the SQL editor.
drop policy if exists "admins read allowlist" on admin_users;
create policy "admins read allowlist" on admin_users
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- STEP 3 — table policies
-- ---------------------------------------------------------------------------
-- Public read policies are intentionally left untouched: the anonymous site
-- depends on them. Only the write side changes.
alter table posts        enable row level security;
alter table team_members enable row level security;
alter table site_content enable row level security;

-- The original, over-permissive policies.
drop policy if exists "admin all posts"   on posts;
drop policy if exists "admin all team"    on team_members;
drop policy if exists "admin all content" on site_content;

-- This file's own policy names, dropped too so the whole script can be re-run
-- safely — otherwise a second run fails with "policy already exists" before it
-- reaches STEP 5, which is where you add another admin.
drop policy if exists "admin write posts"   on posts;
drop policy if exists "admin write team"    on team_members;
drop policy if exists "admin write content" on site_content;

create policy "admin write posts" on posts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin write team" on team_members
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin write content" on site_content
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- STEP 4 — storage policies
-- ---------------------------------------------------------------------------
-- The originals allowed any authenticated user to update or delete ANY object
-- in the bucket, with no ownership check at all.
drop policy if exists "admin upload images" on storage.objects;
drop policy if exists "admin update images" on storage.objects;
drop policy if exists "admin delete images" on storage.objects;

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

-- ---------------------------------------------------------------------------
-- STEP 5 — grant yourself admin  ⚠ EDIT THE EMAIL BELOW
-- ---------------------------------------------------------------------------
insert into admin_users (user_id, email)
select id, email from auth.users
where email in ('tccgroup2025@gmail.com', 'shifanabs55@gmail.com')   -- <<< change to your admin login
on conflict (user_id) do nothing;

commit;

-- ---------------------------------------------------------------------------
-- CHECK IT WORKED — should list exactly your admin account(s).
-- If this returns zero rows, STEP 5 matched no user: confirm the address in
-- Authentication -> Users, fix the email above, and re-run STEP 5 alone.
-- ---------------------------------------------------------------------------
select a.email, a.created_at from admin_users a;


-- ===========================================================================
-- OPTIONAL — require two-factor for every write (database-enforced MFA)
-- ===========================================================================
-- Run this ONLY after you have enrolled TOTP on /admin/security AND completed
-- at least one successful login with a code. Until a factor is enrolled your
-- session is aal1, so applying this early locks the portal for everyone.
-- To undo, re-run the STEP 2 version of is_admin() above.
--
-- create or replace function public.is_admin()
-- returns boolean
-- language sql
-- stable
-- security definer
-- set search_path = public, pg_temp
-- as $$
--   select exists (
--     select 1 from public.admin_users where user_id = (select auth.uid())
--   )
--   and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2';
-- $$;
