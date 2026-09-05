-- Supabase security baseline for the three tables used by the browser client.
-- Apply after confirming the columns/types in the project's current schema.
-- This file is intentionally separate from frontend JavaScript because A01/A07
-- controls must be enforced by the database, not trusted from the browser.

-- A01: Broken Access Control — users can only read/write their own records.
alter table if exists public.profiles enable row level security;
alter table if exists public.mastery enable row level security;
alter table if exists public.sessions enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = user_id);
create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = user_id);
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists mastery_select_own on public.mastery;
drop policy if exists mastery_insert_own on public.mastery;
drop policy if exists mastery_update_own on public.mastery;
create policy mastery_select_own
  on public.mastery for select
  using (auth.uid() = user_id);
create policy mastery_insert_own
  on public.mastery for insert
  with check (auth.uid() = user_id);
create policy mastery_update_own
  on public.mastery for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists sessions_select_own on public.sessions;
drop policy if exists sessions_insert_own on public.sessions;
create policy sessions_select_own
  on public.sessions for select
  using (auth.uid() = user_id);
create policy sessions_insert_own
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- Defense in depth: browser clients should never be able to delete another user's data.
revoke all on public.profiles from anon;
revoke all on public.mastery from anon;
revoke all on public.sessions from anon;

-- The browser client still needs authenticated access through the authenticated role.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.mastery to authenticated;
grant select, insert on public.sessions to authenticated;
