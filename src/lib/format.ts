const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const inrCompactParts = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 1,
})

/** ₹2,10,68,649.66 — Indian grouping, always two decimals. */
export function money(value: number) {
  return inr.format(value)
}

/** Signed amount for ledgers: +₹1,200.00 / −₹1,200.00 (true minus, not a hyphen). */
export function signedMoney(value: number) {
  const sign = value < 0 ? '−' : '+'
  return `${sign}${inr.format(Math.abs(value))}`
}

/** Axis ticks: 36L, 9L, 1.2Cr — the units Indian finance teams actually read. */
export function compactINR(value: number) {
  if (value === 0) return '0'
  if (Math.abs(value) >= 1e7) return `${inrCompactParts.format(value / 1e7)}Cr`
  if (Math.abs(value) >= 1e5) return `${inrCompactParts.format(value / 1e5)}L`
  if (Math.abs(value) >= 1e3) return `${inrCompactParts.format(value / 1e3)}K`
  return inrCompactParts.format(value)
}

export function count(value: number) {
  return new Intl.NumberFormat('en-IN').format(value)
}

const DATE_FMT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

export function formatDate(iso: string) {
  return DATE_FMT.format(new Date(iso))
}

export function formatTime(iso: string) {
  return TIME_FMT.format(new Date(iso)).toLowerCase()
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)}`
}

/** 50220004842582 → ••••2582 */
export function maskAccount(account: string, visible = 4) {
  return `••••${account.slice(-visible)}`
}
