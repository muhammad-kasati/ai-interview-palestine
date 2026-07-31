-- Run this migration on databases where 001_initial_schema.sql was already applied.
-- It adds mentor booking notifications without recreating existing enum types or tables.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mentor_availability_mentor_id_day_of_week_key'
  ) then
    alter table public.mentor_availability
      add constraint mentor_availability_mentor_id_day_of_week_key unique (mentor_id, day_of_week);
  end if;
end;
$$;

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text not null,
  type        text not null default 'system' check (type in ('system', 'booking', 'session')),
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can mark their notifications as read" on public.notifications;
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
      case new.status
        when 'confirmed' then 'Session confirmed'
        when 'cancelled' then 'Session cancelled'
        when 'completed' then 'Session completed'
        else 'Booking updated'
      end,
      case new.status
        when 'confirmed' then 'Your mentor confirmed the interview session.'
        when 'cancelled' then 'Your mentor session was cancelled.'
        when 'completed' then 'Your mentor shared feedback for your session.'
        else 'Your booking status changed.'
      end,
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
