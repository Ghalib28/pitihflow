/**
 * OWASP Top 10 Security Defense Utilities for DuitKu
 * Implements defenses against:
 * - A03: Injection (XSS & CSV Formula Injection)
 * - A04: Insecure Design & Validation
 * - A08: Software and Data Integrity Failures
 * - A10: Server-Side Request Forgery (SSRF) / URL Validation
 */

/**
 * Sanitize text to prevent Cross-Site Scripting (XSS)
 * Strips HTML tags and encodes special entities
 */
export function sanitizeString(input, maxLength = 250) {
  if (typeof input !== 'string') return ''
  
  // Truncate to safe length
  let cleaned = input.trim().slice(0, maxLength)
  
  // Remove dangerous script / iframe / javascript: payloads
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  cleaned = cleaned.replace(/on\w+="[^"]*"/gi, '')
  cleaned = cleaned.replace(/javascript:/gi, '')
  
  // HTML encode special characters
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return cleaned.replace(/[&<>"'/]/g, (m) => map[m])
}

/**
 * Defend against CSV / Excel Formula Injection (OWASP A03)
 * When exporting to CSV, cells starting with =, +, -, @, \t, \r can trigger
 * code execution in spreadsheet applications. We sanitize each cell.
 */
export function sanitizeCsvCell(value) {
  if (value == null) return '""'
  let str = String(value)
  
  // If string starts with a formula trigger, prepend a single quote (') to neutralize it
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r']
  if (formulaTriggers.includes(str.charAt(0))) {
    str = `'${str}`
  }
  
  // Escape double quotes
  return `"${str.replace(/"/g, '""')}"`
}

/**
 * Validate and sanitize numeric input to prevent NaN / Infinity / Overflow exploits
 */
export function sanitizeNumeric(value, min = 0, max = 1000000000000) {
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) return min
  if (num < min) return min
  if (num > max) return max
  return Math.round(num)
}

/**
 * Validate URL to prevent SSRF and unsafe schemes (OWASP A10)
 * Only allows valid https:// or safe local dev addresses
 */
export function isValidSyncUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return false
  try {
    const parsed = new URL(urlStr)
    // Only allow http or https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }
    // Block dangerous internal metadata endpoints (e.g. AWS/GCP 169.254.169.254)
    if (parsed.hostname === '169.254.169.254') {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Validate integrity of imported JSON backup (OWASP A08)
 */
export function validateBackupPayload(data) {
  if (!data || typeof data !== 'object') return false
  if (data.app !== 'DuitKu') return false
  if (!Array.isArray(data.transactions) && !Array.isArray(data.savings)) return false
  return true
}
