import { useSyncExternalStore } from 'react'
import { useAccountId } from '@/lib/session'
import { useAuthState } from '@/lib/auth'
import { isLive } from '@/lib/supabase'
import { APP_URL } from '@/lib/config'
import {
  ADMIN_ID,
  seedAccounts,
  seedInvitations,
  expiryFrom,
  type Account,
  type AccountStatus,
  type Invitation,
  type InviteRole,
  type Role,
  type Submission,
} from '@/data/network'

/* In-memory store for accounts and onboarding invitations.

   localStorage rather than sessionStorage, deliberately: an onboarding link is
   opened in a second tab, and the invitation has to be visible from both. The
   `storage` event below is what makes the reviewer's inbox update the moment
   the applicant submits in the other tab.

   This is the seam for Supabase. Every mutation below becomes one call; the
   components never touch storage directly. */

/* Versioned. A store already in localStorage wins over the seed, so a
   reviewer who used the console yesterday would never see fixtures added
   today -- they would just report the screen as empty. Bumping the suffix
   retires the old copy instead of asking anyone to open devtools. */
const KEY = 'saimobiles.network.v2'

export type CommissionChange = {
  accountId: string
  previousPercent: number
  newPercent: number
  changedBy: string
  reason: string
  at: string
}

export type NetworkState = {
  accounts: Account[]
  invitations: Invitation[]
  commissionChanges: CommissionChange[]
}

const seed = (): NetworkState => ({
  accounts: structuredClone(seedAccounts),
  invitations: structuredClone(seedInvitations),
  commissionChanges: [],
})

function load(): NetworkState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as NetworkState
    if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.invitations)) return seed()
    // Older stores predate the rate history; fill it rather than discarding.
    return { ...parsed, commissionChanges: parsed.commissionChanges ?? [] }
  } catch {
    return seed()
  }
}

let state: NetworkState = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage blocked — the app still works, it just won't survive a reload */
  }
}

