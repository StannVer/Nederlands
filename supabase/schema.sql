-- Nederlands: one row of progress per learner. Paste into Supabase → SQL Editor → Run.
-- Accounts are created by Stan (Authentication → Users → Add user); sign-up stays switched off
-- (Authentication → Sign In / Providers → "Allow new users to sign up": off).

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- A learner sees and changes only their own row; nobody else's.
drop policy if exists "own progress: read" on public.progress;
create policy "own progress: read" on public.progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "own progress: insert" on public.progress;
create policy "own progress: insert" on public.progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "own progress: update" on public.progress;
create policy "own progress: update" on public.progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
