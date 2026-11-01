-- Sai Mobiles — core schema
--
-- Three roles, one admin at the top, distributors under the admin, retailers
-- under a distributor. A retailer is the leaf: nothing is ever parented to one.
--
-- Transaction, wallet and ledger figures are deliberately absent. Those stay in
-- the app's fixtures for now; this schema covers identity, onboarding, approval
-- and commission only.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums

create type public.account_role as enum ('admin', 'distributor', 'retailer');
create type public.account_status as enum ('active', 'inactive', 'banned');
create type public.invite_role as enum ('distributor', 'retailer');
create type public.invite_status as enum (
  'pending',    -- link minted, nobody has filled it in
  'submitted',  -- applicant finished; sits with whoever invited them
  'forwarded',  -- a distributor reviewed a retailer and passed it to the admin
  'approved',   -- admin decided; the account exists
  'rejected'
);
create type public.doc_kind as enum (
  'pan_front', 'pan_back', 'aadhaar_front', 'aadhaar_back', 'photo', 'cheque'
);

-- ------------------------------------------------------------- profiles

-- One row per auth.users row. Supabase Auth owns the credential; this owns
-- everything about the account. No password or MPIN is ever stored here.
create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  merchant_code      text unique not null,
  full_name          text not null,
  email              text not null,
  mobile             text,
  role               public.account_role not null,
  parent_id          uuid references public.profiles (id) on delete restrict,
  status             public.account_status not null default 'active',
  -- The share this account's parent keeps on everything it collects.
  commission_percent numeric(5, 2) not null default 0
                     check (commission_percent >= 0 and commission_percent <= 100),
  shop_name          text,
  address            text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- The admin is the only root, and it is the only root.
  constraint admin_is_rootless check ((role = 'admin') = (parent_id is null))
);

create index profiles_parent_idx on public.profiles (parent_id);
create index profiles_role_idx on public.profiles (role);

-- Exactly one admin row.
create unique index profiles_single_admin on public.profiles ((role))
  where role = 'admin';

-- A retailer never has children. Enforced on insert/update of the child.
create or replace function public.check_parent_can_have_children()
returns trigger
language plpgsql
as $$
declare
  parent_role public.account_role;
begin
  if new.parent_id is null then
    return new;
  end if;

  select role into parent_role from public.profiles where id = new.parent_id;

  if parent_role = 'retailer' then
    raise exception 'a retailer cannot have accounts beneath it';
  end if;

  if new.role = 'distributor' and parent_role <> 'admin' then
    raise exception 'a distributor can only be parented to the admin';
  end if;

  return new;
end;
$$;

create trigger profiles_hierarchy_guard
  before insert or update of parent_id, role on public.profiles
  for each row execute function public.check_parent_can_have_children();

-- ------------------------------------------------------ merchant codes

create sequence public.merchant_code_seq start 10000;

create or replace function public.next_merchant_code()
returns text
language sql
volatile
as $$
  select 'MER' || to_char(now(), 'YYYY') || nextval('public.merchant_code_seq')::text;
$$;

-- ----------------------------------------------------------- invitations

create table public.invitations (
  id                 uuid primary key default gen_random_uuid(),
  -- The capability in the URL. Long, random, and the only thing the applicant
  -- needs — so it is never exposed to anon reads, only to edge functions.
  token              text unique not null,
  invited_by         uuid not null references public.profiles (id) on delete cascade,
  invite_role        public.invite_role not null,
  note               text not null default '',
  status             public.invite_status not null default 'pending',
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now(),

  -- Set when a distributor passes a retailer up to the admin.
  forwarded_at       timestamptz,
  proposed_percent   numeric(5, 2) check (proposed_percent >= 0 and proposed_percent <= 100),

  -- Set by the admin on the final decision.
  decided_at         timestamptz,
  decided_by         uuid references public.profiles (id),
  commission_percent numeric(5, 2) check (commission_percent >= 0 and commission_percent <= 100),
  rejection_reason   text,
  created_account_id uuid references public.profiles (id)
);

create index invitations_invited_by_idx on public.invitations (invited_by);
create index invitations_status_idx on public.invitations (status);

-- ---------------------------------------------------------- submissions

-- What the applicant typed into the public form.
--
-- The identity numbers are not here in full. We keep the last four digits for
-- display and a peppered hash for duplicate detection; the scan itself lives in
-- a private storage bucket and a reviewer opens it through a signed URL. A leak
-- of this table yields no usable PAN or Aadhaar number.
create table public.onboarding_submissions (
  id                  uuid primary key default gen_random_uuid(),
  invitation_id       uuid not null unique references public.invitations (id) on delete cascade,

  full_name           text not null,
  email               text not null,
  email_verified      boolean not null default false,
  mobile              text not null,
  mobile_verified     boolean not null default false,
  shop_name           text,
  address             text,

  pan_last4           text,
  pan_hash            text,
  aadhaar_last4       text,
  aadhaar_hash        text,
  bank_account_last4  text,
  bank_account_hash   text,
  ifsc                text,

  submitted_at        timestamptz not null default now()
);

create index submissions_pan_hash_idx on public.onboarding_submissions (pan_hash);
create index submissions_aadhaar_hash_idx on public.onboarding_submissions (aadhaar_hash);

-- ------------------------------------------------------------ documents

create table public.kyc_documents (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.onboarding_submissions (id) on delete cascade,
  kind          public.doc_kind not null,
  -- Path inside the private `kyc` bucket. Never a public URL.
  storage_path  text not null,
  mime_type     text,
  size_bytes    integer,
  uploaded_at   timestamptz not null default now(),

  unique (submission_id, kind)
);

-- -------------------------------------------------- commission history

-- Rates change after approval, and who changed them matters.
create table public.commission_changes (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references public.profiles (id) on delete cascade,
  previous_percent  numeric(5, 2),
  new_percent       numeric(5, 2) not null,
  changed_by        uuid not null references public.profiles (id),
  reason            text,
  created_at        timestamptz not null default now()
);

create index commission_changes_account_idx on public.commission_changes (account_id, created_at desc);

-- ------------------------------------------------------------ audit log

create table public.audit_log (
  id         bigserial primary key,
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null,
  entity     text,
  entity_id  text,
  detail     jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);

-- --------------------------------------------------------- updated_at

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();
