import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-900">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full resize-none rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-navy-950',
          'placeholder:text-muted/60 transition-all duration-200',
          'focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
