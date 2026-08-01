-- Migration 008: Mentor Analytics Indexes & Settings Defaults
-- Adds optimized indexes for financial analytics and ensures mentor_settings default records.

create index if not exists bookings_mentor_status_start_at_analytics_idx
  on public.bookings (mentor_id, status, start_at desc);

-- Function to automatically provision default mentor_settings upon mentor profile creation
create or replace function public.ensure_mentor_settings_default()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.mentor_settings (profile_id, booking_notifications, session_reminders, email_notifications, profile_visible, session_buffer_minutes)
  values (new.profile_id, true, true, true, true, 15)
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

drop trigger if exists ensure_mentor_settings_on_mentor_insert on public.mentors;
create trigger ensure_mentor_settings_on_mentor_insert
  after insert on public.mentors
  for each row execute procedure public.ensure_mentor_settings_default();
