-- Sai Mobiles — the first admin
--
-- Onboarding needs an admin to approve it, so the first admin cannot come
-- through the app. It is created in Supabase Auth (Authentication → Add user →
-- Create new user, with Auto Confirm ticked) and this gives it a profile.
--
-- Change the email below when seeding a different environment. Changing it
-- *afterwards* is safe and needs no data migration: every foreign key in this
-- schema points at the auth user's uuid, never at the email. Edit the address
-- in Authentication and the trigger at the bottom carries it across.

insert into public.profiles
  (id, merchant_code, full_name, email, role, parent_id, status, commission_percent)
select
  u.id,
  public.next_merchant_code(),
  'SAI MOBILES HQ',
  u.email,
  'admin',
  null,
  'active',
  0
from auth.users u
where u.email = 'admintest@gmail.com'
on conflict (id) do nothing;

-- Keeps the display copy on profiles following auth.users, so changing the
-- address later really is a single field.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set email = new.email
   where id = new.id
     and email is distinct from new.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_profile_email();
