/* Runtime configuration.

   Onboarding links are sent to people outside the business, so they must carry
   the real domain — a localhost URL is useless the moment it leaves this
   machine. Set VITE_PUBLIC_APP_URL in the Vercel project (and in .env.local if
   you want to test against a tunnel); the dev fallback keeps local work
   working without any setup. */

const configured = (import.meta.env.VITE_PUBLIC_APP_URL ?? '').trim().replace(/\/+$/, '')

export const APP_URL =
  configured || (typeof window === 'undefined' ? '' : window.location.origin)

/* A loopback host resolves on every device — to that device. So a link built
   from localhost is worse than an unset domain: it looks fine in the sender's
   browser and opens a connection error on the applicant's phone. Setting
   VITE_PUBLIC_APP_URL to localhost must not count as having configured one.
   A LAN address does count; it is reachable from a phone on the same wifi. */
const LOOPBACK = /^https?:\/\/(localhost|127(?:\.\d+){3}|\[::1\])(?::\d+)?$/i

/** True once links carry a host that resolves for whoever receives them. The
    Add User screen says so, so nobody mails out a link to their own machine. */
export const APP_URL_IS_PUBLIC = Boolean(APP_URL) && !LOOPBACK.test(APP_URL)

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** The app runs against fixtures until a project is configured, so the whole
    console stays reviewable before the backend exists. */
export const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
