create table if not exists public.mentor_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  booking_notifications boolean not null default true,
  session_reminders boolean not null default true,
  email_notifications boolean not null default true,
  profile_visible boolean not null default true,
  session_buffer_minutes smallint not null default 15 check (session_buffer_minutes between 0 and 120),
  updated_at timestamptz not null default now()
);

alter table public.mentor_settings enable row level security;

drop policy if exists "Mentors can manage their settings" on public.mentor_settings;
create policy "Mentors can manage their settings"
  on public.mentor_settings for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