function commit(next: NetworkState) {
  state = next
  persist()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Another tab wrote to the store — most often the applicant submitting.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return
    state = load()
    listeners.forEach((l) => l())
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const getSnapshot = () => state

export function useNetwork() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export const getNetwork = () => state

/** Who the console is being operated as.

    Against a real project this is the signed-in user's profile, full stop —
    the role comes from the database and there is nothing to switch. On
    fixtures it falls back to the selected account, because that is the only
    way to review three panels without three real logins. */
export function useCurrentAccount(): Account {
  const network = useNetwork()
  const id = useAccountId()
  const { profile } = useAuthState()

  if (isLive()) {
    return profile ?? network.accounts[0]
  }

  return (
    network.accounts.find((a) => a.id === id) ??
    network.accounts.find((a) => a.id === ADMIN_ID) ??
    network.accounts[0]
  )
}

/* ----------------------------------------------------------------- actions */

const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomToken(length = 10) {
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

function nextAccountId(accounts: Account[]) {
  const year = new Date().getFullYear()
  const prefix = `MER${year}`
  const taken = accounts
    .map((a) => a.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => Number.isFinite(n))
  const next = (taken.length ? Math.max(...taken) : 10000) + Math.floor(Math.random() * 90) + 11
  return `${prefix}${next}`
}

/** Six digits, emailed on approval. A real build issues this server-side. */
function issueMpin() {
  const bytes = new Uint32Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b % 10).join('')
}

export function createInvitation(input: {
  invitedBy: string
  inviteRole: InviteRole
  note: string
}): Invitation {
  const createdAt = new Date().toISOString()
  const invitation: Invitation = {
    token: `inv_${randomToken()}`,
    invitedBy: input.invitedBy,
    inviteRole: input.inviteRole,
    note: input.note.trim(),
    createdAt,
    expiresAt: expiryFrom(createdAt),
    status: 'pending',
  }
  commit({ ...state, invitations: [invitation, ...state.invitations] })
  return invitation
}

export function revokeInvitation(token: string) {
  commit({
    ...state,
    invitations: state.invitations.filter((i) => i.token !== token),
  })
}

function patch(token: string, change: Partial<Invitation>) {
  commit({
    ...state,
    invitations: state.invitations.map((i) => (i.token === token ? { ...i, ...change } : i)),
  })
}

export function submitOnboarding(token: string, submission: Submission) {
  patch(token, { status: 'submitted', submission })
}

/** A distributor cannot approve: the best it can do is pass the application up
    with the rate it proposes for that retailer. */
export function forwardToAdmin(token: string, proposedPercent: number) {
  patch(token, {
    status: 'forwarded',
    forwardedAt: new Date().toISOString(),
    proposedPercent,
  })
}

export function approveInvitation(token: string, commissionPercent: number) {
  const invitation = state.invitations.find((i) => i.token === token)
  if (!invitation?.submission) return null

  const inviter = state.accounts.find((a) => a.id === invitation.invitedBy)
  // A retailer invited by the admin reports to the admin; one invited by a
  // distributor reports to that distributor.
  const parentId = inviter?.id ?? ADMIN_ID
  const mpin = issueMpin()

  const code = nextAccountId(state.accounts)
  const account: Account = {
    id: code,
    merchantCode: code,
    name: invitation.submission.fullName,
    email: invitation.submission.email,
    mobile: invitation.submission.mobile,
    role: invitation.inviteRole,
    parentId,
    status: 'active',
    commissionPercent,
    joined: new Date().toISOString(),
    payin: 0,
    disbursement: 0,
    wallet: 0,
  }

  commit({
    ...state,
    accounts: [...state.accounts, account],
    invitations: state.invitations.map((i) =>
      i.token === token
        ? {
            ...i,
            status: 'approved',
            decidedAt: new Date().toISOString(),
            commissionPercent,
            accountId: account.id,
            issuedMpin: mpin,
          }
        : i,
    ),
  })

  return { account, mpin }
}

export function rejectInvitation(token: string, reason: string) {
  patch(token, {
    status: 'rejected',
    decidedAt: new Date().toISOString(),
    rejectionReason: reason.trim(),
  })
}

export function setCommissionPercent(
  accountId: string,
  percent: number,
  changedBy: string,
  reason = '',
) {
  const previous = state.accounts.find((a) => a.id === accountId)?.commissionPercent ?? 0
  commit({
    ...state,
    accounts: state.accounts.map((a) =>
      a.id === accountId ? { ...a, commissionPercent: percent } : a,
    ),
    commissionChanges: [
      {
        accountId,
        previousPercent: previous,
        newPercent: percent,
        changedBy,
        reason,
        at: new Date().toISOString(),
      },
      ...state.commissionChanges,
    ],
  })
}

/** Suspending an account. Only the admin may ban; a distributor can put its own
    retailer on hold, which is reversible and does not read as a verdict. */
export function setAccountStatus(accountId: string, status: AccountStatus) {
  commit({
    ...state,
    accounts: state.accounts.map((a) => (a.id === accountId ? { ...a, status } : a)),
  })
}

/** Who may change another account's rate or status: the admin anyone, a
    distributor only the retailers parented to it. Mirrors can_manage() in SQL. */
export function canManage(actor: Account, target: Account) {
  if (actor.id === target.id) return false
  if (actor.role === 'admin') return true
  return target.parentId === actor.id
}

export const commissionHistoryFor = (s: NetworkState, accountId: string) =>
  s.commissionChanges.filter((c) => c.accountId === accountId)

export function resetNetwork() {
  commit(seed())
}

/* --------------------------------------------------------------- selectors */

export const accountById = (s: NetworkState, id: string | null) =>
  id ? (s.accounts.find((a) => a.id === id) ?? null) : null

export const childrenOf = (s: NetworkState, id: string) =>
  s.accounts.filter((a) => a.parentId === id)

/** Everyone an account is responsible for. The admin sees the whole tree,
    a distributor sees its own retailers, a retailer sees nobody. */
export function networkOf(s: NetworkState, account: Account): Account[] {
  if (account.role === 'admin') return s.accounts.filter((a) => a.role !== 'admin')
  if (account.role === 'distributor') return childrenOf(s, account.id)
  return []
}

/** Applications waiting on this account's decision. */
export function inboxFor(s: NetworkState, account: Account): Invitation[] {
  if (account.role === 'admin') {
    return s.invitations.filter(
      (i) => i.status === 'forwarded' || (i.status === 'submitted' && i.invitedBy === account.id),
    )
  }
  if (account.role === 'distributor') {
    return s.invitations.filter((i) => i.invitedBy === account.id && i.status === 'submitted')
  }
  return []
}

/** Everything this account has ever sent out, whatever its state. */
export const invitationsFrom = (s: NetworkState, accountId: string) =>
  s.invitations.filter((i) => i.invitedBy === accountId)

/** What a distributor has forwarded and is still waiting on. */
export const awaitingAdmin = (s: NetworkState, accountId: string) =>
  s.invitations.filter((i) => i.invitedBy === accountId && i.status === 'forwarded')

export const invitationByToken = (s: NetworkState, token: string) =>
  s.invitations.find((i) => i.token === token) ?? null

/** The URL an invitation is sent as — built from the configured domain, not
    from whatever origin this browser happens to be on. */
export const linkFor = (token: string) => `${APP_URL}/onboard/${token}`

export function canOnboard(role: Role): InviteRole[] {
  if (role === 'admin') return ['distributor', 'retailer']
  if (role === 'distributor') return ['retailer']
  return []
}
