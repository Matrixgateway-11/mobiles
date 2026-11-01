import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react'
import type { RemixiconComponentType } from '@remixicon/react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900',
  secondary:
    'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
  subtle: 'bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300',
  danger:
    'bg-white text-danger-700 border border-danger-200 hover:bg-danger-50 active:bg-danger-100',
}

const SIZES: Record<Size, string> = {
  sm: 'h-7 gap-1.5 px-2.5 text-xs rounded-md',
  md: 'h-9 gap-2 px-3.5 text-base rounded-lg',
  lg: 'h-11 gap-2 px-5 text-md rounded-lg',
}

const ICON_SIZE: Record<Size, number> = { sm: 14, md: 16, lg: 18 }

type ButtonOwnProps = {
  variant?: Variant
  size?: Size
  icon?: RemixiconComponentType
  iconAfter?: RemixiconComponentType
  className?: string
  children?: ReactNode
}

/* Polymorphic: `as={Link}` and `as="a"` carry their own props through. */
type ButtonProps<T extends ElementType> = ButtonOwnProps & { as?: T } & Omit<
    ComponentPropsWithoutRef<T>,
    keyof ButtonOwnProps | 'as'
  >

export function Button<T extends ElementType = 'button'>({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconAfter: IconAfter,
  as,
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType
  return (
    <Component
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap',
        'transition-colors duration-100',
        'disabled:pointer-events-none disabled:opacity-55',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={ICON_SIZE[size]} className="shrink-0" aria-hidden />}
      {children}
      {IconAfter && <IconAfter size={ICON_SIZE[size]} className="shrink-0" aria-hidden />}
    </Component>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: RemixiconComponentType
  label: string
  size?: Size
  variant?: Variant
}

export function IconButton({
  icon: Icon,
  label,
  size = 'md',
  variant = 'secondary',
  className,
  ...props
}: IconButtonProps) {
  const box = size === 'sm' ? 'size-7 rounded-md' : size === 'lg' ? 'size-11 rounded-lg' : 'size-9 rounded-lg'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-colors duration-100',
        'disabled:pointer-events-none disabled:opacity-55',
        VARIANTS[variant],
        box,
        className,
      )}
      {...props}
    >
      <Icon size={ICON_SIZE[size]} aria-hidden />
    </button>
  )
}
