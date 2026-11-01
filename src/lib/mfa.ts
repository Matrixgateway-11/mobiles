import { client } from '@/lib/supabase'
import type { Role } from '@/data/network'

/* Two-factor over Supabase's TOTP.

   The reason this is TOTP and not a code we email: Supabase records the
   assurance level in the token itself. A session that has only passed the
   password is `aal1`, and stays `aal1` until a factor verifies. That is what
   makes the second screen a gate rather than a decoration — RLS refuses `aal1`
   for everything except reading your own profile, so skipping the screen and
   calling the API directly gets you nothing.

   The admin is exempt for now, by decision rather than by accident. */

export const requiresTotp = (role: Role) => role !== 'admin'

export type FactorState =
  | { kind: 'satisfied' }
  /** Enrolled already — challenge and verify. */
  | { kind: 'challenge'; factorId: string }
  /** Nothing enrolled yet — scan a QR first. */
  | { kind: 'enroll' }

/** What this session still owes before the console should open. */
export async function factorState(role: Role): Promise<FactorState> {
  if (!requiresTotp(role)) return { kind: 'satisfied' }

  const { data: aal, error: aalError } = await client().auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalError) throw aalError

  if (aal.currentLevel === 'aal2') return { kind: 'satisfied' }

  const { data: factors, error } = await client().auth.mfa.listFactors()
  if (error) throw error

  // .totp is already only the verified ones.
  const verified = factors.totp[0]
  return verified ? { kind: 'challenge', factorId: verified.id } : { kind: 'enroll' }
}

export type Enrollment = {
  factorId: string
  /** An SVG data URL from Supabase, ready for an <img>. */
  qr: string
  /** The same secret in text, for anyone who cannot scan. */
  secret: string
}

export async function startEnrollment(): Promise<Enrollment> {
  // A half-finished enrolment leaves an unverified factor behind; clear those
  // so a second attempt does not trip the per-user factor limit.
  const { data: existing } = await client().auth.mfa.listFactors()
  for (const factor of existing?.all ?? []) {
    if (factor.factor_type === 'totp' && factor.status === 'unverified') {
      await client().auth.mfa.unenroll({ factorId: factor.id })
    }
  }

  const { data, error } = await client().auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
  })
  if (error) throw error

  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret }
}

/** Verifies a code against a factor and, on success, lifts the session to
    aal2. Used by both enrolment and ordinary sign-in. */
export async function verifyCode(factorId: string, code: string) {
  const { data: challenge, error: challengeError } = await client().auth.mfa.challenge({ factorId })
  if (challengeError) throw challengeError

  const { error } = await client().auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })
  if (error) throw error
}

/** Clearing someone's factor when they lose the phone. Supabase only lets a
    user unenroll their own, so an admin doing it for someone else goes through
    an edge function with the service role — not built yet. */
export async function unenrollOwnFactors() {
  const { data } = await client().auth.mfa.listFactors()
  for (const factor of data?.all ?? []) {
    await client().auth.mfa.unenroll({ factorId: factor.id })
  }
}

/** Supabase's wording is for developers; this is for the person typing. */
export function readableMfaError(caught: unknown) {
  const message = caught instanceof Error ? caught.message : String(caught)
  if (/invalid|incorrect|not valid/i.test(message)) {
    return 'That code is not right. Codes change every 30 seconds — try the current one.'
  }
  if (/expired/i.test(message)) {
    return 'That code expired. Enter the one showing now.'
  }
  return message
}
