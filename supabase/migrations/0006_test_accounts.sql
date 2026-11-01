-- Sai Mobiles — two accounts for testing the non-admin console
--
-- These skipped onboarding: the auth users were created by hand in the
-- dashboard, so there was no application to approve and nothing wrote their
-- profile. This is the same insert the approval step performs — role,
-- parent and rate — done directly.
--
-- Worth being clear about what is and is not happening here. The role is
-- *data*, not configuration: the console reads profiles.role at sign-in and
-- renders from it. Nothing about a retailer is written into the app. A real
-- retailer reaches this same row through an invitation and an approval.
--
-- Delete these two rows and their auth users before the first real merchant.

insert into public.profiles
  (id, merchant_code, full_name, email, role, parent_id, status, commission_percent)
select
  u.id,
  public.next_merchant_code(),
  'DISTRIBUTOR TEST',
  u.email,
  'distributor',
  (select id from public.profiles where role = 'admin'),
  'active',
  0.75
from auth.users u
where u.email = 'distribtest@gmail.com'
on conflict (id) do nothing;

-- Parented to the distributor above, which the hierarchy trigger checks:
-- a retailer may sit under a distributor, and nothing may sit under a retailer.
insert into public.profiles
  (id, merchant_code, full_name, email, role, parent_id, status, commission_percent)
select
  u.id,
  public.next_merchant_code(),
  'RETAILER TEST',
  u.email,
  'retailer',
  (select id from public.profiles where email = 'distribtest@gmail.com'),
  'active',
  1.00
from auth.users u
where u.email = 'retailtest@gmail.com'
on conflict (id) do nothing;
