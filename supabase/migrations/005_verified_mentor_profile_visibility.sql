-- Candidates need the public profile fields while browsing verified mentors.
-- The existing profile policy only permits a user to view their own row, which
-- makes the `profiles(...)` join on the mentors directory return null.

drop policy if exists "Users can view verified mentor profiles" on public.profiles;
create policy "Users can view verified mentor profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.mentors m
      where m.profile_id = profiles.id
        and m.verified = true
    )
  );
