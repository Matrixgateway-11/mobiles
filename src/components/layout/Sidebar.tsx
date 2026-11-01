import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { RiArrowDownSLine, RiMenuFoldLine, RiMenuUnfoldLine, RiCloseLine } from '@remixicon/react'
import { navigationFor, type NavItem } from './nav'
import { Logo } from '@/components/ui/Logo'
import { useCurrentAccount, useNetwork, inboxFor } from '@/lib/network'
import { cn } from '@/lib/cn'

function itemIsActive(item: NavItem, pathname: string) {
  if (item.to) return pathname === item.to
  return item.children?.some((child) => pathname.startsWith(child.to)) ?? false
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const { pathname } = useLocation()
  const account = useCurrentAccount()
  const network = useNetwork()
  const navigation = navigationFor(account.role, inboxFor(network, account).length)

  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    navigation
      .flatMap((section) => section.items)
      .filter((item) => item.children && itemIsActive(item, pathname))
      .map((item) => item.label),
  )

  // Opening a page from elsewhere should reveal its group, not leave it buried.
  // Adjusted during render rather than in an effect, so the nav never paints
  // once with the group shut and again with it open.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    const owner = navigation
      .flatMap((section) => section.items)
      .find((item) => item.children?.some((child) => pathname.startsWith(child.to)))
    if (owner && !openGroups.includes(owner.label)) {
      setOpenGroups([...openGroups, owner.label])
    }
  }

  const toggleGroup = (label: string) =>
    setOpenGroups((groups) =>
      groups.includes(label) ? groups.filter((g) => g !== label) : [...groups, label],
    )

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-ink-950 text-white',
          'transition-[width,transform] duration-200 ease-out',
          collapsed ? 'w-16' : 'w-62',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-white/8',
            collapsed ? 'justify-center px-0' : 'justify-between pr-2 pl-4',
          )}
        >
          {collapsed ? (
            <span
              className="inline-flex size-7 items-center justify-center rounded-md bg-brand-600 text-[0.6875rem] font-bold tracking-[0.02em] text-white"
              aria-label="Sai Mobiles"
            >
              SM
            </span>
          ) : (
            <Logo />
          )}

          {!collapsed && (
            <>
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Collapse sidebar"
                className="hidden size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:inline-flex"
              >
                <RiMenuFoldLine size={18} />
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="inline-flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
              >
                <RiCloseLine size={18} />
              </button>
            </>
          )}
        </div>

        <nav className="scrollbar-slim-dark flex-1 overflow-y-auto overflow-x-hidden pb-4">
          {navigation.map((section) => (
            <div key={section.label} className="pt-5 first:pt-3">
              {!collapsed && (
                <p className="px-4 pb-2 text-2xs font-semibold tracking-[0.14em] text-white/30 uppercase">
                  {section.label}
                </p>
              )}
              {collapsed && <div className="mx-3 mb-3 border-t border-white/8 first:hidden" />}

              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    collapsed={collapsed}
                    open={openGroups.includes(item.label)}
                    active={itemIsActive(item, pathname)}
                    onToggle={() => toggleGroup(item.label)}
                    onNavigate={onCloseMobile}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {collapsed && (
          <div className="hidden shrink-0 border-t border-white/8 p-2 lg:block">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Expand sidebar"
              className="inline-flex size-10 w-full items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RiMenuUnfoldLine size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

const ROW =
  'group flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-100'

function SidebarItem({
  item,
  collapsed,
  open,
  active,
  onToggle,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  open: boolean
  active: boolean
  onToggle: () => void
  onNavigate: () => void
}) {
  const Icon = item.icon
  // Collapsed, the submenu is hidden, so anything waiting inside it needs a
  // mark on the parent or it goes unnoticed.
  const waiting = item.badge ?? item.children?.reduce((sum, child) => sum + (child.badge ?? 0), 0) ?? 0

  if (item.to) {
    return (
      <li>
        <NavLink
          to={item.to}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(
              ROW,
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-brand-600/25 font-medium text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]'
                : 'text-white/60 hover:bg-white/6 hover:text-white',
            )
          }
        >
          <span className="relative shrink-0">
            <Icon size={18} className={active ? 'text-brand-300' : 'text-white/45'} />
            {collapsed && waiting > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-brand-500 ring-2 ring-ink-950"
                aria-label={`${waiting} waiting`}
              />
            )}
          </span>
          {!collapsed && (
            <>
              <span className="truncate">{item.label}</span>
              {waiting > 0 && (
                <span
                  className="tnum ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-2xs font-semibold tracking-normal text-white"
                  aria-label={`${waiting} waiting`}
                >
                  {waiting}
                </span>
              )}
            </>
          )}
        </NavLink>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? item.label : undefined}
        aria-expanded={open}
        className={cn(
          ROW,
          collapsed && 'justify-center px-0',
          // Collapsed, the open submenu can't show which section you're in,
          // so the parent carries the active state itself.
          active
            ? cn('text-white', collapsed && 'bg-brand-600/25 font-medium')
            : 'text-white/60 hover:bg-white/6 hover:text-white',
        )}
      >
        <span className="relative shrink-0">
          <Icon size={18} className={cn(active ? 'text-brand-300' : 'text-white/45')} />
          {collapsed && waiting > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-brand-500 ring-2 ring-ink-950"
              aria-label={`${waiting} waiting`}
            />
          )}
        </span>
        {!collapsed && (
          <>
            <span className="truncate text-left">{item.label}</span>
            {waiting > 0 && (
              <span
                className="tnum ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-2xs font-semibold tracking-normal text-white"
                aria-label={`${waiting} waiting`}
              >
                {waiting}
              </span>
            )}
            <RiArrowDownSLine
              size={16}
              className={cn(
                'ml-auto shrink-0 text-white/40 transition-transform duration-150',
                open && 'rotate-180',
              )}
            />
          </>
        )}
      </button>

      {!collapsed && open && item.children && (
        <ul className="mt-0.5 ml-[1.3125rem] space-y-px border-l border-white/12 pl-3">
          {item.children.map((child) => (
            <li key={child.to}>
              <NavLink
                to={child.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-8 items-center rounded-md px-2.5 text-sm transition-colors duration-100',
                    isActive
                      ? 'bg-brand-600/25 font-medium text-white before:absolute before:-left-[0.8125rem] before:h-4 before:w-0.5 before:rounded-full before:bg-brand-400'
                      : 'text-white/55 hover:bg-white/6 hover:text-white',
                  )
                }
              >
                <span className="truncate">{child.label}</span>
                {child.badge ? (
                  <span
                    className="tnum ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-2xs font-semibold tracking-normal text-white"
                    aria-label={`${child.badge} waiting`}
                  >
                    {child.badge}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
