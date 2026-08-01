-- Migration 007: Interview Room & Session Reminders
-- Adds room_code, code_snapshot, and reminder tracking columns to public.bookings

alter table public.bookings
  add column if not exists room_code text,
  add column if not exists code_snapshot text,
  add column if not exists reminder_1h_sent boolean not null default false,
  add column if not exists reminder_start_sent boolean not null default false;

-- Create index for faster reminder querying
create index if not exists bookings_reminders_idx
  on public.bookings (status, start_at, reminder_1h_sent, reminder_start_sent);

-- Trigger function to automatically ensure room_code exists when a booking is confirmed
create or replace function public.ensure_booking_room_code()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.room_code is null or new.room_code = '' then
    new.room_code := 'room_' || replace(gen_random_uuid()::text, '-', '');
  end if;

  -- Set default in-app session link if none is provided
  if (new.session_link is null or new.session_link = '') then
    new.session_link := '/room/' || new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_booking_room_code_trigger on public.bookings;
create trigger ensure_booking_room_code_trigger
  before insert or update of status on public.bookings
  for each row
  when (new.status = 'confirmed')
  execute procedure public.ensure_booking_room_code();

-- Populate existing confirmed bookings with room_code and session_link if null
update public.bookings
set room_code = coalesce(room_code, 'room_' || replace(gen_random_uuid()::text, '-', '')),
    session_link = coalesce(session_link, '/room/' || id)
where status = 'confirmed' and (room_code is null or session_link is null or session_link = '');
