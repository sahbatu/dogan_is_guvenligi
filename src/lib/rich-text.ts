import DOMPurify from 'dompurify'

/** Admin girişi ve ziyaretçi sayfasında desteklenen etiketler */
export const RICH_TEXT_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'a',
  'div',
  'span',
  'img',
]

export const RICH_TEXT_ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'class']

export function isRichTextHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value)
}

export function stripHtml(value: string): string {
  if (!value) return ''
  if (typeof document !== 'undefined') {
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim()
  }
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function sanitizeRichTextHtml(value: string): string {
  if (!value.trim()) return ''

  const html = isRichTextHtml(value)
    ? value
    : value
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join('')

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
    ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
  })
}

export function normalizeRichTextHtml(value: string): string {
  const sanitized = sanitizeRichTextHtml(value)
  const textOnly = stripHtml(sanitized)
  if (!textOnly) return ''
  return sanitized
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
