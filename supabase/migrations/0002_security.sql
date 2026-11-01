-- Sai Mobiles — row level security and the mutation surface
--
-- Reads go through RLS. Writes do not: every mutation is a security-definer
-- function with its own permission check, because the rules here are about
-- *relationships* ("may I change this account's rate?") rather than about
-- columns, and that is clearer in a function than in a policy.
--
-- Two things deliberately live outside this file, in edge functions, because
-- they need the service role: the public onboarding form (the applicant has no
-- session at all) and approval (which creates an auth user).

-- ------------------------------------------------------------- helpers

create or replace function public.my_role()
returns public.account_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.my_role() = 'admin', false);
$$;

-- True when the caller sits directly above the target, or is the admin.
-- The hierarchy is three deep, so a recursive walk buys nothing.
create or replace function public.can_manage(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target is not null
    and target <> auth.uid()
    and (
      public.is_admin()
      or exists (
        select 1 from public.profiles p
        where p.id = target and p.parent_id = auth.uid()
      )
    );
$$;

create or replace function public.log(
  p_action text,
  p_entity text,
  p_entity_id text,
  p_detail jsonb default '{}'::jsonb
)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_detail);
$$;

-- ----------------------------------------------------------------- RLS

alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.onboarding_submissions enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.commission_changes enable row level security;
alter table public.audit_log enable row level security;

-- You can always see yourself. The admin sees everyone. A distributor sees the
-- retailers parented to it, and nothing else.
create policy profiles_read on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or parent_id = auth.uid()
  );

-- Only your own name, mobile, shop and address — role, parent, status and rate
-- are someone else's call and move through the functions below.
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy invitations_read on public.invitations
  for select to authenticated
  using (public.is_admin() or invited_by = auth.uid());

create policy submissions_read on public.onboarding_submissions
  for select to authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and (public.is_admin() or i.invited_by = auth.uid())
    )
  );

create policy documents_read on public.kyc_documents
  for select to authenticated
  using (
    exists (
      select 1
      from public.onboarding_submissions s
      join public.invitations i on i.id = s.invitation_id
      where s.id = submission_id
        and (public.is_admin() or i.invited_by = auth.uid())
    )
  );

create policy commission_changes_read on public.commission_changes
  for select to authenticated
  using (account_id = auth.uid() or public.can_manage(account_id));

create policy audit_read on public.audit_log
  for select to authenticated
  using (public.is_admin());

-- --------------------------------------------------- mutation surface

-- Mint an onboarding link. The caller's role decides what they may invite:
-- the admin both, a distributor only retailers, a retailer nothing.
create or replace function public.create_invitation(
  p_invite_role public.invite_role,
  p_note text default '',
  p_valid_days integer default 7
)
returns public.invitations
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  caller public.account_role := public.my_role();
  row public.invitations;
begin
  if caller is null then
    raise exception 'not signed in';
  end if;

  if caller = 'retailer' then
    raise exception 'a retailer cannot onboard anyone';
  end if;

  if caller = 'distributor' and p_invite_role <> 'retailer' then
    raise exception 'a distributor can only onboard retailers';
  end if;

  insert into public.invitations (token, invited_by, invite_role, note, expires_at)
  values (
    -- Tokens go in a URL path, so plain base64 is wrong: '/' and '+' break it.
    -- translate() maps them to the URL-safe pair and drops the padding.
    'inv_' || translate(encode(gen_random_bytes(18), 'base64'), '+/=', '-_'),
    auth.uid(),
    p_invite_role,
    coalesce(p_note, ''),
    now() + make_interval(days => greatest(p_valid_days, 1))
  )
  returning * into row;

  perform public.log('invitation.created', 'invitation', row.id::text,
    jsonb_build_object('role', p_invite_role, 'note', p_note));

  return row;
end;
$$;

