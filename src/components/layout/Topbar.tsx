import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiMenuLine,
  RiSearchLine,
  RiWallet3Line,
  RiPercentLine,
  RiRefreshLine,
  RiDownload2Line,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiNotification3Line,
  RiArrowDownSLine,
  RiUser3Line,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiTranslate2,
  RiCheckLine,
  RiRepeatLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { IconButton } from '@/components/ui/Button'
import { merchant } from '@/data/mock'
import { ROLE_LABEL } from '@/data/network'
import { useCurrentAccount, useNetwork } from '@/lib/network'
import { setAccountId, signOut } from '@/lib/session'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const account = useCurrentAccount()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 bg-white/95 px-4 backdrop-blur-sm lg:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="-ml-1 inline-flex size-9 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
      >
        <RiMenuLine size={20} />
      </button>

      <div className="relative hidden min-w-0 flex-1 sm:block">
        <RiSearchLine
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search transactions, payouts, beneficiaries…"
          aria-label="Search"
          className="h-9 w-full max-w-md rounded-lg border border-ink-200 bg-ink-50 pr-16 pl-9 text-base text-ink-900 transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15 focus:outline-none"
        />
        <kbd className="pointer-events-none absolute top-1/2 left-[21.5rem] hidden -translate-y-1/2 rounded border border-ink-200 bg-white px-1.5 py-0.5 font-sans text-2xs font-medium text-ink-400 xl:block">
          Ctrl K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 md:flex">
          <WalletChip
            icon={RiWallet3Line}
            label="CC wallet"
            value={account.wallet}
            tone="brand"
          />
          <WalletChip
            icon={RiPercentLine}
            label="Commission"
            value={merchant.commissionWallet}
            tone="success"
          />
        </div>

        <div className="hidden items-center gap-1 border-l border-ink-200 pl-2 sm:flex">
          <IconButton icon={RiDownload2Line} label="Export data" variant="ghost" />
          <FullscreenToggle />
          <NotificationButton />
        </div>

        <UserMenu />
      </div>
    </header>
  )
}

function WalletChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: RemixiconComponentType
  label: string
  value: number
  tone: 'brand' | 'success'
}) {
  const [spinning, setSpinning] = useState(false)

  const refresh = () => {
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 600)
  }

  return (
    <div className="flex h-9 items-center gap-2.5 rounded-lg border border-ink-200 bg-white pr-1 pl-2.5">
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md',
          tone === 'brand' ? 'bg-brand-50 text-brand-700' : 'bg-success-50 text-success-700',
        )}
        aria-hidden
      >
        <Icon size={14} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-2xs font-medium tracking-normal text-ink-500">{label}</span>
        <span className="tnum mt-0.5 text-sm font-semibold text-ink-900">{money(value)}</span>
      </span>
      <button
        type="button"
        onClick={refresh}
        aria-label={`Refresh ${label} balance`}
        className="inline-flex size-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
      >
        <RiRefreshLine size={14} className={cn(spinning && 'animate-spin')} />
      </button>
    </div>
  )
}

function FullscreenToggle() {
  const [full, setFull] = useState(false)

  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  }

  return (
    <IconButton
      icon={full ? RiFullscreenExitLine : RiFullscreenLine}
      label={full ? 'Exit full screen' : 'Full screen'}
      variant="ghost"
      onClick={toggle}
    />
  )
}

function NotificationButton() {
  return (
    <div className="relative">
      <IconButton icon={RiNotification3Line} label="Notifications" variant="ghost" />
      <span
        className="absolute top-2 right-2 size-1.5 rounded-full bg-brand-600 ring-2 ring-white"
        aria-label="Unread notifications"
      />
    </div>
  )
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
]

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

