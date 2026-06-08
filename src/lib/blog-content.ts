import { isRichTextHtml, normalizeRichTextHtml, sanitizeRichTextHtml } from '@/lib/rich-text'

/** DB'deki content dizisini editör HTML'ine çevirir (eski paragraf formatını destekler). */
export function blogContentToEditorHtml(content: string[]): string {
  if (!content.length) return ''

  if (content.length === 1 && isRichTextHtml(content[0])) {
    return content[0]
  }

  return sanitizeRichTextHtml(content.join('\n\n'))
}

/** Editör HTML'ini DB'ye kaydedilecek formata çevirir. */
export function blogContentFromEditorHtml(html: string): string[] {
  const normalized = normalizeRichTextHtml(html)
  if (!normalized) return []
  return [normalized]
}

/** Ziyaretçi sayfasında gösterilecek HTML. */
export function blogContentForDisplay(content: string[]): string {
  return blogContentToEditorHtml(content)
}
