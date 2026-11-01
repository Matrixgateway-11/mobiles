import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine } from '@remixicon/react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Footer } from './Footer'

/** Terms and Privacy sit outside the session gate — the sign-in page links to
    them, so they have to be readable before you have an account. They get a
    plain shell rather than the console chrome, which would be misleading
    to someone who is not signed in. */
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <Link to="/login" className="rounded-sm">
            <Logo variant="dark" />
          </Link>
          <Button as={Link} to="/login" size="sm" icon={RiArrowLeftLine}>
            Back to sign in
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>

      <Footer />
    </div>
  )
}
