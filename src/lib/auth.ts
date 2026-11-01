import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isLive, client } from '@/lib/supabase'
import type { ProfileRow } from '@/types/database'
import type { Account } from '@/data/network'

/* Authentication against Supabase.

   One factor today: email and password, hashed by Supabase Auth and verified
   server-side. A second factor is a separate piece of work — see the note in
   the README about what Supabase will and will not enforce.

   Everything here is a no-op when the project is not configured, so the
   console keeps running on fixtures. */

export type AuthState = {
  session: Session | null
  profile: Account | null
  /** Signed in, but with no profile row — an auth user nobody onboarded. */
  orphaned: boolean
  loading: boolean
}

/** The database row, in the shape the console already speaks. The uuid is the
    identity; the merchant code is only ever display. */
export function toAccount(row: ProfileRow): Account {
  return {
    id: row.id,
    merchantCode: row.merchant_code,
    name: row.full_name,
    email: row.email,
    mobile: row.mobile ?? '',
    role: row.role,
    parentId: row.parent_id,
    status: row.status,
    commissionPercent: Number(row.commission_percent),
    joined: row.created_at,
    // Trading figures are still fixtures; they are not in this schema yet.
    payin: 0,
    disbursement: 0,
    wallet: 0,
  }
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await client().auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  return data.session
}

export async function signOutOfSupabase() {
  if (!isLive()) return
  await client().auth.signOut()
}

async function fetchProfile(userId: string): Promise<Account | null> {
  const { data, error } = await client()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  // A missing row is not an error: it means nobody has onboarded this user.
  if (error) throw error
  return data ? toAccount(data) : null
}

/** The signed-in user and their profile, kept in step with Supabase. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    orphaned: false,
    loading: isLive(),
  })

  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    const load = async (session: Session | null) => {
      if (!session) {
        if (!cancelled) {
          setState({ session: null, profile: null, orphaned: false, loading: false })
        }
        return
      }
      try {
        const profile = await fetchProfile(session.user.id)
        if (!cancelled) {
          setState({ session, profile, orphaned: profile === null, loading: false })
        }
      } catch {
        if (!cancelled) {
          setState({ session, profile: null, orphaned: true, loading: false })
        }
      }
    }

    void supabase.auth.getSession().then(({ data }) => load(data.session))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session)
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  return state
}

/* One subscription to Supabase for the whole app. Without a shared context,
   every component asking who is signed in opens its own listener and re-fetches
   the profile. */

const EMPTY: AuthState = { session: null, profile: null, orphaned: false, loading: false }

export const AuthContext = createContext<AuthState>(EMPTY)

export const useAuthState = () => useContext(AuthContext)
