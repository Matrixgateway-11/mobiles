/* Types for the Supabase schema.

   Hand-written to match supabase/migrations/*.sql. Regenerate with
   `npx supabase gen types typescript --project-id isijmiikyduesdizaiae`
   once the CLI is linked, and replace this file wholesale.

   Note what is absent: no password, no MPIN, no full PAN or Aadhaar. The
   credential belongs to Supabase Auth and the identity numbers are stored as
   last-four plus a hash, so there is nothing here to leak. */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type AccountRole = 'admin' | 'distributor' | 'retailer'
export type AccountStatus = 'active' | 'inactive' | 'banned'
export type InviteRole = 'distributor' | 'retailer'
export type InviteStatus = 'pending' | 'submitted' | 'forwarded' | 'approved' | 'rejected'
export type DocKind =
  | 'pan_front'
  | 'pan_back'
  | 'aadhaar_front'
  | 'aadhaar_back'
  | 'photo'
  | 'cheque'

export type ProfileRow = {
  id: string
  merchant_code: string
  full_name: string
  email: string
  mobile: string | null
  role: AccountRole
  parent_id: string | null
  status: AccountStatus
  commission_percent: number
  shop_name: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export type InvitationRow = {
  id: string
  token: string
  invited_by: string
  invite_role: InviteRole
  note: string
  status: InviteStatus
  expires_at: string
  created_at: string
  forwarded_at: string | null
  proposed_percent: number | null
  decided_at: string | null
  decided_by: string | null
  commission_percent: number | null
  rejection_reason: string | null
  created_account_id: string | null
}

export type SubmissionRow = {
  id: string
  invitation_id: string
  full_name: string
  email: string
  email_verified: boolean
  mobile: string
  mobile_verified: boolean
  shop_name: string | null
  address: string | null
  pan_last4: string | null
  pan_hash: string | null
  aadhaar_last4: string | null
  aadhaar_hash: string | null
  bank_account_last4: string | null
  bank_account_hash: string | null
  ifsc: string | null
  submitted_at: string
}

export type DocumentRow = {
  id: string
  submission_id: string
  kind: DocKind
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  uploaded_at: string
}

export type CommissionChangeRow = {
  id: string
  account_id: string
  previous_percent: number | null
  new_percent: number
  changed_by: string
  reason: string | null
  created_at: string
}

export type AuditRow = {
  id: number
  actor_id: string | null
  action: string
  entity: string | null
  entity_id: string | null
  detail: Json | null
  created_at: string
}

/* Writes never go through the table API — there are no insert or update grants
   except a profile's own contact fields — so Insert and Update are narrowed to
   what the policies actually allow. */
type ReadOnly<Row> = { Row: Row; Insert: never; Update: never; Relationships: [] }

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: never
        Update: Partial<Pick<ProfileRow, 'full_name' | 'mobile' | 'shop_name' | 'address'>>
        Relationships: []
      }
      invitations: ReadOnly<InvitationRow>
      onboarding_submissions: ReadOnly<SubmissionRow>
      kyc_documents: ReadOnly<DocumentRow>
      commission_changes: ReadOnly<CommissionChangeRow>
      audit_log: ReadOnly<AuditRow>
    }
    Views: Record<never, never>
    Functions: {
      create_invitation: {
        Args: { p_invite_role: InviteRole; p_note?: string; p_valid_days?: number }
        Returns: InvitationRow
      }
      revoke_invitation: { Args: { p_invitation: string }; Returns: undefined }
      forward_invitation: {
        Args: { p_invitation: string; p_proposed_percent: number }
        Returns: undefined
      }
      reject_invitation: { Args: { p_invitation: string; p_reason: string }; Returns: undefined }
      set_commission_percent: {
        Args: { p_account: string; p_percent: number; p_reason?: string }
        Returns: undefined
      }
      set_account_status: {
        Args: { p_account: string; p_status: AccountStatus }
        Returns: undefined
      }
      my_role: { Args: Record<never, never>; Returns: AccountRole }
      is_admin: { Args: Record<never, never>; Returns: boolean }
      can_manage: { Args: { target: string }; Returns: boolean }
    }
    Enums: {
      account_role: AccountRole
      account_status: AccountStatus
      invite_role: InviteRole
      invite_status: InviteStatus
      doc_kind: DocKind
    }
    CompositeTypes: Record<never, never>
  }
}
