/**
 * Currency and Number Formatting Utilities for DuitKu
 */

export function formatRupiah(amount) {
  if (amount == null || isNaN(amount)) return 'Rp 0'
  const abs = Math.abs(Math.round(amount))
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${amount < 0 ? '-' : ''}Rp ${formatted}`
}

export function parseCurrencyInput(value) {
  if (!value) return 0
  if (typeof value === 'number') return value
  const cleaned = value.toString().replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

export function formatDateIndo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatTimeIndo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