function UserMenu() {
  const account = useCurrentAccount()
  const network = useNetwork()
  const [open, setOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const ref = useRef<HTMLDivElement>(null)

  // The language submenu is collapsed by whatever dismisses the menu, so it is
  // never left expanded behind a closed dropdown.
  const dismiss = () => {
    setOpen(false)
    setLanguageOpen(false)
    setSwitcherOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) dismiss()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (open ? dismiss() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'flex h-9 items-center gap-2 rounded-lg border border-ink-200 pr-1.5 pl-1.5 transition-colors',
          open ? 'border-ink-300 bg-ink-50' : 'bg-white hover:bg-ink-50',
        )}
      >
        <span
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-2xs font-semibold text-white"
          aria-hidden
        >
          {initialsOf(account.name)}
        </span>
        <span className="hidden flex-col items-start leading-none sm:flex">
          <span className="max-w-32 truncate text-sm font-semibold text-ink-900">
            {account.name}
          </span>
          <span className="mt-0.5 text-2xs font-medium tracking-normal text-ink-500">
            {ROLE_LABEL[account.role]}
          </span>
        </span>
        <RiArrowDownSLine
          size={16}
          className={cn('shrink-0 text-ink-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg"
        >
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="truncate text-base font-semibold text-ink-900">{account.name}</p>
            <p className="mt-0.5 text-sm text-ink-500">
              {ROLE_LABEL[account.role]} account
              <span className="mx-1.5 text-ink-300">·</span>
              <span className="font-mono text-xs">{account.id}</span>
            </p>
          </div>

          {/* Prototype affordance: three panels, one browser. A real build
              takes the role from the signed-in session instead. */}
          <div className="border-b border-ink-100 p-1.5">
            <button
              type="button"
              role="menuitem"
              aria-expanded={switcherOpen}
              onClick={() => setSwitcherOpen((v) => !v)}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-base text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <RiRepeatLine size={16} className="shrink-0 opacity-70" aria-hidden />
              Switch panel
              <RiArrowDownSLine
                size={14}
                className={cn('ml-auto text-ink-400 transition-transform', switcherOpen && 'rotate-180')}
              />
            </button>

            {switcherOpen && (
              <ul className="scrollbar-slim my-1 ml-4 max-h-56 space-y-px overflow-y-auto border-l border-ink-200 pl-2">
                {network.accounts.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountId(option.id)
                        dismiss()
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-ink-100"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-800">
                          {option.name}
                        </span>
                        <span className="block text-2xs tracking-normal text-ink-500">
                          {ROLE_LABEL[option.role]}
                        </span>
                      </span>
                      {option.id === account.id && (
                        <RiCheckLine size={14} className="shrink-0 text-brand-700" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              aria-expanded={languageOpen}
              onClick={() => setLanguageOpen((v) => !v)}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-base text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <RiTranslate2 size={16} className="shrink-0 opacity-70" aria-hidden />
              Language
              <span className="ml-auto flex items-center gap-1.5 text-sm text-ink-500">
                {LANGUAGES.find((l) => l.code === language)?.label}
                <RiArrowDownSLine
                  size={14}
                  className={cn('transition-transform', languageOpen && 'rotate-180')}
                />
              </span>
            </button>

            {languageOpen && (
              <ul className="my-1 ml-4 space-y-px border-l border-ink-200 pl-2">
                {LANGUAGES.map((option) => (
                  <li key={option.code}>
                    <button
                      type="button"
                      onClick={() => setLanguage(option.code)}
                      className="flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-base text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                    >
                      {option.label}
                      {option.code === language && (
                        <RiCheckLine size={14} className="ml-auto text-brand-700" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <MenuLink to="/settings" icon={RiUser3Line} onSelect={dismiss}>
              Profile
            </MenuLink>
            <MenuLink to="/settings" icon={RiSettings3Line} onSelect={dismiss}>
              Account settings
            </MenuLink>
          </div>
          <div className="border-t border-ink-100 p-1.5">
            <MenuLink
              to="/login"
              icon={RiLogoutBoxRLine}
              tone="danger"
              onSelect={() => {
                signOut()
                dismiss()
              }}
            >
              Sign out
            </MenuLink>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  to,
  icon: Icon,
  children,
  tone = 'neutral',
  onSelect,
}: {
  to: string
  icon: RemixiconComponentType
  children: React.ReactNode
  tone?: 'neutral' | 'danger'
  onSelect: () => void
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onSelect}
      className={cn(
        'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-base transition-colors',
        tone === 'danger'
          ? 'text-danger-700 hover:bg-danger-50'
          : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
      )}
    >
      <Icon size={16} className="shrink-0 opacity-70" />
      {children}
    </Link>
  )
}
