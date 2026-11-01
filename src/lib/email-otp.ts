import { client, isLive } from '@/lib/supabase'

/* Verifying an applicant's email address.

   This uses Supabase Auth's own email OTP rather than a code we invent, for
   two reasons. Supabase's built-in sender only sends auth emails, so a
   hand-rolled code would need SMTP configured before onboarding could work at
   all. And verifying through Auth means the applicant ends up holding a real
   session for that address — so when the admin approves them, the account
   already exists and already has a proven inbox, and approval only has to
   attach a profile to it.

   An applicant who is never approved is left as an auth user with no profile.
   That is harmless: RLS lets them read their own profile row, which does not
   exist, and nothing else. */

/** Supabase's built-in sender is capped at 2 messages an hour on this project
    and the limit cannot be raised without custom SMTP. Worth saying plainly
    rather than showing a raw API error. */
const RATE_LIMITED =
  'Too many codes requested. This project sends 2 emails an hour until a mail provider is connected — wait a few minutes and try again.'

export async function sendEmailCode(email: string) {
  const { error } = await client().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  })
  if (error) {
    throw new Error(/rate limit|too many/i.test(error.message) ? RATE_LIMITED : error.message)
  }
}

export async function confirmEmailCode(email: string, code: string) {
  const { error } = await client().auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code,
    type: 'email',
  })
  if (error) {
    throw new Error(
      /expired/i.test(error.message)
        ? 'That code has expired. Ask for a new one.'
        : /invalid/i.test(error.message)
          ? 'That code is not right. Check the email again.'
          : error.message,
    )
  }
}

/** Without a project there is no mail to send, so the form falls back to a
    code it shows on screen. Reviewable without a backend, and never reachable
    once one is configured. */
export const emailIsReal = isLive
