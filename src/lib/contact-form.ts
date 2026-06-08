import { stripHtml } from '@/lib/rich-text'

export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  phone: 11,
  subject: 200,
  message: 5000,
} as const

const PHONE_MIN_DIGITS = 10
const PHONE_MAX_DIGITS = CONTACT_LIMITS.phone

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PHONE_DIGITS_RE = /^\d{10,11}$/

const RATE_LIMIT_KEY = 'contact-form-last-submit'
const RATE_LIMIT_MS = 60_000

export interface ContactFormInput {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  honeypot?: string
}

export interface SanitizedContactForm {
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
}

export function sanitizeContactField(value: string, maxLen: number): string {
  return stripHtml(value)
    .replace(CONTROL_CHARS, '')
    .replace(/\u200B|\uFEFF/g, '')
    .trim()
    .slice(0, maxLen)
}

/** Telefon: yalnızca rakam, en fazla 11 hane (05XX… veya 0XXX…) */
export function normalizeContactPhone(value: string): string {
  return sanitizeContactField(value, PHONE_MAX_DIGITS + 8)
    .replace(/\D/g, '')
    .slice(0, PHONE_MAX_DIGITS)
}

export function validateContactForm(input: ContactFormInput): {
  valid: boolean
  errors: Partial<Record<keyof ContactFormInput, string>>
  sanitized: SanitizedContactForm | null
} {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {}

  if (input.honeypot?.trim()) {
    return { valid: false, errors: {}, sanitized: null }
  }

  const name = sanitizeContactField(input.name, CONTACT_LIMITS.name)
  const email = sanitizeContactField(input.email, CONTACT_LIMITS.email).toLowerCase()
  const phone = normalizeContactPhone(input.phone)
  const subject = sanitizeContactField(input.subject, CONTACT_LIMITS.subject)
  const message = sanitizeContactField(input.message, CONTACT_LIMITS.message)

  if (name.length < 2) errors.name = 'Ad soyad en az 2 karakter olmalıdır.'
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Geçerli bir e-posta adresi girin.'
  if (phone && !PHONE_DIGITS_RE.test(phone)) {
    errors.phone = `Telefon numarası ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} haneli olmalıdır.`
  }
  if (subject.length < 2) errors.subject = 'Konu en az 2 karakter olmalıdır.'
  if (message.length < 10) errors.message = 'Mesaj en az 10 karakter olmalıdır.'

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors, sanitized: null }
  }

  const fullMessage = subject ? `Konu: ${subject}\n\n${message}` : message

  return {
    valid: true,
    errors: {},
    sanitized: {
      name,
      email,
      phone: phone || null,
      subject,
      message: fullMessage.slice(0, CONTACT_LIMITS.message + CONTACT_LIMITS.subject + 20),
    },
  }
}

export function isContactRateLimited(): boolean {
  try {
    const last = localStorage.getItem(RATE_LIMIT_KEY)
    if (!last) return false
    return Date.now() - Number(last) < RATE_LIMIT_MS
  } catch {
    return false
  }
}

export function markContactSubmitted(): void {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}
