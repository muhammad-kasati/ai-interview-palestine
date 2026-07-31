-- ============================================================
-- AI Interview Platform — Initial Schema
-- Run in Supabase SQL Editor or via migration tool
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── ENUM TYPES ──────────────────────────────────────────────────────────────
-- PostgreSQL does not support `create type if not exists` for ENUMs.
-- These guarded blocks keep this initial migration safe after a partial run.
do $$ begin
  create type user_role as enum ('candidate', 'mentor', 'admin');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type interview_mode as enum ('free', 'audio', 'video', 'human');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type interview_status as enum ('pending', 'active', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type experience_level as enum ('junior', 'mid', 'senior');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type job_role as enum ('fullstack', 'backend', 'frontend', 'mobile', 'devops', 'system_design', 'data_engineer', 'ml_engineer');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type target_market as enum ('local_palestine', 'global_remote');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type subscription_tier as enum ('free', 'standard', 'premium', 'human');
exception when duplicate_object then null;
end $$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  role          user_role not null default 'candidate',
  company       text,
  title         text,
  bio           text,
  linkedin_url  text,
  github_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow new user profiles to be inserted via service role (trigger below)
create policy "Service role can manage all profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'candidate')
  );
  return new;
end;
$$;

-- `create trigger` has no IF NOT EXISTS syntax in PostgreSQL.
-- Replace an older copy when this migration is re-run after a partial execution.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
create table public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  tier                  subscription_tier not null default 'free',
  stripe_customer_id    text,
  stripe_subscription_id text,
  valid_until           timestamptz,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view their own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- ─── INTERVIEWS ───────────────────────────────────────────────────────────────
create table public.interviews (
  id                uuid primary key default gen_random_uuid(),
  candidate_id      uuid not null references public.profiles(id) on delete cascade,
  mode              interview_mode not null default 'free',
  status            interview_status not null default 'pending',
  job_role          job_role not null default 'fullstack',
  experience_level  experience_level not null default 'junior',
  target_market     target_market not null default 'local_palestine',
  tech_stack        text[] not null default '{}',
  resume_url        text,
  extracted_skills  text[],
  vapi_call_id      text,
  tavus_conversation_id text,
  duration_seconds  integer,
  started_at        timestamptz,
  ended_at          timestamptz,
  created_at        timestamptz not null default now()
);

alter table public.interviews enable row level security;

create policy "Candidates can manage their own interviews"
  on public.interviews for all using (auth.uid() = candidate_id);

create policy "Admins can view all interviews"
  on public.interviews for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ─── INTERVIEW QUESTIONS ─────────────────────────────────────────────────────
create table public.interview_questions (
  id           uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  question     text not null,
  category     text,
  difficulty   text,
  order_index  integer not null,
  created_at   timestamptz not null default now()
);

alter table public.interview_questions enable row level security;
create policy "Interview owner can view questions"
  on public.interview_questions for select
  using (exists (
    select 1 from public.interviews i
    where i.id = interview_id and i.candidate_id = auth.uid()
  ));

-- ─── INTERVIEW EVALUATIONS ───────────────────────────────────────────────────
create table public.interview_evaluations (
  id                    uuid primary key default gen_random_uuid(),
  interview_id          uuid not null unique references public.interviews(id) on delete cascade,
  overall_score         numeric(4,1),         -- 0-100
  technical_score       numeric(4,1),
  communication_score   numeric(4,1),
  problem_solving_score numeric(4,1),
  strengths             text[],
  improvements          text[],
  gemini_report         text,                 -- full Gemini markdown report
  transcript            text,
  created_at            timestamptz not null default now()
);

alter table public.interview_evaluations enable row level security;
create policy "Candidate can view their evaluations"
  on public.interview_evaluations for select
  using (exists (
    select 1 from public.interviews i
    where i.id = interview_id and i.candidate_id = auth.uid()
  ));

