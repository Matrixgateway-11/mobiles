import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/config'
import type { Database } from '@/types/database'

/* The Supabase client.

   Null until a project is configured, which is deliberate: the console runs on
   fixtures without one, so the whole thing stays reviewable before the backend
   exists and nothing crashes on a missing environment variable. Call sites ask
   `isLive()` rather than assuming.

   Only the anon key belongs here. It is designed to be public and is exactly
   what the row level security policies are written against. The service_role
   key bypasses RLS entirely and must never reach the browser — it lives in
   edge function secrets and nowhere else. */

export type Client = SupabaseClient<Database>

export const supabase: Client | null = HAS_SUPABASE
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // A payments console on a shared counter should not stay signed in
        // forever in a tab someone walked away from.
        storageKey: 'saimobiles.auth',
      },
    })
  : null

export const isLive = (): boolean => supabase !== null

/** Narrows the client for the code paths that require it, with an error that
    says what to do rather than a null dereference three frames deep. */
export function client(): Client {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
    )
  }
  return supabase
}

/** Edge functions handle everything the anon key must not: the public
    onboarding form (the applicant has no session) and approval (which creates
    an auth user). They are called by name, with the anon key as bearer. */
export async function callEdge<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await client().functions.invoke<T>(name, { body })
  if (error) throw error
  return data as T
}
