-- Sai Mobiles — make the second factor a gate rather than a screen
--
-- Supabase records how far a session got in the token itself: `aal1` means the
-- password passed, `aal2` means a factor verified too. Checking that in the
-- browser would be decoration — the session is already valid, so anything that
-- skips the screen and calls the API directly would be served. Checking it
-- here is what actually stops them.
--
-- One deliberate hole: you can always read your own profile at aal1. The app
-- has to know who you are to decide which screen you owe, and that lookup
-- happens before the factor is verified. It exposes nothing but your own row.
--
-- The admin is exempt by decision, not oversight — TOTP for the admin is
-- deferred. Remove the is_admin() branch in mfa_ok() to close that.

create or replace function public.mfa_ok()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2';
$$;

grant execute on function public.mfa_ok() to authenticated;

-- Your own row stays readable at aal1; everyone else's needs the factor.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or (public.mfa_ok() and (public.is_admin() or parent_id = auth.uid()))
  );

drop policy if exists invitations_read on public.invitations;
create policy invitations_read on public.invitations
  for select to authenticated
  using (public.mfa_ok() and (public.is_admin() or invited_by = auth.uid()));

drop policy if exists submissions_read on public.onboarding_submissions;
create policy submissions_read on public.onboarding_submissions
  for select to authenticated
  using (
    public.mfa_ok()
    and exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and (public.is_admin() or i.invited_by = auth.uid())
    )
  );

drop policy if exists documents_read on public.kyc_documents;
create policy documents_read on public.kyc_documents
  for select to authenticated
  using (
    public.mfa_ok()
    and exists (
      select 1
      from public.onboarding_submissions s
      join public.invitations i on i.id = s.invitation_id
      where s.id = submission_id
        and (public.is_admin() or i.invited_by = auth.uid())
    )
  );

drop policy if exists commission_changes_read on public.commission_changes;
create policy commission_changes_read on public.commission_changes
  for select to authenticated
  using (public.mfa_ok() and (account_id = auth.uid() or public.can_manage(account_id)));

-- Writes too: an aal1 session must not mint links or move rates.
create or replace function public.require_session()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.my_role() is null then
    raise exception 'not signed in';
  end if;
  if not public.mfa_ok() then
    raise exception 'finish signing in first';
  end if;
end;
$$;

grant execute on function public.require_session() to authenticated;

-- can_manage() gates the rate and status changes, so folding the check in here
-- covers both without touching their bodies.
create or replace function public.can_manage(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.mfa_ok()
    and target is not null
    and target <> auth.uid()
    and (
      public.is_admin()
      or exists (
        select 1 from public.profiles p
        where p.id = target and p.parent_id = auth.uid()
      )
    );
$$;
