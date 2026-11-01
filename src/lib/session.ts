/* Mock session for the prototype.

   This decides which screen you land on and nothing else. There is no backend
   to authenticate against, so it is a navigation gate, not security — anyone
   can flip the flag from devtools. It exists so the console behaves like the
   real thing: you arrive at sign-in, pass the MPIN, and signing out returns
   you to the start. Replace `startSignIn` and `completeSignIn` with real API
   calls and this module's shape stays the same. */

const KEY = 'saimobiles.session'

export type Stage = 'signed-out' | 'awaiting-mpin' | 'signed-in'

/** sessionStorage, not localStorage: closing the tab ends the session, which
    is what a payments console should do on a shared machine. */
export function getStage(): Stage {
  try {
    const value = window.sessionStorage.getItem(KEY)
    if (value === 'awaiting-mpin' || value === 'signed-in') return value
  } catch {
    /* private mode or blocked storage — treat as signed out */
  }
  return 'signed-out'
}

function setStage(stage: Stage) {
  try {
    if (stage === 'signed-out') window.sessionStorage.removeItem(KEY)
    else window.sessionStorage.setItem(KEY, stage)
  } catch {
    /* nothing to persist to — the gate just won't hold across a reload */
  }
}

/** Password accepted; the MPIN step is now reachable. */
export const startSignIn = () => setStage('awaiting-mpin')

/** MPIN accepted; the console is now reachable. */
export const completeSignIn = () => setStage('signed-in')

export const signOut = () => setStage('signed-out')
