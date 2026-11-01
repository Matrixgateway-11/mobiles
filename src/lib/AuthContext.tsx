import type { ReactNode } from 'react'
import { AuthContext, useAuth } from '@/lib/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={useAuth()}>{children}</AuthContext.Provider>
}
