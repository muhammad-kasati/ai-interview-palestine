-- Migration 009: Candidate Profile Avatar Storage & Mentor Availability Time Adjustments

-- Ensure avatar_url column exists on public.profiles
alter table public.profiles
  add column if not exists avatar_url text;

-- Ensure mentor_availability table has proper unique constraint and time columns
alter table public.mentor_availability
  add column if not exists start_time text default '09:00',
  add column if not exists end_time text default '17:00',
  add column if not exists timezone text default 'Asia/Gaza';

-- Create Storage Bucket for user avatars if not exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS Policy to allow authenticated users to upload and update their avatars
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Anyone can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Users can update their own avatars" on storage.objects;
create policy "Users can update their own avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars');
