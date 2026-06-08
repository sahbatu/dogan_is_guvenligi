import { cn } from '@/lib/utils'
import { sanitizeRichTextHtml } from '@/lib/rich-text'

interface RichTextContentProps {
  html: string
  className?: string
}

export function RichTextContent({ html, className }: RichTextContentProps) {
  if (!html.trim()) return null

  const safeHtml = sanitizeRichTextHtml(html)

  return (
    <div
      className={cn('rich-text-content', className)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
