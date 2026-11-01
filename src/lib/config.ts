/* Runtime configuration.

   Onboarding links are sent to people outside the business, so they must carry
   the real domain — a localhost URL is useless the moment it leaves this
   machine. Set VITE_PUBLIC_APP_URL in the Vercel project (and in .env.local if
   you want to test against a tunnel); the dev fallback keeps local work
   working without any setup. */

const configured = (import.meta.env.VITE_PUBLIC_APP_URL ?? '').trim().replace(/\/+$/, '')

export const APP_URL =
  configured || (typeof window === 'undefined' ? '' : window.location.origin)

/** True once the deployed domain is configured, rather than guessed from the
    browser. The Add User screen says so, so nobody mails out a localhost link. */
export const APP_URL_IS_CONFIGURED = Boolean(configured)

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** The app runs against fixtures until a project is configured, so the whole
    console stays reviewable before the backend exists. */
export const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
