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

/* Supabase refuses to send to addresses it expects to bounce, and the raw
   reply is a developer's sentence — Email address "x@gmail.com" is invalid —
   which tells an applicant nothing about what to do next.

   Two rules account for nearly every rejection. Gmail has never issued a
   username under six characters, so anything shorter is turned away before a
   message is sent. And the RFC 2606 reserved domains (example.com, .test,
   .invalid, .local) are refused outright. Both are the address being wrong,
   not the form. */
const GMAIL_TOO_SHORT =
  'A Gmail address needs at least six characters before the @, so this one cannot be a real inbox. Check the spelling.'

const UNDELIVERABLE =
  'That address was turned away as undeliverable. Use an inbox you can actually open — made-up and example addresses are rejected.'

function readable(error: { message: string; code?: string }, email: string) {
  if (/rate limit|too many/i.test(error.message)) return RATE_LIMITED

  const rejected =
    error.code === 'email_address_invalid' || /email address.*invalid/i.test(error.message)
  if (!rejected) return error.message

  const at = email.lastIndexOf('@')
  const name = at === -1 ? '' : email.slice(0, at)
  const host = at === -1 ? '' : email.slice(at + 1)
  return host === 'gmail.com' && name.length < 6 ? GMAIL_TOO_SHORT : UNDELIVERABLE
}

export async function sendEmailCode(email: string) {
  const address = email.trim().toLowerCase()
  const { error } = await client().auth.signInWithOtp({
    email: address,
    options: { shouldCreateUser: true },
  })
  if (error) {
    throw new Error(readable(error, address))
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
