import { useEffect, useState } from 'react'

/* Which overlay Escape belongs to.

   A dialog and a document viewer both listen on `document`, so pressing
   Escape over the viewer closed the dialog behind it too — one keystroke,
   two layers gone. Each overlay now registers while it is open and only acts
   on Escape when it is the topmost one. */

let stack: number[] = []
let nextId = 0

export function useOverlayLayer(active = true) {
  const [id] = useState(() => ++nextId)

  useEffect(() => {
    if (!active) return
    stack = [...stack, id]
    return () => {
      stack = stack.filter((entry) => entry !== id)
    }
  }, [id, active])

  return () => stack[stack.length - 1] === id
}