-- ─── MENTORS ─────────────────────────────────────────────────────────────────
create table public.mentors (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null unique references public.profiles(id) on delete cascade,
  verified          boolean not null default false,
  hourly_rate_usd   numeric(6,2) not null default 0,
  specializations   text[] not null default '{}',
  years_experience  integer,
  company           text,
  rating            numeric(3,2) default 0,
  sessions_completed integer default 0,
  created_at        timestamptz not null default now()
);

alter table public.mentors enable row level security;
create policy "Anyone can view verified mentors"
  on public.mentors for select using (verified = true);
create policy "Mentors can update their own record"
  on public.mentors for update using (auth.uid() = profile_id);

-- ─── MENTOR AVAILABILITY ─────────────────────────────────────────────────────
create table public.mentor_availability (
  id          uuid primary key default gen_random_uuid(),
  mentor_id   uuid not null references public.mentors(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time  time not null,
  end_time    time not null,
  timezone    text not null default 'Asia/Jerusalem',
  is_active   boolean not null default true,
  unique (mentor_id, day_of_week)
);

alter table public.mentor_availability enable row level security;
create policy "Anyone can view mentor availability"
  on public.mentor_availability for select using (is_active = true);
create policy "Mentors can manage their availability"
  on public.mentor_availability for all
  using (exists (
    select 1 from public.mentors m where m.id = mentor_id and m.profile_id = auth.uid()
  ));

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  candidate_id    uuid not null references public.profiles(id),
  mentor_id       uuid not null references public.mentors(id),
  start_at        timestamptz not null,
  end_at          timestamptz not null,
  status          booking_status not null default 'pending',
  session_link    text,
  candidate_notes text,
  mentor_feedback text,
  mentor_score    numeric(4,1),
  stripe_payment_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.bookings enable row level security;
create policy "Candidates can view their bookings"
  on public.bookings for select using (auth.uid() = candidate_id);
create policy "Mentors can view their bookings"
  on public.bookings for select
  using (exists (
    select 1 from public.mentors m where m.id = mentor_id and m.profile_id = auth.uid()
  ));
create policy "Candidates can create bookings"
  on public.bookings for insert with check (auth.uid() = candidate_id);
create policy "Mentors can update booking status"
  on public.bookings for update
  using (exists (
    select 1 from public.mentors m where m.id = mentor_id and m.profile_id = auth.uid()
  ));

-- NOTIFICATIONS ----------------------------------------------------
-- Booking lifecycle notifications shown in the in-app notification bell.
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text not null,
  type        text not null default 'system' check (type in ('system', 'booking', 'session')),
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index notifications_user_created_at_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "Users can view their notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can mark their notifications as read"
  on public.notifications for update using (auth.uid() = user_id);

create or replace function public.notify_booking_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  mentor_user_id uuid;
begin
  if tg_op = 'INSERT' then
    select profile_id into mentor_user_id from public.mentors where id = new.mentor_id;
    insert into public.notifications (user_id, title, body, type)
    values (mentor_user_id, 'New booking request', 'A candidate requested a mentor interview session.', 'booking');
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.notifications (user_id, title, body, type)
    values (
      new.candidate_id,
      case new.status when 'confirmed' then 'Session confirmed' when 'cancelled' then 'Session cancelled' when 'completed' then 'Session completed' else 'Booking updated' end,
      case new.status when 'confirmed' then 'Your mentor confirmed the interview session.' when 'cancelled' then 'Your mentor session was cancelled.' when 'completed' then 'Your mentor shared feedback for your session.' else 'Your booking status changed.' end,
      'booking'
    );
  end if;

  if old.session_link is distinct from new.session_link and new.session_link is not null then
    insert into public.notifications (user_id, title, body, type)
    values (new.candidate_id, 'Your session link is ready', 'Open My Mentor Sessions to join your interview.', 'session');
  end if;
  return new;
end;
$$;

drop trigger if exists booking_notifications on public.bookings;
create trigger booking_notifications
  after insert or update of status, session_link on public.bookings
  for each row execute procedure public.notify_booking_change();
