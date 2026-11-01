import { Link } from 'react-router-dom'

const YEAR = new Date().getFullYear()

const LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Support', to: '/help' },
]

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white px-4 py-5 lg:px-8">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-500">
          © {YEAR} Sai Mobiles.
          <span className="mx-1.5 text-ink-300">·</span>
          Settlements routed over Bharat Connect (NPCI).
        </p>
        <nav className="flex items-center gap-5">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm text-ink-500 transition-colors hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