create or replace function public.revoke_invitation(p_invitation uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  inv public.invitations;
begin
  select * into inv from public.invitations where id = p_invitation;
  if not found then
    raise exception 'no such invitation';
  end if;

  if not (public.is_admin() or inv.invited_by = auth.uid()) then
    raise exception 'not yours to revoke';
  end if;

  if inv.status <> 'pending' then
    raise exception 'this link has already been used';
  end if;

  delete from public.invitations where id = p_invitation;
  perform public.log('invitation.revoked', 'invitation', p_invitation::text, '{}'::jsonb);
end;
$$;

-- A distributor reviewed a retailer. It may propose a rate; it may not approve.
create or replace function public.forward_invitation(
  p_invitation uuid,
  p_proposed_percent numeric
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  inv public.invitations;
begin
  select * into inv from public.invitations where id = p_invitation;
  if not found then
    raise exception 'no such invitation';
  end if;

  if inv.invited_by <> auth.uid() then
    raise exception 'not yours to forward';
  end if;

  if inv.status <> 'submitted' then
    raise exception 'only a submitted application can be forwarded';
  end if;

  if p_proposed_percent < 0 or p_proposed_percent > 100 then
    raise exception 'percentage must be between 0 and 100';
  end if;

  update public.invitations
     set status = 'forwarded',
         forwarded_at = now(),
         proposed_percent = p_proposed_percent
   where id = p_invitation;

  perform public.log('invitation.forwarded', 'invitation', p_invitation::text,
    jsonb_build_object('proposed_percent', p_proposed_percent));
end;
$$;

create or replace function public.reject_invitation(p_invitation uuid, p_reason text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  inv public.invitations;
begin
  select * into inv from public.invitations where id = p_invitation;
  if not found then
    raise exception 'no such invitation';
  end if;

  if not (public.is_admin() or inv.invited_by = auth.uid()) then
    raise exception 'not yours to decide';
  end if;

  if inv.status not in ('submitted', 'forwarded') then
    raise exception 'nothing to reject';
  end if;

  update public.invitations
     set status = 'rejected',
         decided_at = now(),
         decided_by = auth.uid(),
         rejection_reason = coalesce(nullif(trim(p_reason), ''), 'No reason given')
   where id = p_invitation;

  perform public.log('invitation.rejected', 'invitation', p_invitation::text,
    jsonb_build_object('reason', p_reason));
end;
$$;

-- Rates change after approval. The admin may change anyone's; a distributor may
-- change only the retailers parented to it. Every change is kept.
create or replace function public.set_commission_percent(
  p_account uuid,
  p_percent numeric,
  p_reason text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  previous numeric(5, 2);
begin
  if not public.can_manage(p_account) then
    raise exception 'not yours to change';
  end if;

  if p_percent < 0 or p_percent > 100 then
    raise exception 'percentage must be between 0 and 100';
  end if;

  select commission_percent into previous from public.profiles where id = p_account;

  update public.profiles set commission_percent = p_percent where id = p_account;

  insert into public.commission_changes (account_id, previous_percent, new_percent, changed_by, reason)
  values (p_account, previous, p_percent, auth.uid(), nullif(trim(coalesce(p_reason, '')), ''));

  perform public.log('commission.changed', 'profile', p_account::text,
    jsonb_build_object('from', previous, 'to', p_percent));
end;
$$;

-- Suspending an account. Only the admin may ban; a distributor may put its own
-- retailer on hold, which is reversible and does not look like a verdict.
create or replace function public.set_account_status(
  p_account uuid,
  p_status public.account_status
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.can_manage(p_account) then
    raise exception 'not yours to change';
  end if;

  if p_status = 'banned' and not public.is_admin() then
    raise exception 'only the admin can ban an account';
  end if;

  update public.profiles set status = p_status where id = p_account;

  perform public.log('account.status_changed', 'profile', p_account::text,
    jsonb_build_object('status', p_status));
end;
$$;

-- --------------------------------------------------------------- grants
--
-- The project is created with "automatically expose new tables" off, which is
-- the right default: nothing reaches the Data API unless it is granted here.
-- Reads only — every write goes through the functions above or an edge
-- function, so there is no insert, update or delete grant anywhere.

grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
grant select on public.invitations to authenticated;
grant select on public.onboarding_submissions to authenticated;
grant select on public.kyc_documents to authenticated;
grant select on public.commission_changes to authenticated;
grant select on public.audit_log to authenticated;

-- An account may correct its own contact details and nothing else.
grant update (full_name, mobile, shop_name, address) on public.profiles to authenticated;

-- The anon role gets nothing at all. An applicant has no session: the public
-- onboarding form talks to an edge function, which holds the service role.


revoke all on function public.create_invitation(public.invite_role, text, integer) from public;
revoke all on function public.revoke_invitation(uuid) from public;
revoke all on function public.forward_invitation(uuid, numeric) from public;
revoke all on function public.reject_invitation(uuid, text) from public;
revoke all on function public.set_commission_percent(uuid, numeric, text) from public;
revoke all on function public.set_account_status(uuid, public.account_status) from public;

grant execute on function public.create_invitation(public.invite_role, text, integer) to authenticated;
grant execute on function public.revoke_invitation(uuid) to authenticated;
grant execute on function public.forward_invitation(uuid, numeric) to authenticated;
grant execute on function public.reject_invitation(uuid, text) to authenticated;
grant execute on function public.set_commission_percent(uuid, numeric, text) to authenticated;
grant execute on function public.set_account_status(uuid, public.account_status) to authenticated;
