-- Ensure every user with the mentor role has a corresponding mentor workspace.
-- This fixes mentor pages being redirected when a profile existed without a row
-- in public.mentors, and lets mentors read their own pending-review record.

drop policy if exists "Mentors can view their own record" on public.mentors;
create policy "Mentors can view their own record"
  on public.mentors for select
  using (auth.uid() = profile_id);

-- Create workspaces for mentor accounts created before this migration.
insert into public.mentors (profile_id)
select p.id
from public.profiles p
where p.role = 'mentor'
  and not exists (
    select 1 from public.mentors m where m.profile_id = p.id
  );

create or replace function public.provision_mentor_workspace()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'mentor' then
    insert into public.mentors (profile_id)
    values (new.id)
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists provision_mentor_workspace_on_profile on public.profiles;
create trigger provision_mentor_workspace_on_profile
  after insert or update of role on public.profiles
  for each row execute procedure public.provision_mentor_workspace();
