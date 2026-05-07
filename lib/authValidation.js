import { createRequire } from 'module'
import validator from 'validator'

const requireCjs = createRequire(import.meta.url)

// ~120k known disposable inbox domains (mailinator.com, etc.)
const disposableDomains = new Set(requireCjs('disposable-email-domains'))

// RFC 2606 reserved TLDs (and their dotted suffix forms) — must never resolve.
const RESERVED_TLDS = ['test', 'example', 'invalid', 'localhost', 'local']

// Common placeholder / junk domains people use when they don't want to share a
// real address. Not in the disposable list because they're not throwaway inbox
// services — just reserved/test names.
const PLACEHOLDER_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com',
  'asdf.com',
  'qwerty.com',
  'localhost',
  'localhost.com',
  'sample.com',
])

// Tiny built-in weak-password list (lowercase). Catches the most-cracked
// credentials so things like "password123" don't pass our new "must contain
// letters and digits" rule. Keep this short on purpose — full HIBP-style
// checking belongs behind an opt-in feature flag, not in the hot path.
const WEAK_PASSWORDS = new Set([
  'password',
  'password1',
  'password12',
  'password123',
  'password1234',
  'passw0rd',
  'p@ssword',
  'p@ssw0rd',
  'qwerty',
  'qwerty1',
  'qwerty12',
  'qwerty123',
  'qwertyuiop',
  '12345678',
  '123456789',
  '1234567890',
  '12345678910',
  'iloveyou1',
  'iloveyou12',
  'admin123',
  'admin1234',
  'letmein1',
  'welcome1',
  'welcome123',
  'football1',
  'baseball1',
  'monkey123',
  'sunshine1',
  'starwars1',
  'master123',
  'changeme1',
  'changeme123',
  'abc12345',
  '11111111',
  '00000000',
  'asdfghjk',
  'asdfghjkl',
])

const tldOf = (domain) => {
  const parts = String(domain || '').split('.')
  return parts[parts.length - 1] || ''
}

export const isReservedDomain = (domain) => {
  const d = String(domain || '').toLowerCase()
  if (PLACEHOLDER_DOMAINS.has(d)) return true
  return RESERVED_TLDS.includes(tldOf(d))
}

export const isDisposableDomain = (domain) =>
  disposableDomains.has(String(domain || '').toLowerCase())

/**
 * Strict registration-time email check.
 * Allows real-looking addresses, blocks reserved/placeholder/disposable ones.
 *
 * Returns { ok: true, value } or { ok: false, message }.
 */
export const validateRegistrationEmail = (rawEmail) => {
  const value = String(rawEmail ?? '').trim().toLowerCase()
  if (!value) {
    return { ok: false, message: 'Please enter a valid email address' }
  }
  const isSyntaxOk = validator.isEmail(value, {
    require_tld: true,
    allow_ip_domain: false,
    allow_utf8_local_part: false,
  })
  if (!isSyntaxOk) {
    return { ok: false, message: 'Please enter a valid email address' }
  }
  const at = value.lastIndexOf('@')
  const domain = at >= 0 ? value.slice(at + 1) : ''
  if (!domain || domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
    return { ok: false, message: 'Please enter a valid email address' }
  }
  if (isReservedDomain(domain)) {
    return {
      ok: false,
      message: 'Please use a real email address (placeholder domains are not allowed)',
    }
  }
  if (isDisposableDomain(domain)) {
    return {
      ok: false,
      message: 'Disposable email addresses are not allowed. Please use a real inbox.',
    }
  }
  return { ok: true, value }
}

/**
 * Permissive login-time email check. We don't punish users whose accounts
 * predate the stricter rules — only block obvious garbage syntactically.
 */
export const validateLoginEmail = (rawEmail) => {
  const value = String(rawEmail ?? '').trim().toLowerCase()
  if (!value || !validator.isEmail(value)) {
    return { ok: false }
  }
  return { ok: true, value }
}

/**
 * Password rules at registration:
 *   - 8–128 characters
 *   - at least one letter and at least one digit
 *   - not in our small weak-password list
 *   - not equal (case-insensitive) to the user's name or email local-part
 */
export const validateRegistrationPassword = (
  rawPassword,
  { name = '', email = '' } = {},
) => {
  if (rawPassword == null || String(rawPassword).trim() === '') {
    return { ok: false, message: 'Password is required' }
  }
  const pw = String(rawPassword)
  if (pw.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters' }
  }
  if (pw.length > 128) {
    return { ok: false, message: 'Password must be 128 characters or fewer' }
  }
  const hasLetter = /[A-Za-z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  if (!hasLetter || !hasDigit) {
    return {
      ok: false,
      message: 'Password must contain at least one letter and one number',
    }
  }
  const lowered = pw.toLowerCase()
  if (WEAK_PASSWORDS.has(lowered)) {
    return {
      ok: false,
      message: 'That password is too common. Please choose a stronger one.',
    }
  }
  const cleanName = String(name || '').trim().toLowerCase()
  if (cleanName && cleanName.length >= 4 && lowered === cleanName) {
    return {
      ok: false,
      message: 'Password cannot be the same as your name',
    }
  }
  const cleanEmail = String(email || '').trim().toLowerCase()
  const localPart = cleanEmail.split('@')[0] || ''
  if (localPart && localPart.length >= 4 && lowered === localPart) {
    return {
      ok: false,
      message: 'Password cannot be the same as your email',
    }
  }
  return { ok: true }
}
