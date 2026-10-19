-- Nederlands, part 2: teacher dashboard, words from the teacher, questions and custom lessons.
-- Run after schema.sql. Safe to run again.

-- The teacher may read every learner's progress (dashboard); the learner's e-mail is stored with it.
alter table public.progress add column if not exists learner_email text default (auth.jwt() ->> 'email');
drop policy if exists "progress: teacher reads all" on public.progress;
create policy "progress: teacher reads all" on public.progress
  for select to authenticated using (public.is_teacher());

-- Words the teacher adds for one learner after a conversation; they enter the learner's review.
create table if not exists public.teacher_items (
  id          bigint generated always as identity primary key,
  learner_id  uuid not null references auth.users (id) on delete cascade,
  nl          text not null,
  fr          text not null,
  note        text,
  created_at  timestamptz not null default now()
);
alter table public.teacher_items enable row level security;
drop policy if exists "teacher items: read" on public.teacher_items;
create policy "teacher items: read" on public.teacher_items
  for select to authenticated using (auth.uid() = learner_id or public.is_teacher());
drop policy if exists "teacher items: write" on public.teacher_items;
create policy "teacher items: write" on public.teacher_items
  for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Questions from the learner (typed, or spoken and transcribed on the device; the recording is kept).
create table if not exists public.questions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  learner_email text not null default (auth.jwt() ->> 'email'),
  text          text not null,
  audio_path    text,
  context       text,                       -- where the learner was when asking (theme, step)
  status        text not null default 'new' check (status in ('new', 'drafting', 'answered', 'dismissed')),
  created_at    timestamptz not null default now()
);
alter table public.questions enable row level security;
drop policy if exists "questions: read" on public.questions;
create policy "questions: read" on public.questions
  for select to authenticated using (auth.uid() = user_id or public.is_teacher());
drop policy if exists "questions: ask" on public.questions;
create policy "questions: ask" on public.questions
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "questions: teacher updates" on public.questions;
create policy "questions: teacher updates" on public.questions
  for update to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- A lesson made for one learner in answer to a question: same JSON format as a course theme.
-- Generated lessons start as 'draft'; the learner only sees 'published' ones.
create table if not exists public.custom_lessons (
  id           bigint generated always as identity primary key,
  learner_id   uuid not null references auth.users (id) on delete cascade,
  question_id  bigint references public.questions (id) on delete set null,
  theme        jsonb not null,
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at   timestamptz not null default now(),
  published_at timestamptz
);
alter table public.custom_lessons enable row level security;
drop policy if exists "custom lessons: read" on public.custom_lessons;
create policy "custom lessons: read" on public.custom_lessons
  for select to authenticated using ((auth.uid() = learner_id and status = 'published') or public.is_teacher());
drop policy if exists "custom lessons: teacher writes" on public.custom_lessons;
create policy "custom lessons: teacher writes" on public.custom_lessons
  for all to authenticated using (public.is_teacher()) with check (public.is_teacher());
