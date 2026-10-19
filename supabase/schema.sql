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

-- ---------------------------------------------------------------------------
-- Tasks ("opdrachten"): the learner prepares, then tells the teacher in person or sends a
-- recording; the teacher answers with written and/or spoken feedback.
-- ---------------------------------------------------------------------------

-- Who may read every submission and write feedback. Add the teacher's own account once:
--   insert into public.teachers (user_id) select id from auth.users where email = '<teacher e-mail>';
create table if not exists public.teachers (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.teachers enable row level security;
drop policy if exists "teachers: see self" on public.teachers;
create policy "teachers: see self" on public.teachers for select to authenticated using (auth.uid() = user_id);

create or replace function public.is_teacher() returns boolean
  language sql stable security definer set search_path = public
  as $$ select exists (select 1 from public.teachers where user_id = auth.uid()) $$;

create table if not exists public.task_submissions (
  id                  bigint generated always as identity primary key,
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  learner_email       text not null default (auth.jwt() ->> 'email'),
  theme               text not null,
  mode                text not null check (mode in ('in_person', 'recording')),
  notes               text,
  audio_path          text,
  created_at          timestamptz not null default now(),
  feedback_text       text,
  feedback_audio_path text,
  feedback_at         timestamptz,
  seen_at             timestamptz
);
alter table public.task_submissions enable row level security;

drop policy if exists "tasks: learner reads own" on public.task_submissions;
create policy "tasks: learner reads own" on public.task_submissions
  for select to authenticated using (auth.uid() = user_id or public.is_teacher());

drop policy if exists "tasks: learner submits" on public.task_submissions;
create policy "tasks: learner submits" on public.task_submissions
  for insert to authenticated with check (auth.uid() = user_id);

-- The learner may only mark feedback as seen; the teacher may write feedback.
drop policy if exists "tasks: update" on public.task_submissions;
create policy "tasks: update" on public.task_submissions
  for update to authenticated using (auth.uid() = user_id or public.is_teacher())
  with check (auth.uid() = user_id or public.is_teacher());

-- Row-level security cannot limit columns, so a trigger does: a learner's update may change seen_at only.
create or replace function public.task_update_guard() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() and (
       new.feedback_text is distinct from old.feedback_text
    or new.feedback_audio_path is distinct from old.feedback_audio_path
    or new.feedback_at is distinct from old.feedback_at
    or new.notes is distinct from old.notes
    or new.audio_path is distinct from old.audio_path
    or new.theme is distinct from old.theme
    or new.mode is distinct from old.mode
    or new.user_id is distinct from old.user_id) then
    raise exception 'learners can only mark feedback as seen';
  end if;
  return new;
end $$;
drop trigger if exists task_update_guard on public.task_submissions;
create trigger task_update_guard before update on public.task_submissions
  for each row execute function public.task_update_guard();

-- Recordings: private bucket, one folder per learner (<user id>/...). The teacher's spoken
-- feedback is stored in the learner's folder too, so the learner can play it.
insert into storage.buckets (id, name, public) values ('tasks', 'tasks', false)
  on conflict (id) do nothing;

drop policy if exists "task audio: read" on storage.objects;
create policy "task audio: read" on storage.objects for select to authenticated
  using (bucket_id = 'tasks' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_teacher()));

drop policy if exists "task audio: upload" on storage.objects;
create policy "task audio: upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'tasks' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_teacher()));
