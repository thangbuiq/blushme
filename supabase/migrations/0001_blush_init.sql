-- Blush: per-user cycle data. Run once in the Supabase SQL editor
-- (Dashboard -> SQL Editor), or with `supabase db push`.
-- Row level security guarantees a user can only ever touch their own rows.

create table if not exists public.cycle_settings (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.cycle_settings enable row level security;
alter table public.daily_logs enable row level security;

drop policy if exists "own settings" on public.cycle_settings;
create policy "own settings" on public.cycle_settings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own logs" on public.daily_logs;
create policy "own logs" on public.daily_logs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Lets the app delete the signed-in user's account and all their data.
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
