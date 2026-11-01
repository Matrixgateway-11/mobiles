-- Sai Mobiles — KYC document storage
--
-- A private bucket. Nothing here is ever served publicly: a reviewer opens a
-- scan through a short-lived signed URL, so the image is viewable in the
-- review dialog without the file itself becoming a shareable link.
--
-- Path convention, which the read policy depends on:
--   <invitation_id>/<kind>.<ext>     e.g. 6f3c…/aadhaar_front.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc',
  'kyc',
  false,
  3 * 1024 * 1024, -- 3 MB, matching what the form tells the applicant
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- A reviewer may read the scans attached to an application they can see:
-- the admin anything, a distributor only what came through its own links.
create policy "kyc readable by the reviewer"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'kyc'
    and exists (
      select 1
      from public.invitations i
      where i.id::text = split_part(storage.objects.name, '/', 1)
        and (public.is_admin() or i.invited_by = auth.uid())
    )
  );

-- No insert, update or delete policy, on purpose. The applicant has no session,
-- so uploads are done against a signed URL minted by the onboarding edge
-- function after it has checked the token. Nobody writes to this bucket with an
-- ordinary key.
