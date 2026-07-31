-- Mentor workspace financial snapshot
-- Run this after 001_initial_schema.sql (and 002_mentor_notifications.sql when used).
-- A booking keeps the mentor's rate at the moment it is made, so later profile
-- price changes do not alter historical earnings.

alter table public.bookings
  add column if not exists mentor_rate_usd numeric(8,2),
  add column if not exists mentor_earning_usd numeric(8,2);

create or replace function public.set_booking_financial_snapshot()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  current_rate numeric(8,2);
  session_hours numeric;
begin
  if new.mentor_rate_usd is null then
    select hourly_rate_usd into current_rate
    from public.mentors
    where id = new.mentor_id;
    new.mentor_rate_usd := coalesce(current_rate, 0);
  end if;

  session_hours := greatest(extract(epoch from (new.end_at - new.start_at)) / 3600.0, 0);
  new.mentor_earning_usd := round(new.mentor_rate_usd * session_hours, 2);
  return new;
end;
$$;

drop trigger if exists set_booking_financial_snapshot on public.bookings;
create trigger set_booking_financial_snapshot
  before insert or update of start_at, end_at, mentor_id, mentor_rate_usd on public.bookings
  for each row execute procedure public.set_booking_financial_snapshot();

-- Preserve a sensible historical value for bookings created before this migration.
update public.bookings b
set mentor_rate_usd = m.hourly_rate_usd,
    mentor_earning_usd = round(m.hourly_rate_usd * greatest(extract(epoch from (b.end_at - b.start_at)) / 3600.0, 0), 2)
from public.mentors m
where m.id = b.mentor_id
  and (b.mentor_rate_usd is null or b.mentor_earning_usd is null);

create index if not exists bookings_mentor_status_start_at_idx
  on public.bookings (mentor_id, status, start_at desc);
